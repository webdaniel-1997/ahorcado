// Gestion de almacenamiento local (ajustes, estadisticas, logros, racha diaria)

const SETTINGS_KEY = "ahorcado.ajustes";
const STATS_KEY = "ahorcado.estadisticas";
const LOGROS_KEY = "ahorcado.logros";
const DAILY_KEY = "ahorcado.diario";

const AJUSTES_BASE = {
    modo: "clasico",
    categoria: "basico",
    dificultad: "normal",
    tiempoPersonalizado: 70,
    tema: "oscuro"
};

const ESTADISTICAS_BASE = {
    partidas: 0,
    victorias: 0,
    derrotas: 0,
    modos: {
        clasico: { partidas: 0, victorias: 0, derrotas: 0 },
        contrarreloj: { partidas: 0, victorias: 0, derrotas: 0 },
        dos_jugadores: { partidas: 0, victorias: 0, derrotas: 0 },
        palabra_dia: { partidas: 0, victorias: 0, derrotas: 0 }
    },
    mejorTiempoMs: null,
    mejorRachaDiaria: 0,
    rachaDiaria: 0,
    historial: []
};

const LOGROS_BASE = {};
const DAILY_BASE = { ultimaFecha: null, racha: 0 };

function leerClave(clave, base) {
    if (typeof localStorage === "undefined") return estructurar(base);
    try {
        const data = localStorage.getItem(clave);
        if (!data) return estructurar(base);
        return { ...estructurar(base), ...JSON.parse(data) };
    } catch (e) {
        return estructurar(base);
    }
}

function guardarClave(clave, valor) {
    if (typeof localStorage === "undefined") return;
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch (e) {
        // ignoramos fallos de cuota
    }
}

function estructurar(base) {
    return JSON.parse(JSON.stringify(base));
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

export function cargarLogros(baseLogros) {
    const base = baseLogros || LOGROS_BASE;
    return leerClave(LOGROS_KEY, base);
}

export function guardarLogros(logros) {
    guardarClave(LOGROS_KEY, logros);
}

export function cargarDaily() {
    return leerClave(DAILY_KEY, DAILY_BASE);
}

export function guardarDaily(data) {
    guardarClave(DAILY_KEY, data);
}

export function resetTodo(baseLogros) {
    const logros = estructurar(baseLogros || LOGROS_BASE);
    guardarEstadisticas(ESTADISTICAS_BASE);
    guardarLogros(logros);
    guardarDaily(DAILY_BASE);
    return {
        stats: estructurar(ESTADISTICAS_BASE),
        logros,
        daily: estructurar(DAILY_BASE)
    };
}

export function registrarResultado(stats, resumen, dailyData) {
    const nuevo = estructurar({ ...ESTADISTICAS_BASE, ...stats });
    const modoKey = resumen.modo || "clasico";
    if (!nuevo.modos[modoKey]) nuevo.modos[modoKey] = { partidas: 0, victorias: 0, derrotas: 0 };

    nuevo.partidas += 1;
    nuevo.modos[modoKey].partidas += 1;

    if (resumen.victoria) {
        nuevo.victorias += 1;
        nuevo.modos[modoKey].victorias += 1;
        if (resumen.modo === "contrarreloj") {
            const t = resumen.tiempoJugadoMs;
            if (typeof t === "number") {
                if (nuevo.mejorTiempoMs === null || t < nuevo.mejorTiempoMs) {
                    nuevo.mejorTiempoMs = t;
                }
            }
        }
    } else {
        nuevo.derrotas += 1;
        nuevo.modos[modoKey].derrotas += 1;
    }

    if (dailyData) {
        nuevo.rachaDiaria = dailyData.racha;
        if (dailyData.racha > (nuevo.mejorRachaDiaria || 0)) {
            nuevo.mejorRachaDiaria = dailyData.racha;
        }
    }

    const entrada = {
        fecha: resumen.fechaISO,
        modo: resumen.modo,
        categoria: resumen.categoria,
        dificultad: resumen.dificultad,
        resultado: resumen.victoria ? "Victoria" : "Derrota",
        tiempoMs: resumen.tiempoJugadoMs,
        palabraDiaria: resumen.palabraDiaria
    };
    nuevo.historial.push(entrada);
    if (nuevo.historial.length > 20) {
        nuevo.historial = nuevo.historial.slice(-20);
    }

    guardarEstadisticas(nuevo);
    return nuevo;
}
