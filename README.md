# Juego del Ahorcado – Versión Web y Consola

Este proyecto contiene dos versiones del clásico juego del Ahorcado:
1. **Versión Java (Consola)**: La implementación original orientada a backend.
2. **Versión Web (HTML/CSS/JS)**: Una implementación visual moderna lista para desplegar.

## Descripción
El objetivo es adivinar la palabra secreta antes de que se complete el dibujo del ahorcado. Cuentas con **10 intentos**. Puedes elegir entre categorías como *Informática*, *Películas* o *Animales*.

## Tecnologías Utilizadas
*   **Java**: Lógica de backend (en `src/`).
*   **HTML5**: Estructura semántica.
*   **CSS3**: Diseño visual, Flexbox y animaciones.
*   **JavaScript (ES6+)**: Lógica del juego y manipulación del DOM.

## Estructura del Proyecto
```
JuegoAhorcado/
├── src/                # Código fuente Java
├── docs/               # Versión Web (GitHub Pages)
│   ├── css/styles.css  # Estilos
│   ├── js/script.js    # Lógica JS
│   └── index.html      # Página principal
├── .gitignore          # Archivos ignorados por Git
└── README.md           # Documentación
```

## Instrucciones de Ejecución

### 1. Versión Java (Consola)
Para ejecutar la versión original en tu IDE (IntelliJ, Eclipse, VS Code):
*   Abre el proyecto.
*   Ejecuta el archivo `src/ahorcado/Main.java`.
*   Sigue las instrucciones en la consola.

### 2. Versión Web (Local)
Para jugar en tu ordenador sin internet:
*   Ve a la carpeta `docs/`.
*   Haz doble clic en `index.html`.
*   ¡Disfruta!

---

## Despliegue en GitHub Pages

Para ver este juego online y compartirlo:

1.  **Sube este repositorio a GitHub**.
2.  Ve a la pestaña **Settings** (Configuración) de tu repositorio.
3.  En el menú lateral, busca la sección **Pages**.
4.  En **Source**, selecciona `Deploy from a branch`.
5.  En **Branch**, selecciona `main` (o master) y la carpeta `/docs` (¡Importante! Seleccionar /docs, no /root).
6.  Haz clic en **Save**.
7.  En unos instantes, GitHub te dará una URL (ej: `https://tu-usuario.github.io/tu-repo/`) donde el juego estará funcionando.
