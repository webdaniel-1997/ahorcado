// Gestión de localStorage para ajustes y estadísticas.

const SETTINGS_KEY = "ahorcado.ajustes";
const STATS_KEY = "ahorcado.estadisticas";

const ESTADISTICAS_BASE = {
    partidas: 0,
    victorias: 0,
    derrotas: 0,
    modos: {
        clasico: { partidas: 0, victorias: 0, derrotas: 0 },
        contrarreloj: { partidas: 0, victorias: 0, derrotas: 0 },
        dos_jugadores: { partidas: 0, victorias: 0, derrotas: 0 }
    },
    mejorTiempoContrarrelojMs: null
};

const AJUSTES_BASE = {
    modo: "clasico",
    categoria: "basico",
    dificultad: "normal",
    tiempoPersonalizado: 70
};

function leerClave(clave, base) {
    if (typeof localStorage === "undefined") return { ...base };
    try {
        const data = localStorage.getItem(clave);
        if (!data) return { ...base };
        return { ...base, ...JSON.parse(data) };
    } catch (e) {
        console.warn("No se pudo leer localStorage", e);
        return { ...base };
    }
}

function guardarClave(clave, valor) {
    if (typeof localStorage === "undefined") return;
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch (e) {
        console.warn("No se pudo guardar en localStorage", e);
    }
}

export function cargarAjustes() {
    return leerClave(SETTINGS_KEY, AJUSTES_BASE);
}

export function guardarAjustes(ajustes) {
    guardarClave(SETTINGS_KEY, ajustes);
}

export function cargarEstadisticas() {
    return leerClave(STATS_KEY, ESTADISTICAS_BASE);
}

export function guardarEstadisticas(stats) {
    guardarClave(STATS_KEY, stats);
}

export function resetEstadisticas() {
    guardarEstadisticas({ ...ESTADISTICAS_BASE });
    return { ...ESTADISTICAS_BASE };
}

export function registrarResultado(stats, state, victoria, tiempoEmpleadoMs = null) {
    const copia = JSON.parse(JSON.stringify(stats || ESTADISTICAS_BASE));
    const modo = state?.modo || "clasico";

    copia.partidas += 1;
    if (!copia.modos[modo]) {
        copia.modos[modo] = { partidas: 0, victorias: 0, derrotas: 0 };
    }
    copia.modos[modo].partidas += 1;

    if (victoria) {
        copia.victorias += 1;
        copia.modos[modo].victorias += 1;
        if (modo === "contrarreloj" && typeof tiempoEmpleadoMs === "number") {
            if (copia.mejorTiempoContrarrelojMs === null || tiempoEmpleadoMs < copia.mejorTiempoContrarrelojMs) {
                copia.mejorTiempoContrarrelojMs = tiempoEmpleadoMs;
            }
        }
    } else {
        copia.derrotas += 1;
        copia.modos[modo].derrotas += 1;
    }

    guardarEstadisticas(copia);
    return copia;
}
