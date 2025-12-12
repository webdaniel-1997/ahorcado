import {
    nuevaPartida,
    intentarLetra,
    usarPista,
    resolverPalabra,
    actualizarTiempo,
    ESTADOS,
    MODOS,
    crearResumen
} from "./gameEngine.js";
import {
    cargarAjustes,
    guardarAjustes,
    cargarEstadisticas,
    registrarResultado,
    cargarLogros,
    guardarLogros,
    resetTodo,
    cargarDaily,
    guardarDaily
} from "./storage.js";
import {
    initUI,
    obtenerConfigFormulario,
    renderEstado,
    renderEstadisticas,
    renderLogros,
    renderHistorial,
    actualizarDailyInfo,
    aplicarTema,
    limpiarResolver,
    reactivarAcciones,
    desactivarAccionesFin,
    setMensaje
} from "./ui.js";
import { evaluarLogros, logrosBase } from "./achievements.js";
import { obtenerPalabraDelDia, actualizarRachaDiaria, dataDiariaBase } from "./dailyWord.js";

let estadoActual = null;
let temporizador = null;
let ajustes = cargarAjustes();
let estadisticas = cargarEstadisticas();
let logros = cargarLogros(logrosBase());
let dailyData = cargarDaily();

function iniciar() {
    initUI({
        onNuevaPartida: nuevaPartidaUI,
        onLetra: manejarLetra,
        onPista: manejarPista,
        onResolver: manejarResolver,
        onResetStats: manejarReset,
        onToggleTema: toggleTema
    }, ajustes, ajustes.tema, dailyData, logros);
    renderEstadisticas(estadisticas);
    renderLogros(logros);
    renderHistorial(estadisticas.historial || []);
    actualizarDailyInfo(dailyData);
    nuevaPartidaUI();
}

function nuevaPartidaUI() {
    const config = obtenerConfigFormulario();
    ajustes = { ...ajustes, ...config };
    guardarAjustes(ajustes);

    if (config.modo === MODOS.DOS_JUGADORES && !config.palabraPersonalizada) {
        setMensaje("Introduce una palabra para el modo de dos jugadores.");
        return;
    }

    if (config.modo === MODOS.PALABRA_DIA) {
        config.palabraFija = obtenerPalabraDelDia(config.categoria);
    }

    estadoActual = nuevaPartida(config);
    limpiarResolver();
    reactivarAcciones();
    renderEstado(estadoActual);
    setMensaje("Adivina la palabra antes de quedarte sin vidas.");
    detenerTemporizador();
    if (estadoActual.modo === MODOS.CONTRARRELOJ) {
        iniciarTemporizador();
    }
}

function manejarLetra(letra) {
    if (!estadoActual || estadoActual.estado !== ESTADOS.EN_CURSO) return;
    intentarLetra(estadoActual, letra);
    renderEstado(estadoActual);
    comprobarFin();
}

function manejarPista() {
    if (!estadoActual || estadoActual.estado !== ESTADOS.EN_CURSO) return;
    const res = usarPista(estadoActual);
    if (res.tipo === "sin_vidas") setMensaje("Necesitas al menos 2 vidas para pedir pista.");
    renderEstado(estadoActual);
    comprobarFin();
}

function manejarResolver(palabra) {
    if (!estadoActual || estadoActual.estado !== ESTADOS.EN_CURSO) return;
    const res = resolverPalabra(estadoActual, palabra);
    if (res.tipo === "invalida") setMensaje("Escribe una palabra valida para resolver.");
    limpiarResolver();
    renderEstado(estadoActual);
    comprobarFin();
}

function iniciarTemporizador() {
    detenerTemporizador();
    temporizador = setInterval(() => {
        actualizarTiempo(estadoActual, Date.now());
        renderEstado(estadoActual);
        if (estadoActual.estado !== ESTADOS.EN_CURSO) {
            comprobarFin();
        }
    }, 800);
}

function detenerTemporizador() {
    if (temporizador) {
        clearInterval(temporizador);
        temporizador = null;
    }
}

function comprobarFin() {
    if (!estadoActual || estadoActual.estado === ESTADOS.EN_CURSO) return;
    detenerTemporizador();
    desactivarAccionesFin();

    const resumen = crearResumen(estadoActual);
    if (estadoActual.modo === MODOS.PALABRA_DIA) {
        dailyData = actualizarRachaDiaria(dailyData || dataDiariaBase(), resumen.victoria, resumen.fechaISO.slice(0,10));
        guardarDaily(dailyData);
        actualizarDailyInfo(dailyData);
    }

    estadisticas = registrarResultado(estadisticas, resumen, dailyData);
    const evaluado = evaluarLogros(logros, resumen, estadisticas.historial, dailyData);
    logros = evaluado.logros;
    guardarLogros(logros);

    renderEstadisticas(estadisticas);
    renderLogros(logros);
    renderHistorial(estadisticas.historial || []);
}

function manejarReset() {
    const res = resetTodo(logrosBase());
    estadisticas = res.stats;
    logros = res.logros;
    dailyData = res.daily;
    guardarAjustes(ajustes);
    renderEstadisticas(estadisticas);
    renderLogros(logros);
    actualizarDailyInfo(dailyData);
    setMensaje("Estadisticas y logros reiniciados.");
}

function toggleTema() {
    const nuevo = ajustes.tema === "claro" ? "oscuro" : "claro";
    ajustes.tema = nuevo;
    guardarAjustes(ajustes);
    aplicarTema(nuevo);
}

window.addEventListener("DOMContentLoaded", iniciar);
