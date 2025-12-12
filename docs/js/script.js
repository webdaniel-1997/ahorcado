// Version web del Juego del Ahorcado basada en la logica de consola
const diccionario = {
    basico: [
        "JAVA", "CODIGO", "TECLADO", "RATON", "PANTALLA",
        "BUCLE", "CLASE", "OBJETO", "DATO", "RED"
    ],
    avanzado: [
        "POLIMORFISMO", "HERENCIA", "ENCAPSULAMIENTO", "ABSTRACCION", "INTERFACE",
        "EXCEPCION", "CONSTRUCTOR", "DESARROLLO", "ALGORITMO", "DEBUGGING"
    ]
};

const VIDAS_INICIALES = 6;
const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const estado = {
    palabraSecreta: "",
    letrasAdivinadas: [],
    letrasFalladas: [],
    intentosRestantes: VIDAS_INICIALES,
    categoria: "basico",
    juegoTerminado: false
};

const refs = {
    palabraOculta: document.getElementById("palabraOculta"),
    mensajeFinal: document.getElementById("mensajeFinal"),
    intentosRestantes: document.getElementById("intentosRestantes"),
    letrasFalladas: document.getElementById("letrasFalladas"),
    teclado: document.getElementById("teclado"),
    nivelSelect: document.getElementById("nivelSelect"),
    nuevoBtn: document.getElementById("nuevoBtn"),
    resolverInput: document.getElementById("resolverInput"),
    resolverBtn: document.getElementById("resolverBtn"),
    pistaBtn: document.getElementById("pistaBtn"),
    partes: document.querySelectorAll(".parte")
};

function getRandomWord(nivel) {
    const lista = diccionario[nivel] || diccionario.basico;
    const indice = Math.floor(Math.random() * lista.length);
    return lista[indice];
}

function initGame() {
    estado.categoria = refs.nivelSelect.value;
    estado.palabraSecreta = getRandomWord(estado.categoria);
    estado.letrasAdivinadas = [];
    estado.letrasFalladas = [];
    estado.intentosRestantes = VIDAS_INICIALES;
    estado.juegoTerminado = false;

    refs.resolverInput.value = "";
    refs.resolverInput.disabled = false;
    refs.resolverBtn.disabled = false;
    refs.pistaBtn.disabled = false;

    setMensaje("");
    updateWordDisplay();
    updateLivesDisplay();
    actualizarFallos();
    renderKeyboard();
    actualizarDibujo();
}

function renderKeyboard() {
    refs.teclado.innerHTML = "";
    ALFABETO.split("").forEach(letra => {
        const btn = document.createElement("button");
        btn.className = "tecla";
        btn.textContent = letra;
        btn.dataset.letra = letra;
        btn.addEventListener("click", () => handleLetterClick(letra));
        refs.teclado.appendChild(btn);
    });
}

function handleLetterClick(letra) {
    if (estado.juegoTerminado || estado.intentosRestantes <= 0) return;

    const letraMayus = letra.toUpperCase();
    if (estado.letrasAdivinadas.includes(letraMayus) || estado.letrasFalladas.includes(letraMayus)) {
        return;
    }

    setMensaje("");

    if (estado.palabraSecreta.includes(letraMayus)) {
        estado.letrasAdivinadas.push(letraMayus);
        marcarTecla(letraMayus, "acierto");
        updateWordDisplay();
        updateKeyboardState();
        checkWin();
    } else {
        estado.letrasFalladas.push(letraMayus);
        estado.intentosRestantes--;
        marcarTecla(letraMayus, "fallo");
        updateLivesDisplay();
        actualizarFallos();
        actualizarDibujo();
        updateKeyboardState();
        checkLoss();
    }
}

function updateWordDisplay() {
    const letras = estado.palabraSecreta.split("").map(letra =>
        estado.letrasAdivinadas.includes(letra) ? letra : "_"
    );
    refs.palabraOculta.textContent = letras.join(" ");
}

function updateLivesDisplay() {
    refs.intentosRestantes.textContent = estado.intentosRestantes;
}

