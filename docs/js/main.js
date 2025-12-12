import {
    nuevaPartida,
    intentarLetra,
    usarPista,
    resolverPalabra,
    actualizarTiempo,
    ESTADOS,
    MODOS
} from "./gameEngine.js";
import {
    cargarAjustes,
    guardarAjustes,
    cargarEstadisticas,
    registrarResultado,
    resetEstadisticas
} from "./storage.js";
import {
    initUI,
    obtenerConfigFormulario,
    actualizarUI,
    limpiarResolver,
    limpiarCamposParaJuego,
    actualizarEstadisticas,
    desactivarAccionesFin,
    reactivarAcciones,
    notificarResultado
} from "./ui.js";

let estadoActual = null;
let intervaloTiempo = null;
let ajustes = cargarAjustes();
let estadisticas = cargarEstadisticas();

function iniciar() {
    initUI({
        onNuevaPartida: nuevaPartidaUI,
        onLetra: manejarLetra,
        onPista: manejarPista,
        onResolver: manejarResolver,
        onResetStats: manejarResetStats
    }, ajustes);
    actualizarEstadisticas(estadisticas);
    nuevaPartidaUI();
}

function nuevaPartidaUI() {
    const config = obtenerConfigFormulario();
    ajustes = { ...ajustes, ...config };
    guardarAjustes(ajustes);

    const palabraValida = config.modo !== MODOS.DOS_JUGADORES || (config.palabraPersonalizada && config.palabraPersonalizada.trim());
    if (!palabraValida) {
        notificarResultado("Introduce una palabra para el modo de dos jugadores.");
        return;
    }

    estadoActual = nuevaPartida(config);
    limpiarCamposParaJuego();
    reactivarAcciones();
    actualizarUI(estadoActual);
    limpiarResolver();
    detenerTemporizador();
    if (estadoActual.modo === MODOS.CONTRARRELOJ) {
        iniciarTemporizador();
    }
}

function manejarLetra(letra) {
    if (!estadoActual || estadoActual.estado !== ESTADOS.EN_CURSO) return;
    intentarLetra(estadoActual, letra);
    actualizarUI(estadoActual);
    comprobarFin();
}

function manejarPista() {
    if (!estadoActual || estadoActual.estado !== ESTADOS.EN_CURSO) return;
    const res = usarPista(estadoActual);
    if (res.tipo === "sin_vidas") {
        notificarResultado("Necesitas al menos 2 vidas para pedir pista.");
    }
    actualizarUI(estadoActual);
    comprobarFin();
}

function manejarResolver(palabra) {
    if (!estadoActual || estadoActual.estado !== ESTADOS.EN_CURSO) return;
    const res = resolverPalabra(estadoActual, palabra);
    if (res.tipo === "invalida") {
        notificarResultado("Escribe una palabra válida para resolver.");
    }
    limpiarResolver();
    actualizarUI(estadoActual);
    comprobarFin();
}

function iniciarTemporizador() {
    detenerTemporizador();
    intervaloTiempo = setInterval(() => {
        actualizarTiempo(estadoActual, Date.now());
        actualizarUI(estadoActual);
        if (estadoActual.estado !== ESTADOS.EN_CURSO) {
            comprobarFin();
        }
    }, 1000);
}

function detenerTemporizador() {
    if (intervaloTiempo) {
        clearInterval(intervaloTiempo);
        intervaloTiempo = null;
    }
}

function comprobarFin() {
    if (!estadoActual || estadoActual.estado === ESTADOS.EN_CURSO) return;
    detenerTemporizador();
    desactivarAccionesFin();

    const victoria = estadoActual.estado === ESTADOS.VICTORIA;
    const tiempoEmpleado = estadoActual.tiempoLimiteMs ? estadoActual.tiempoLimiteMs - estadoActual.tiempoRestanteMs : null;
    estadisticas = registrarResultado(estadisticas, estadoActual, victoria, tiempoEmpleado);
    actualizarEstadisticas(estadisticas);
}

function manejarResetStats() {
    estadisticas = resetEstadisticas();
    actualizarEstadisticas(estadisticas);
}

window.addEventListener("DOMContentLoaded", iniciar);
