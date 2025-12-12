// Lógica central del juego del Ahorcado (sin DOM)

export const MODOS = {
    CLASICO: "clasico",
    CONTRARRELOJ: "contrarreloj",
    DOS_JUGADORES: "dos_jugadores",
    PALABRA_DIA: "palabra_dia"
};

export const DIFICULTADES = {
    FACIL: "facil",
    NORMAL: "normal",
    DIFICIL: "dificil"
};

export const ESTADOS = {
    EN_CURSO: "en_curso",
    VICTORIA: "victoria",
    DERROTA: "derrota"
};

const CONFIG_DIFICULTAD = {
    [DIFICULTADES.FACIL]: { vidas: 8, penalizacionResolver: 1, tiempoContrarreloj: 120 },
    [DIFICULTADES.NORMAL]: { vidas: 6, penalizacionResolver: 2, tiempoContrarreloj: 90 },
    [DIFICULTADES.DIFICIL]: { vidas: 5, penalizacionResolver: 3, tiempoContrarreloj: 60, falloResolverDerrota: true }
};

export const DICCIONARIO = {
    basico: [
        "JAVA", "CODIGO", "TECLADO", "RATON", "PANTALLA",
        "BUCLE", "CLASE", "OBJETO", "DATO", "RED"
    ],
    avanzado: [
        "POLIMORFISMO", "HERENCIA", "ENCAPSULAMIENTO", "ABSTRACCION", "INTERFACE",
        "EXCEPCION", "CONSTRUCTOR", "DESARROLLO", "ALGORITMO", "DEBUGGING"
    ],
    peliculas: [
        "TITANIC", "AVATAR", "MATRIX", "GLADIATOR", "INTERSTELLAR",
        "ORIGEN", "JOKER", "SHREK", "FROZEN", "COCO"
    ],
    animales: [
        "ELEFANTE", "JIRAFA", "LEON", "TIGRE", "GATO",
        "PERRO", "AGUILA", "DELFIN", "BALLENA", "PINGUINO"
    ]
};

function esLetra(c) {
    return /^[A-ZÑ]$/.test(c);
}

function normalizarConfig(config) {
    const modo = Object.values(MODOS).includes(config.modo) ? config.modo : MODOS.CLASICO;
    const dificultad = Object.values(DIFICULTADES).includes(config.dificultad) ? config.dificultad : DIFICULTADES.NORMAL;
    const categoria = DICCIONARIO[config.categoria] ? config.categoria : "basico";
    const tiempoPersonalizado = Number(config.tiempoPersonalizado) || 0;

    const base = CONFIG_DIFICULTAD[dificultad];
    const tiempoContrarreloj = tiempoPersonalizado > 0 ? tiempoPersonalizado : base.tiempoContrarreloj;

    return {
        modo,
        dificultad,
        categoria,
        vidas: base.vidas,
        penalizacionResolver: base.penalizacionResolver,
        falloResolverDerrota: Boolean(base.falloResolverDerrota),
        tiempoContrarreloj
    };
}

function filtrarPorDificultad(lista, dificultad) {
    if (!Array.isArray(lista)) return [];
    const cortas = lista.filter(p => p.length <= 6);
    const medias = lista.filter(p => p.length > 6 && p.length <= 9);
    const largas = lista.filter(p => p.length > 9);

    if (dificultad === DIFICULTADES.FACIL && cortas.length) return cortas;
    if (dificultad === DIFICULTADES.DIFICIL && largas.length) return largas;
    if (medias.length) return medias;
    return lista;
}

function elegirPalabra(categoria, dificultad) {
    const lista = filtrarPorDificultad(DICCIONARIO[categoria], dificultad);
    const indice = Math.floor(Math.random() * lista.length);
    return lista[indice] || "JAVA";
}

export function nuevaPartida(config) {
    const cfg = normalizarConfig(config || {});
    let palabra = config.palabraFija
        ? sanitizarPalabra(config.palabraFija)
        : (config.palabraPersonalizada ? sanitizarPalabra(config.palabraPersonalizada) : elegirPalabra(cfg.categoria, cfg.dificultad));

    if (!palabra) {
        palabra = elegirPalabra(cfg.categoria, cfg.dificultad);
    }

    return {
        palabraSecreta: palabra,
        letrasAdivinadas: [],
        letrasFalladas: [],
        intentosRestantes: cfg.vidas,
        vidasIniciales: cfg.vidas,
        estado: ESTADOS.EN_CURSO,
        modo: cfg.modo,
        dificultad: cfg.dificultad,
        categoria: cfg.categoria,
        penalizacionResolver: cfg.penalizacionResolver,
        falloResolverDerrota: cfg.falloResolverDerrota,
        tiempoLimiteMs: cfg.modo === MODOS.CONTRARRELOJ ? cfg.tiempoContrarreloj * 1000 : 0,
        tiempoRestanteMs: cfg.modo === MODOS.CONTRARRELOJ ? cfg.tiempoContrarreloj * 1000 : 0,
        inicioMs: Date.now(),
        pistasUsadas: 0,
        palabraDiaria: cfg.modo === MODOS.PALABRA_DIA
    };
}

