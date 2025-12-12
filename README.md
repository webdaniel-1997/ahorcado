# Juego del Ahorcado – Consola (Java) y Version Web Avanzada

Proyecto con dos caras: la version de consola en Java (sin cambios) y una version web moderna lista para GitHub Pages con modos avanzados, logros, palabra del dia, historial y tema claro/oscuro.

## Estructura
- `src/ahorcado/`: codigo Java de la version consola.
- `docs/`: raiz de la version web (GitHub Pages).
  - `index.html`: pagina principal.
  - `css/styles.css`: estilos con tema claro/oscuro y responsive.
  - `js/`: modulos ES sin bundler.
    - `gameEngine.js`: logica pura (vidas, modos, pistas, resolver, resumen de partida).
    - `ui.js`: renderizado (SVG, teclado, barras, logros, historial, tema).
    - `storage.js`: ajustes, estadisticas, historial, logros, racha diaria en `localStorage`.
    - `achievements.js`: definicion y evaluacion de logros.
    - `dailyWord.js`: palabra del dia y racha diaria.
    - `main.js`: punto de entrada que conecta todo.
  - `tests/`: tests sencillos de la logica (`index.html`, `tests.js`).
  - `package.json`: marca ESM en `docs/` para Node.
- `.github/workflows/tests.yml`: flujo basico que importa modulos y lanza los tests de logica.

## Version consola (Java)
1. En terminal: `cd src`
2. Compila: `javac ahorcado\*.java`
3. Ejecuta: `java ahorcado.Main`

## Version web avanzada
- Abre `docs/index.html` en el navegador o visita GitHub Pages: `https://webdaniel-1997.github.io/ahorcado/` (rama `main`, carpeta `/docs`).
- Modos disponibles:
  - **Clasico**: vidas limitadas, sin tiempo.
  - **Contrarreloj**: tiempo total por dificultad (ajustable). Si llega a cero, derrota.
  - **Dos jugadores**: Jugador 1 escribe la palabra secreta; Jugador 2 adivina.
  - **Palabra del dia**: misma palabra para todos en el dia; mantiene racha diaria.
- Dificultades: Facil, Normal, Dificil (vidas, penalizacion al resolver y tiempo en contrarreloj cambian segun dificultad).
- Controles y UI:
  - Teclado virtual + teclado fisico.
  - Boton **Pista** (-1 vida, revela letra pendiente).
  - **Resolver palabra** con penalizacion (o derrota directa en dificil).
  - Barras de vidas y tiempo, animaciones en el SVG del ahorcado, tema claro/oscuro con selector.
- Estadisticas y metajuego:
  - Partidas, victorias/derrotas por modo, mejor tiempo en contrarreloj.
  - Racha diaria y mejor racha.
  - Historial de las ultimas partidas (fecha, modo, categoria, dificultad, resultado, tiempo).
  - Logros: primera victoria, perfecto, dificil sin pistas, tres victorias seguidas, velocista, racha diaria, maraton, etc.
  - Boton para reiniciar estadisticas y logros (solo afecta a este dispositivo).

## Tests de la logica (web)
- Abre `docs/tests/index.html` en el navegador para ver el resultado en pantalla.
- O ejecuta en Node (sin dependencias):
  - Desde la raiz: `node -e "import('file://' + process.cwd() + '/docs/tests/tests.js').then(m=>m.runAllTests())"`

## GitHub Pages
1. Repo listo con `docs/` como raiz web.
2. En GitHub: Settings → Pages → Source: rama `main`, carpeta `/docs`.
3. Guarda y espera la URL publica.

## Tecnologias
- Java (consola), HTML5, CSS3 (flex/grid, temas), JavaScript ES Modules sin bundler, `localStorage` para estado local, GitHub Actions para tests ligeros.
