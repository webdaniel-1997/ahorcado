# Juego del Ahorcado - Consola (Java) y Version Web

Proyecto con dos formas de jugar: la version de consola escrita en Java y una version web lista para publicar con GitHub Pages.

## Descripcion
Adivina la palabra secreta antes de quedarte sin vidas. Las palabras proceden del mismo diccionario usado en la practica Java, con un nivel basico y otro avanzado.

## Estructura
- src/ahorcado/ : codigo fuente Java de la version consola
- docs/index.html : pagina principal de la version web
- docs/css/styles.css : estilos del juego web
- docs/js/script.js : logica del juego web
- README.md
- .gitignore

## Version consola (Java)
1. Abre una terminal en la carpeta del proyecto.
2. Compila: `cd src` y `javac ahorcado\*.java`
3. Ejecuta: `java ahorcado.Main`
4. Sigue las instrucciones en la consola para elegir dificultad o jugar en modo dos jugadores.

## Version web (GitHub Pages)
- Los archivos estan en `docs/`.
- Puedes abrir `docs/index.html` directamente en el navegador para jugar sin instalar nada.
- Para publicar en GitHub Pages:
  1. Sube este repositorio a GitHub.
  2. En el repositorio, entra en Settings > Pages.
  3. En Source, selecciona la rama `main` y la carpeta `/docs`.
  4. Guarda los cambios y espera a que GitHub genere la URL publica.

## Notas
- La version web usa 6 vidas, igual que la version de consola.
- Las palabras de cada nivel son las mismas que en `DiccionarioSencillo.java`.
