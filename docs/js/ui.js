// Manejo del DOM y renderizado de la interfaz
import { obtenerPalabraVisible, progresoVidas, tiempoRestanteTexto } from "./gameEngine.js";

const refs = {};
let callbacks = {};
let tecladoLetras = [];

export function initUI(on, ajustes) {
    callbacks = on;
    capturarRefs();
    prepararTeclado();
    vincularEventos();
    hidratarAjustes(ajustes);
}

function capturarRefs() {
    refs.btnNueva = document.getElementById("btnNueva");
    refs.btnResetStats = document.getElementById("btnResetStats");
    refs.btnPista = document.getElementById("btnPista");
    refs.btnResolver = document.getElementById("btnResolver");
    refs.modoSelect = document.getElementById("modoSelect");
    refs.categoriaSelect = document.getElementById("categoriaSelect");
    refs.dificultadSelect = document.getElementById("dificultadSelect");
    refs.tiempoInput = document.getElementById("tiempoInput");
    refs.campoTiempo = document.getElementById("campoTiempo");
    refs.palabraInput = document.getElementById("palabraInput");
    refs.campoPalabra = document.getElementById("campoPalabra");
    refs.palabraOculta = document.getElementById("palabraOculta");
    refs.mensajePrincipal = document.getElementById("mensajePrincipal");
    refs.estadoPartida = document.getElementById("estadoPartida");
    refs.teclado = document.getElementById("teclado");
    refs.vidasTexto = document.getElementById("vidasTexto");
    refs.barraVidas = document.getElementById("barraVidas");
    refs.tiempoTexto = document.getElementById("tiempoTexto");
    refs.barraTiempo = document.getElementById("barraTiempo");
    refs.bloqueTiempo = document.getElementById("bloqueTiempo");
    refs.resolverInput = document.getElementById("resolverInput");
    refs.ariaEstado = document.getElementById("ariaEstado");
    refs.statPartidas = document.getElementById("statPartidas");
    refs.statVictorias = document.getElementById("statVictorias");
    refs.statDerrotas = document.getElementById("statDerrotas");
    refs.statMejorTiempo = document.getElementById("statMejorTiempo");
    refs.statModos = document.getElementById("statModos");
}

function prepararTeclado() {
    const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
    tecladoLetras = letras;
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
    refs.btnResolver?.addEventListener("click", () => {
        callbacks.onResolver?.(refs.resolverInput.value);
    });
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
        if (tecladoLetras.includes(letra)) {
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

export function actualizarUI(state) {
    if (!state) return;
    refs.palabraOculta.textContent = obtenerPalabraVisible(state);
    refs.vidasTexto.textContent = `${state.intentosRestantes}/${state.vidasIniciales}`;
    refs.barraVidas.style.width = `${progresoVidas(state)}%`;
    refs.estadoPartida.textContent = traducirEstado(state.estado);
    refs.teclado.querySelectorAll(".tecla").forEach(btn => {
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
    actualizarPartesAhorcado(state);
    anunciarEstado(state);
}

function alternarMensaje(state) {
    const mensaje = refs.mensajePrincipal;
    mensaje.className = "mensaje";
    if (state.estado === "victoria") {
        mensaje.textContent = "¡Has ganado!";
        mensaje.classList.add("exito");
    } else if (state.estado === "derrota") {
        mensaje.textContent = "Has perdido. La palabra era " + state.palabraSecreta + ".";
        mensaje.classList.add("error");
        refs.palabraOculta.textContent = state.palabraSecreta.split("").join(" ");
    } else {
        mensaje.textContent = "Adivina la palabra antes de quedarte sin vidas.";
    }
}

function actualizarPartesAhorcado(state) {
    const partes = Array.from(document.querySelectorAll(".parte"));
    const errores = state.vidasIniciales - state.intentosRestantes;
    partes.forEach((parte, idx) => {
        parte.classList.toggle("visible", idx < errores);
    });
}

export function actualizarEstadisticas(stats) {
    if (!stats) return;
    refs.statPartidas.textContent = stats.partidas;
    refs.statVictorias.textContent = stats.victorias;
    refs.statDerrotas.textContent = stats.derrotas;
    refs.statMejorTiempo.textContent = stats.mejorTiempoContrarrelojMs == null
        ? "--"
        : formatearTiempo(stats.mejorTiempoContrarrelojMs);

    const modos = stats.modos || {};
    const chips = Object.entries(modos).map(([modo, data]) => {
        return `<span class="etiqueta">${traducirModo(modo)}: ${data.victorias || 0} / ${data.partidas || 0}</span>`;
    });
    refs.statModos.innerHTML = chips.join(" ");
}

function traducirEstado(estado) {
    switch (estado) {
        case "victoria": return "Victoria";
        case "derrota": return "Derrota";
        default: return "En curso";
    }
}

function traducirModo(modo) {
    switch (modo) {
        case "contrarreloj": return "Contrarreloj";
        case "dos_jugadores": return "Dos jugadores";
        default: return "Clásico";
    }
}

function formatearTiempo(ms) {
    const segundos = Math.round(ms / 1000);
    const m = Math.floor(segundos / 60).toString().padStart(2, "0");
    const s = (segundos % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
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

export function limpiarCamposParaJuego() {
    refs.palabraInput.value = "";
    limpiarResolver();
    refs.teclado.querySelectorAll(".tecla").forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("acierto", "fallo");
    });
}

export function desactivarAccionesFin() {
    refs.btnPista.disabled = true;
    refs.btnResolver.disabled = true;
    refs.teclado.querySelectorAll(".tecla").forEach(btn => btn.disabled = true);
}

export function reactivarAcciones() {
    refs.btnPista.disabled = false;
    refs.btnResolver.disabled = false;
    refs.teclado.querySelectorAll(".tecla").forEach(btn => btn.disabled = false);
}

export function notificarResultado(mensaje) {
    refs.mensajePrincipal.textContent = mensaje;
}
