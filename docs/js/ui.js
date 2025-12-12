import { obtenerPalabraVisible, progresoVidas, tiempoRestanteTexto, partesDisponibles, calcularErrores } from "./gameEngine.js";
import { listadoLogros } from "./achievements.js";

const refs = {};
let callbacks = {};
let letrasTeclado = [];
let ultimoErrores = 0;

export function initUI(on, ajustes, tema, dailyData, logrosGuardados) {
    callbacks = on;
    capturarRefs();
    prepararTeclado();
    vincularEventos();
    aplicarTema(tema || "oscuro");
    hidratarAjustes(ajustes);
    actualizarDailyInfo(dailyData);
    renderLogros(logrosGuardados || {});
}

function capturarRefs() {
    const ids = [
        "btnNueva", "btnResetStats", "btnPista", "btnResolver", "btnTema",
        "modoSelect", "categoriaSelect", "dificultadSelect", "tiempoInput", "palabraInput",
        "campoTiempo", "campoPalabra", "palabraOculta", "mensajePrincipal", "estadoPartida",
        "teclado", "vidasTexto", "barraVidas", "tiempoTexto", "barraTiempo", "bloqueTiempo",
        "resolverInput", "ariaEstado", "statPartidas", "statVictorias", "statDerrotas", "statMejorTiempo", "statMejorRacha",
        "statModos", "listaLogros", "historialCuerpo", "infoDiaria", "svgWrapper"
    ];
    ids.forEach(id => refs[id] = document.getElementById(id));
}

function prepararTeclado() {
    const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
    letrasTeclado = letras;
    refs.teclado.innerHTML = "";
    letras.forEach(letra => {
        const btn = document.createElement("button");
        btn.className = "tecla";
        btn.textContent = letra;
        btn.dataset.letra = letra;
        btn.addEventListener("click", () => callbacks.onLetra?.(letra));
        btn.addEventListener("keydown", e => e.preventDefault());
        refs.teclado.appendChild(btn);
    });
}

function vincularEventos() {
    refs.btnNueva?.addEventListener("click", () => callbacks.onNuevaPartida?.());
    refs.btnResetStats?.addEventListener("click", () => callbacks.onResetStats?.());
    refs.btnPista?.addEventListener("click", () => callbacks.onPista?.());
    refs.btnResolver?.addEventListener("click", () => callbacks.onResolver?.(refs.resolverInput.value));
    refs.btnTema?.addEventListener("click", () => callbacks.onToggleTema?.());

    refs.resolverInput?.addEventListener("keydown", ev => {
        if (ev.key === "Enter") {
            callbacks.onResolver?.(refs.resolverInput.value);
        }
    });
    refs.modoSelect?.addEventListener("change", gestionarVisibilidadCampos);

    document.addEventListener("keydown", (ev) => {
        if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
        if (document.activeElement === refs.resolverInput) return;
        const letra = (ev.key || "").toUpperCase();
        if (letrasTeclado.includes(letra)) {
            callbacks.onLetra?.(letra);
        }
    });
}

function hidratarAjustes(ajustes) {
    if (!ajustes) return;
    refs.modoSelect.value = ajustes.modo || "clasico";
    refs.categoriaSelect.value = ajustes.categoria || "basico";
    refs.dificultadSelect.value = ajustes.dificultad || "normal";
    refs.tiempoInput.value = ajustes.tiempoPersonalizado || 70;
    gestionarVisibilidadCampos();
}

function gestionarVisibilidadCampos() {
    const modo = refs.modoSelect.value;
    refs.campoTiempo.hidden = modo !== "contrarreloj";
    refs.campoPalabra.hidden = modo !== "dos_jugadores";
}

export function obtenerConfigFormulario() {
    return {
        modo: refs.modoSelect.value,
        categoria: refs.categoriaSelect.value,
        dificultad: refs.dificultadSelect.value,
        tiempoPersonalizado: Number(refs.tiempoInput.value) || 0,
        palabraPersonalizada: refs.palabraInput.value
    };
}

export function limpiarResolver() {
    if (refs.resolverInput) refs.resolverInput.value = "";
}

export function renderEstado(state) {
    if (!state) return;
    refs.palabraOculta.textContent = obtenerPalabraVisible(state);
    refs.vidasTexto.textContent = `${state.intentosRestantes}/${state.vidasIniciales}`;
    refs.barraVidas.style.width = `${progresoVidas(state)}%`;
    refs.estadoPartida.textContent = traducirEstado(state.estado);

    const botones = refs.teclado.querySelectorAll(".tecla");
    botones.forEach(btn => {
        const letra = btn.dataset.letra;
        const usada = state.letrasAdivinadas.includes(letra) || state.letrasFalladas.includes(letra);
        btn.disabled = state.estado !== "en_curso" || usada;
        btn.classList.toggle("acierto", state.letrasAdivinadas.includes(letra));
        btn.classList.toggle("fallo", state.letrasFalladas.includes(letra));
    });

    refs.bloqueTiempo.style.display = state.modo === "contrarreloj" ? "block" : "none";
    if (state.modo === "contrarreloj") {
        refs.tiempoTexto.textContent = tiempoRestanteTexto(state);
        const porcentaje = state.tiempoLimiteMs ? Math.max(0, Math.min(100, (state.tiempoRestanteMs / state.tiempoLimiteMs) * 100)) : 0;
        refs.barraTiempo.style.width = `${porcentaje}%`;
    }

    alternarMensaje(state);
    actualizarPartes(state);
    anunciarEstado(state);
    ultimoErrores = calcularErrores(state);
}

