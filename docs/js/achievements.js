// Logica de logros para el ahorcado

const DEFINICIONES = [
    {
        id: "primera_victoria",
        titulo: "Primera victoria",
        descripcion: "Gana tu primera partida",
        check: ({ resumen }) => resumen.victoria
    },
    {
        id: "perfecto",
        titulo: "Perfecto",
        descripcion: "Gana sin perder vidas",
        check: ({ resumen }) => resumen.victoria && resumen.intentosRestantes === resumen.vidasIniciales
    },
    {
        id: "dificil_sin_pistas",
        titulo: "Dificil sin pistas",
        descripcion: "Gana en dificil sin pedir pista",
        check: ({ resumen }) => resumen.victoria && resumen.dificultad === "dificil" && resumen.pistasUsadas === 0
    },
    {
        id: "tres_victorias_seguidas",
        titulo: "Tres victorias seguidas",
        descripcion: "Encadena tres victorias consecutivas",
        check: ({ historial }) => {
            const ultimos = (historial || []).slice(-3);
            return ultimos.length === 3 && ultimos.every(h => h.resultado === "Victoria");
        }
    },
    {
        id: "velocista",
        titulo: "Velocista",
        descripcion: "Gana en contrarreloj con mas de 20s restantes",
        check: ({ resumen }) => resumen.victoria && resumen.modo === "contrarreloj" && (resumen.tiempoRestanteMs || 0) > 20000
    },
    {
        id: "racha_diaria",
        titulo: "Racha diaria",
        descripcion: "Gana 3 palabras del dia seguidas",
        check: ({ resumen, daily }) => resumen.palabraDiaria && resumen.victoria && (daily?.racha || 0) >= 3
    },
    {
        id: "maraton",
        titulo: "Maraton",
        descripcion: "Juega 5 partidas en el mismo dia",
        check: ({ historial }) => {
            const hoy = new Date().toISOString().slice(0,10);
            const delDia = (historial || []).filter(h => (h.fecha || "").startsWith(hoy));
            return delDia.length >= 5;
        }
    }
];

export function logrosBase() {
    const base = {};
    DEFINICIONES.forEach(def => {
        base[def.id] = { desbloqueado: false, fecha: null };
    });
    return base;
}

export function evaluarLogros(logrosPrevios, resumen, historial, dailyData) {
    const actuales = { ...logrosPrevios };
    const nuevos = [];
    const contexto = { resumen, historial, daily: dailyData };

    DEFINICIONES.forEach(def => {
        const ya = actuales[def.id]?.desbloqueado;
        if (ya) return;
        if (def.check(contexto)) {
            actuales[def.id] = { desbloqueado: true, fecha: resumen.fechaISO };
            nuevos.push(def);
        }
    });

    return { logros: actuales, nuevos };
}

export function listadoLogros() {
    return DEFINICIONES;
}
