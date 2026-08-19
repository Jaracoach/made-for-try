# Made For Try · Fuerza

Aplicativo web estático para prescripción y ejecución de entrenamientos de fuerza
(autocargas y elásticos) para triatletas.

- **index.html** — portada con las dos puertas.
- **entrenador.html** — panel del entrenador (administrador): filtra la biblioteca,
  arma la sesión, define el método y genera el **enlace del alumno** o un
  **archivo sin conexión**.
- **deportista.html** — vista del deportista (usuario): abre el enlace del
  entrenador y ejecuta la sesión guiada (GIF, series, cronómetro, descansos).
- **ontologia.html** — navegador de la ontología de ejercicios (módulo 01).
- **library.json** — biblioteca de 111 ejercicios (metadatos + fichas).
- **** — 111 GIFs de los ejercicios.

Publicado con GitHub Pages. Todo es estático: no requiere servidor ni base de datos.
El plan del alumno viaja codificado en el propio enlace (`deportista.html#p=...`).
