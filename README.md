# Juego del Ahorcado – Consola (Java) y Versión Web

Este proyecto incluye la versión de consola en Java y una versión web moderna (lista para GitHub Pages) con varios modos de juego, estadísticas persistentes y pruebas básicas de la lógica.

## Estructura
- `src/ahorcado/`: código Java de la versión consola (sin cambios).
- `docs/`: versión web para GitHub Pages (HTML/CSS/JS en módulos ES).
  - `js/gameEngine.js`: lógica del juego (vidas, pistas, resolver, tiempo).
  - `js/ui.js`: renderizado y manejo del DOM.
  - `js/storage.js`: persistencia en `localStorage` (ajustes y estadísticas).
  - `js/main.js`: punto de entrada que conecta lógica, UI y almacenamiento.
  - `tests/`: tests sencillos de la lógica (`tests.js`, `index.html`).
  - `package.json` (solo para marcar ESM dentro de `docs/`).
- `.github/workflows/tests.yml`: flujo de GitHub Actions que carga los módulos y ejecuta los tests de lógica.

## Versión consola (Java)
1. Abre una terminal en la carpeta del proyecto.
2. Compila: `cd src` y `javac ahorcado\*.java`
3. Ejecuta: `java ahorcado.Main`
4. Sigue el menú para modo aleatorio o dos jugadores en consola.

## Versión web (GitHub Pages)
- Archivos en `docs/` (abre `docs/index.html` en el navegador o configura Pages en GitHub: Settings → Pages → branch `main` → carpeta `/docs`).
- Modos de juego:
  - **Clásico**: vidas limitadas, sin tiempo.
  - **Contrarreloj**: dispones de un tiempo total según dificultad (personalizable); si se agota, pierdes.
  - **Dos jugadores**: Jugador 1 introduce la palabra secreta, Jugador 2 adivina con el teclado virtual.
- Dificultad y categorías:
  - Dificultades: Fácil, Normal, Difícil (cambian vidas, penalización al resolver y tiempo en contrarreloj).
  - Categorías: Básico, Avanzado, Películas, Animales (se recuerda la última elección en este dispositivo).
- Controles principales:
  - Teclado virtual y soporte de teclado físico.
  - Botón **Pista** (-1 vida, revela una letra pendiente).
  - **Resolver palabra**: si fallas, se penaliza (más en difícil). En contrarreloj el tiempo sigue corriendo.
  - Barra de vidas y, en contrarreloj, barra/contador de tiempo.
- Accesibilidad: foco visible en teclas, `aria-live` para mensajes de estado, textos en español.

## Estadísticas y ajustes
- Se guardan en `localStorage` (dispositivo local): partidas, victorias/derrotas por modo, mejor tiempo en contrarreloj, última categoría/dificultad.
- Botón **Reiniciar estadísticas** para borrarlas.
- Se muestran en el panel “Estadísticas” dentro de la página.

## Tests de la lógica (web)
- Abre `docs/tests/index.html` en el navegador para ejecutar los tests y ver el resultado.
- Los tests usan solo la lógica (`gameEngine.js`) y también se ejecutan en el workflow de GitHub Actions.

## Despliegue en GitHub Pages
1. El repositorio ya está preparado con `docs/` como raíz web.
2. En GitHub: Settings → Pages → Source: rama `main`, carpeta `/docs`.
3. Guarda y espera a que GitHub genere la URL pública.

## Créditos / Tecnologías
- **Java (consola)** para la versión original.
- **HTML5, CSS3 (flex/grid), JavaScript ES Modules** para la versión web.
- **LocalStorage** para preferencias y estadísticas.
- **GitHub Actions** para tests ligeros de la lógica.