export function intentarLetra(state, letra) {
    if (!state || state.estado !== ESTADOS.EN_CURSO) return { tipo: "sin_accion" };
    if (!letra) return { tipo: "invalida" };

    const upper = letra.toUpperCase();
    if (!esLetra(upper)) return { tipo: "invalida" };

    if (state.letrasAdivinadas.includes(upper) || state.letrasFalladas.includes(upper)) {
        return { tipo: "repetida" };
    }

    if (state.palabraSecreta.includes(upper)) {
        state.letrasAdivinadas.push(upper);
        comprobarVictoria(state);
        return { tipo: "acierto", estado: state.estado };
    }

    state.letrasFalladas.push(upper);
    state.intentosRestantes = Math.max(0, state.intentosRestantes - 1);
    if (state.intentosRestantes <= 0) {
        state.estado = ESTADOS.DERROTA;
    }
    return { tipo: "fallo", estado: state.estado };
}

export function usarPista(state) {
    if (!state || state.estado !== ESTADOS.EN_CURSO) return { tipo: "sin_accion" };
    if (state.intentosRestantes <= 1) return { tipo: "sin_vidas" };

    const pendientes = state.palabraSecreta.split("").filter(l => !state.letrasAdivinadas.includes(l));
    if (!pendientes.length) return { tipo: "sin_pendientes" };

    const indice = Math.floor(Math.random() * pendientes.length);
    const letra = pendientes[indice];
    state.letrasAdivinadas.push(letra);
    state.intentosRestantes = Math.max(0, state.intentosRestantes - 1);
    state.pistasUsadas += 1;
    comprobarVictoria(state);
    if (state.intentosRestantes <= 0 && state.estado !== ESTADOS.VICTORIA) {
        state.estado = ESTADOS.DERROTA;
    }
    return { tipo: "pista", letra, estado: state.estado };
}

export function resolverPalabra(state, intento) {
    if (!state || state.estado !== ESTADOS.EN_CURSO) return { tipo: "sin_accion" };
    const propuesta = sanitizarPalabra(intento || "");
    if (!propuesta) return { tipo: "invalida" };

    if (propuesta === state.palabraSecreta) {
        state.letrasAdivinadas = Array.from(new Set(state.palabraSecreta.split("")));
        state.estado = ESTADOS.VICTORIA;
        return { tipo: "acierto", estado: state.estado };
    }

    if (state.falloResolverDerrota) {
        state.intentosRestantes = 0;
        state.estado = ESTADOS.DERROTA;
        return { tipo: "fallo_derrota", estado: state.estado };
    }

    state.intentosRestantes = Math.max(0, state.intentosRestantes - state.penalizacionResolver);
    if (state.intentosRestantes <= 0) {
        state.estado = ESTADOS.DERROTA;
    }
    return { tipo: "fallo", estado: state.estado };
}

export function actualizarTiempo(state, ahoraMs = Date.now()) {
    if (!state || state.modo !== MODOS.CONTRARRELOJ || state.estado !== ESTADOS.EN_CURSO) return state;
    if (!state.tiempoLimiteMs) return state;

    const transcurrido = ahoraMs - state.inicioMs;
    state.tiempoRestanteMs = Math.max(0, state.tiempoLimiteMs - transcurrido);
    if (state.tiempoRestanteMs <= 0) {
        state.estado = ESTADOS.DERROTA;
        state.intentosRestantes = 0;
    }
    return state;
}

export function obtenerPalabraVisible(state) {
    if (!state) return "";
    return state.palabraSecreta
        .split("")
        .map(l => (state.letrasAdivinadas.includes(l) ? l : "_"))
        .join(" ");
}

export function progresoVidas(state) {
    if (!state || !state.vidasIniciales) return 0;
    return Math.max(0, Math.min(100, (state.intentosRestantes / state.vidasIniciales) * 100));
}

export function tiempoRestanteTexto(state) {
    if (!state || !state.tiempoLimiteMs) return "--";
    const segundos = Math.max(0, Math.round(state.tiempoRestanteMs / 1000));
    const m = Math.floor(segundos / 60).toString().padStart(2, "0");
    const s = (segundos % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

export function sanitizarPalabra(texto) {
    if (!texto) return "";
    return texto
        .normalize("NFD")
        .replace(/[^A-Za-zÑñ]/g, "")
        .toUpperCase();
}

function comprobarVictoria(state) {
    const todas = state.palabraSecreta.split("").every(l => state.letrasAdivinadas.includes(l));
    if (todas) {
        state.estado = ESTADOS.VICTORIA;
    }
}

export function crearResumen(state) {
    if (!state) return null;
    const victoria = state.estado === ESTADOS.VICTORIA;
    const tiempoJugadoMs = state.tiempoLimiteMs ? state.tiempoLimiteMs - state.tiempoRestanteMs : Date.now() - state.inicioMs;
    return {
        victoria,
        modo: state.modo,
        dificultad: state.dificultad,
        categoria: state.categoria,
        palabra: state.palabraSecreta,
        pistasUsadas: state.pistasUsadas,
        vidasIniciales: state.vidasIniciales,
        intentosRestantes: state.intentosRestantes,
        tiempoLimiteMs: state.tiempoLimiteMs,
        tiempoRestanteMs: state.tiempoRestanteMs,
        tiempoJugadoMs,
        fechaISO: new Date().toISOString(),
        palabraDiaria: state.palabraDiaria
    };
}

export function partesDisponibles(state) {
    if (!state) return 0;
    return Math.max(1, Math.min(6, state.vidasIniciales));
}

export function calcularErrores(state) {
    if (!state) return 0;
    return Math.max(0, state.vidasIniciales - state.intentosRestantes);
}