function alternarMensaje(state) {
    const mensaje = refs.mensajePrincipal;
    mensaje.className = "mensaje";
    if (state.estado === "victoria") {
        mensaje.textContent = "Has ganado";
        mensaje.classList.add("exito");
    } else if (state.estado === "derrota") {
        mensaje.textContent = "Has perdido. La palabra era " + state.palabraSecreta + ".";
        mensaje.classList.add("error");
        refs.palabraOculta.textContent = state.palabraSecreta.split("").join(" ");
    } else {
        mensaje.textContent = "Adivina la palabra antes de quedarte sin vidas.";
    }
}

function actualizarPartes(state) {
    const totalPartes = partesDisponibles(state);
    const errores = calcularErrores(state);
    const partes = ["parte-1","parte-2","parte-3","parte-4","parte-5","parte-6"]
        .map(id => document.getElementById(id))
        .filter(Boolean);
    partes.forEach((parte, idx) => {
        const visible = idx < Math.min(partes.length, errores);
        parte.classList.toggle("visible", visible);
    });
    if (refs.svgWrapper && errores > ultimoErrores) {
        refs.svgWrapper.classList.add("shake-once");
        setTimeout(() => refs.svgWrapper.classList.remove("shake-once"), 400);
    }
}

function traducirEstado(estado) {
    switch (estado) {
        case "victoria": return "Victoria";
        case "derrota": return "Derrota";
        default: return "En curso";
    }
}

function anunciarEstado(state) {
    if (!refs.ariaEstado) return;
    if (state.estado === "victoria") {
        refs.ariaEstado.textContent = "Has ganado";
    } else if (state.estado === "derrota") {
        refs.ariaEstado.textContent = "Has perdido";
    } else {
        refs.ariaEstado.textContent = `Te quedan ${state.intentosRestantes} vidas`;
    }
}

export function renderEstadisticas(stats) {
    if (!stats) return;
    refs.statPartidas.textContent = stats.partidas;
    refs.statVictorias.textContent = stats.victorias;
    refs.statDerrotas.textContent = stats.derrotas;
    refs.statMejorTiempo.textContent = stats.mejorTiempoMs == null ? "--" : formatearTiempo(stats.mejorTiempoMs);
    refs.statMejorRacha.textContent = stats.mejorRachaDiaria || 0;

    const modos = stats.modos || {};
    const chips = Object.entries(modos).map(([modo, data]) => {
        return `<span class="etiqueta">${traducirModo(modo)}: ${data.victorias || 0} / ${data.partidas || 0}</span>`;
    });
    refs.statModos.innerHTML = chips.join(" ");
    renderHistorial(stats.historial || []);
}

export function renderHistorial(historial) {
    if (!refs.historialCuerpo) return;
    if (!historial.length) {
        refs.historialCuerpo.innerHTML = `<tr><td colspan="6">Sin partidas registradas</td></tr>`;
        return;
    }
    const filas = historial.slice().reverse().map(item => {
        const fecha = (item.fecha || "").replace("T", " ").slice(0,16);
        const tiempo = item.tiempoMs != null ? formatearTiempo(item.tiempoMs) : "--";
        const badge = item.palabraDiaria ? "<span class=\"etiqueta\">Dia</span>" : "";
        return `<tr><td>${fecha}</td><td>${traducirModo(item.modo)} ${badge}</td><td>${item.categoria}</td><td>${item.dificultad}</td><td>${item.resultado}</td><td>${tiempo}</td></tr>`;
    });
    refs.historialCuerpo.innerHTML = filas.join("");
}

export function renderLogros(logros) {
    if (!refs.listaLogros) return;
    const defs = listadoLogros();
    const html = defs.map(def => {
        const estado = logros?.[def.id]?.desbloqueado;
        return `<div class="logro ${estado ? "desbloqueado" : "pendiente"}">
            <div class="icono">${estado ? "★" : "☆"}</div>
            <div class="texto">
                <p class="titulo">${def.titulo}</p>
                <p class="desc">${def.descripcion}</p>
            </div>
        </div>`;
    }).join("");
    refs.listaLogros.innerHTML = html;
}

export function actualizarDailyInfo(dailyData) {
    if (!refs.infoDiaria) return;
    if (!dailyData) {
        refs.infoDiaria.textContent = "Racha diaria: --";
        return;
    }
    const fecha = dailyData.ultimaFecha ? `Ultima: ${dailyData.ultimaFecha}` : "";
    refs.infoDiaria.textContent = `Racha diaria: ${dailyData.racha || 0} ${fecha}`;
}

export function aplicarTema(tema) {
    const body = document.body;
    body.classList.remove("theme-dark", "theme-light");
    body.classList.add(tema === "claro" ? "theme-light" : "theme-dark");
    if (refs.btnTema) {
        refs.btnTema.textContent = `Tema: ${tema === "claro" ? "Claro" : "Oscuro"}`;
    }
}

export function desactivarAccionesFin() {
    refs.btnPista.disabled = true;
    refs.btnResolver.disabled = true;
    refs.teclado.querySelectorAll(".tecla").forEach(btn => btn.disabled = true);
}

export function reactivarAcciones() {
    refs.btnPista.disabled = false;
    refs.btnResolver.disabled = false;
    refs.teclado.querySelectorAll(".tecla").forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("acierto", "fallo");
    });
}

export function setMensaje(texto) {
    refs.mensajePrincipal.textContent = texto;
}

function formatearTiempo(ms) {
    const segundos = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(segundos / 60).toString().padStart(2, "0");
    const s = (segundos % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

function traducirModo(modo) {
    switch (modo) {
        case "contrarreloj": return "Contrarreloj";
        case "dos_jugadores": return "Dos jugadores";
        case "palabra_dia": return "Palabra del dia";
        default: return "Clasico";
    }
}
