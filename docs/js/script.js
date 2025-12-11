/**
 * Lógica del Juego del Ahorcado (Versión Web)
 * Portado desde Java (JuegoAhorcado.java y DiccionarioSencillo.java)
 */

// Diccionario de palabras por categorías
const diccionario = {
    "informatica": [
        "JAVA", "CODIGO", "TECLADO", "RATON", "PANTALLA",
        "BUCLE", "CLASE", "OBJETO", "DATO", "RED",
        "POLIMORFISMO", "HERENCIA", "ENCAPSULAMIENTO", "ABSTRACCION",
        "INTERFACE", "EXCEPCION", "CONSTRUCTOR", "DESARROLLO", "ALGORITMO", "DEBUGGING"
    ],
    "peliculas": [
        "TITANIC", "AVATAR", "MATRIX", "GLADIAIATOR", "INTERSTELLAR",
        "ORIGEN", "JOKER", "SHREK", "FROZEN", "COCO"
    ],
    "animales": [
        "ELEFANTE", "JIRAFA", "LEON", "TIGRE", "GATO",
        "PERRO", "AGUILA", "DELFIN", "BALLENA", "PINGUINO"
    ]
};

// Estado del juego
let gameState = {
    palabraSecreta: "",
    letrasAdivinadas: [],
    letrasFalladas: [],
    intentosRestantes: 10, // Coincide con las partes del dibujo CSS
    categoria: "informatica",
    juegoTerminado: false
};

// Elementos del DOM
const wordDisplay = document.getElementById('wordDisplay');
const livesDisplay = document.getElementById('livesCount');
const messageArea = document.getElementById('messageArea');
const keyboard = document.getElementById('keyboard');
const categorySelect = document.getElementById('categorySelect');
const hangmanParts = document.querySelectorAll('.draw-part');

/**
 * Inicializa el juego y la interfaz
 */
function initGame() {
    // 1. Resetear estado
    gameState.categoria = categorySelect.value;
    const palabras = diccionario[gameState.categoria];
    gameState.palabraSecreta = palabras[Math.floor(Math.random() * palabras.length)];
    gameState.letrasAdivinadas = [];
    gameState.letrasFalladas = [];
    gameState.intentosRestantes = 10;
    gameState.juegoTerminado = false;

    console.log(`Juego iniciado. Categoría: ${gameState.categoria}, Palabra: ${gameState.palabraSecreta}`); // Debug

    // 2. Resetear UI
    messageArea.textContent = "";
    messageArea.className = "message-area";

    // Ocultar todas las partes del dibujo
    hangmanParts.forEach(part => part.style.display = 'none');

    updateWordDisplay();
    updateLivesDisplay();
    generateKeyboard();
}

/**
 * Genera los botones del teclado virtual
 */
function generateKeyboard() {
    keyboard.innerHTML = ''; // Limpiar teclado previo
    const alfabeto = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

    for (let char of alfabeto) {
        const btn = document.createElement('button');
        btn.textContent = char;
        btn.className = 'key';
        btn.onclick = () => handleLetterClick(char, btn);
        keyboard.appendChild(btn);
    }
}

/**
 * Maneja el clic en una letra
 */
function handleLetterClick(letra, btnElement) {
    if (gameState.juegoTerminado) return;

    // Desactivar botón para que no se pueda pulsar de nuevo
    btnElement.disabled = true;

    if (gameState.palabraSecreta.includes(letra)) {
        // Acierto
        gameState.letrasAdivinadas.push(letra);
        btnElement.classList.add('correct');
        updateWordDisplay();
        checkWin();
    } else {
        // Fallo
        gameState.letrasFalladas.push(letra);
        gameState.intentosRestantes--;
        btnElement.classList.add('wrong');
        updateLivesDisplay();
        showNextHangmanPart();
        checkLoss();
    }
}

/**
 * Actualiza la visualización de la palabra (letras encontradas y guiones)
 */
function updateWordDisplay() {
    const visualWord = gameState.palabraSecreta
        .split('')
        .map(char => gameState.letrasAdivinadas.includes(char) ? char : '_')
        .join(' ');

    wordDisplay.textContent = visualWord;
}

/**
 * Actualiza el contador de vidas
 */
function updateLivesDisplay() {
    livesDisplay.textContent = gameState.intentosRestantes;
}

/**
 * Muestra la siguiente parte del dibujo del ahorcado
 * Basado en los fallos (10 intentos = 10 partes)
 */
function showNextHangmanPart() {
    const totalParts = 10;
    const partIndex = totalParts - gameState.intentosRestantes; // 10 - 9 = 1 (primera parte)

    // Buscar la parte correspondiente (clase .part-X)
    const partToShow = document.querySelector(`.part-${partIndex}`);
    if (partToShow) {
        partToShow.style.display = 'block';
    }
}

/**
 * Comprueba si el usuario ha ganado
 */
function checkWin() {
    const isWin = gameState.palabraSecreta
        .split('')
        .every(char => gameState.letrasAdivinadas.includes(char));

    if (isWin) {
        showEndMessage(true);
    }
}

/**
 * Comprueba si el usuario ha perdido
 */
function checkLoss() {
    if (gameState.intentosRestantes <= 0) {
        showEndMessage(false);
        // Revelar la palabra completa
        wordDisplay.textContent = gameState.palabraSecreta.split('').join(' ');
    }
}

/**
 * Muestra mensaje de fin de partida y bloquea teclado
 */
function showEndMessage(victoria) {
    gameState.juegoTerminado = true;

    // Desactivar todo el teclado
    const keys = document.querySelectorAll('.key');
    keys.forEach(k => k.disabled = true);

    if (victoria) {
        messageArea.textContent = "¡FELICIDADES! HAS GANADO 🏆";
        messageArea.classList.add('win-message');
    } else {
        messageArea.textContent = "¡GAME OVER! Inténtalo de nuevo 💀";
        messageArea.classList.add('lose-message');
    }
}

// Event Listeners
document.getElementById('restartBtn').addEventListener('click', initGame);
categorySelect.addEventListener('change', initGame);

// Iniciar juego al cargar
window.onload = initGame;