function updateKeyboardState() {
    const botones = refs.teclado.querySelectorAll("button");
    botones.forEach(btn => {
        const letra = btn.dataset.letra;
        const usada = estado.letrasAdivinadas.includes(letra) || estado.letrasFalladas.includes(letra);
        btn.disabled = estado.juegoTerminado || usada;
    });
}

function actualizarFallos() {
    refs.letrasFalladas.textContent = estado.letrasFalladas.length ? estado.letrasFalladas.join(" ") : "-";
}

function actualizarDibujo() {
    const errores = VIDAS_INICIALES - estado.intentosRestantes;
    refs.partes.forEach((parte, indice) => {
        if (indice < errores) {
            parte.classList.add("visible");
        } else {
            parte.classList.remove("visible");
        }
    });
}

function checkWin() {
    const victoria = estado.palabraSecreta.split("").every(letra => estado.letrasAdivinadas.includes(letra));
    if (victoria) {
        showEndMessage(true);
    }
}

function checkLoss() {
    if (estado.intentosRestantes <= 0) {
        showEndMessage(false);
    }
}

function showEndMessage(victoria) {
    estado.juegoTerminado = true;
    updateKeyboardState();
    refs.resolverBtn.disabled = true;
    refs.resolverInput.disabled = true;
    refs.pistaBtn.disabled = true;

    if (victoria) {
        setMensaje("Felicidades, has adivinado la palabra.", "exito");
    } else {
        setMensaje(`Has perdido. La palabra era ${estado.palabraSecreta}.`, "error");
        refs.palabraOculta.textContent = estado.palabraSecreta.split("").join(" ");
    }
}

function setMensaje(texto, tipo = "info") {
    refs.mensajeFinal.textContent = texto;
    refs.mensajeFinal.className = texto ? `mensaje ${tipo}` : "mensaje";
}

function marcarTecla(letra, clase) {
    const btn = refs.teclado.querySelector(`button[data-letra="${letra}"]`);
    if (btn) {
        btn.classList.add(clase);
    }
}

function pedirPista() {
    if (estado.juegoTerminado) return;
    if (estado.intentosRestantes <= 1) {
        setMensaje("Necesitas al menos 2 vidas para pedir una pista.", "info");
        return;
    }

    const pendientes = estado.palabraSecreta.split("").filter(letra => !estado.letrasAdivinadas.includes(letra));
    if (!pendientes.length) {
        setMensaje("Ya has descubierto todas las letras.", "info");
        return;
    }

    const letraPista = pendientes[0];
    estado.letrasAdivinadas.push(letraPista);
    estado.intentosRestantes--;
    marcarTecla(letraPista, "acierto");

    updateWordDisplay();
    updateLivesDisplay();
    actualizarDibujo();
    updateKeyboardState();
    setMensaje(`Pista usada: se revela la letra ${letraPista}.`, "info");

    checkWin();
    checkLoss();
}

function resolverIntento() {
    if (estado.juegoTerminado) return;

    const intento = refs.resolverInput.value.trim().toUpperCase();
    if (!intento) {
        setMensaje("Escribe una palabra antes de resolver.", "info");
        return;
    }

    if (intento === estado.palabraSecreta) {
        estado.letrasAdivinadas = Array.from(new Set(estado.palabraSecreta.split("")));
        showEndMessage(true);
    } else {
        estado.intentosRestantes--;
        updateLivesDisplay();
        actualizarDibujo();
        setMensaje("Palabra incorrecta (-1 vida).", "info");
        checkLoss();
    }
}

function manejarTecladoFisico(event) {
    if (estado.juegoTerminado) return;

    if (event.key === "Enter" && document.activeElement === refs.resolverInput) {
        resolverIntento();
        return;
    }

    if (document.activeElement === refs.resolverInput) {
        return;
    }

    const letra = event.key ? event.key.toUpperCase() : "";
    if (ALFABETO.includes(letra)) {
        handleLetterClick(letra);
    }
}

refs.nuevoBtn.addEventListener("click", initGame);
refs.nivelSelect.addEventListener("change", initGame);
refs.pistaBtn.addEventListener("click", pedirPista);
refs.resolverBtn.addEventListener("click", resolverIntento);
refs.resolverInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        resolverIntento();
    }
});

document.addEventListener("keydown", manejarTecladoFisico);
window.addEventListener("DOMContentLoaded", initGame);
