# Órbita · Laboratorio de movimiento

Práctica de la semana 04 de Desarrollo de Aplicaciones Web, Ingeniería de Sistemas, UNCP. Simulación interactiva hecha con HTML, CSS y JavaScript puro, sin frameworks, librerías externas ni dependencias de ejecución.

## Cómo abrirlo

Abre `index.html` directamente en un navegador moderno o usa **Open with Live Server** desde Visual Studio Code. No necesitas instalar paquetes ni compilar.

1. Pulsa **Iniciar simulación**.
2. Ajusta cantidad, velocidad, paleta y estelas mientras observas el canvas.
3. Acerca el puntero para atraer las partículas.
4. Usa **Pausar / Continuar** para controlar el movimiento.
5. **Reiniciar** detiene el motor y restaura 80 partículas, velocidad 1×, paleta menta y estelas desactivadas.

La página comienza sin movimiento. Al ocultar la pestaña se pausa y requiere continuar manualmente. También se pausa si activas la preferencia de movimiento reducido del sistema.

## Funcionalidades

- Entre 10 y 200 partículas, velocidad de 0.25× a 3× y tres paletas.
- Partículas con rebote, conexiones por proximidad, atracción del puntero y estelas.
- Paleta visual de la interfaz sincronizada con la simulación mediante clases y variables CSS.
- Métricas de FPS, intervalo entre frames y cantidad de partículas.
- Explicaciones desplegables, controles etiquetados, foco visible y diseño adaptable.
- Validación de parámetros y mensaje de error si Canvas 2D no está disponible.

Los FPS y el intervalo se actualizan aproximadamente cada segundo mientras el motor está activo. Al pausar se muestran guiones; no se presentan datos antiguos como mediciones actuales.

## Organización del código

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Estructura semántica, controles, Canvas y explicaciones |
| `styles.css` | Diseño adaptable, paletas y estados visuales |
| `engine.js` | IIFE, fábrica del motor, closure privado, física, dibujo y medición |
| `app.js` | IIFE de integración DOM, eventos, validación visible y ciclo de vida |
| `tests/engine.test.cjs` | Pruebas del motor con Canvas y reloj simulados |
| `tests/app.test.cjs` | Pruebas de integración con DOM simulado |
| `informacion.md` | Enunciado original de la práctica |

Los scripts se cargan con `defer`, en orden: primero el motor y después la interfaz. La API pública `window.OrbitEngine` contiene la fábrica y los valores iniciales; las partículas y el estado de cada instancia son privados.

## Conceptos de la práctica

### IIFE, closures y funciones flecha

Las IIFE aíslan los nombres de cada archivo. La fábrica `create` conserva partículas, opciones, estado, timestamp e identificador del frame en su ámbito. Las operaciones devueltas y el callback de animación mantienen acceso a esas variables mediante un closure, incluso después de terminar la llamada inicial a la fábrica.

Los handlers usan funciones flecha y acceden a referencias explícitas de los controles: no dependen del `this` dinámico de un elemento.

### DOM y eventos

`querySelector` obtiene los elementos y `addEventListener` conecta las acciones. El formulario recibe los eventos `input` por bubbling, por lo que un solo listener atiende sus controles. Capturing recorrería los ancestros antes de llegar al objetivo; aquí se utiliza la fase de burbujeo predeterminada.

La validación comprueba enteros y límites para cantidad, valores finitos y límites para velocidad, paletas permitidas y un booleano para estelas. Los errores no sustituyen la configuración válida del motor.

Los estados cambian con `classList.toggle`, las paletas usan variables CSS y no hay estilos inline. Las dimensiones se leen al redimensionar y al mover el puntero, fuera del callback de animación; las métricas no escriben en el DOM en cada frame.

### Canvas, Event Loop y renderizado

El navegador invoca `requestAnimationFrame` antes del siguiente repintado. Su timestamp permite calcular segundos transcurridos: desplazamiento = velocidad × multiplicador × dt. No se utiliza `setInterval`.

El primer frame establece el tiempo de referencia. Al reanudar se descarta el timestamp anterior y se limita el dt de la física a 50 ms para evitar grandes saltos. La medición de FPS sí utiliza el intervalo real, sin ese límite.

Se dibuja con `fillRect`, `arc` y `stroke`. Una cuadrícula espacial limita las comparaciones de proximidad a celdas vecinas. Las estelas ajustan su desvanecimiento al tiempo transcurrido. El canvas adapta su resolución a `devicePixelRatio`; `setTransform` evita acumular escalas.

### Limpieza y rendimiento

- Iniciar es idempotente: no crea un segundo loop si ya existe uno activo.
- Pausar utiliza `cancelAnimationFrame` y limpia el reloj de medición.
- `visibilitychange` pausa cuando se oculta la página.
- `AbortController` retira los listeners de cada instancia al salir.
- `ResizeObserver.disconnect` libera la observación y el motor descarta sus partículas al destruirse.
- `pagehide` limpia y `pageshow` restaura una instancia si regresas mediante el caché de navegación.
- Los dos listeners de ciclo de vida pertenecen a la página y se registran una sola vez.

La liberación de referencias permite la recolección de basura, pero no garantiza cuándo se ejecuta. Los tests de limpieza no sustituyen un análisis del heap en DevTools.

## Verificaciones realizadas

Ejecutadas el 23 de septiembre de 2026 con Node.js v22.14.0:

```sh
node --check engine.js
node --check app.js
node --test tests/engine.test.cjs tests/app.test.cjs
git diff --check
```

**Resultado: 13 pruebas aprobadas, 0 fallidas.**

Se verificaron: loop único, cancelación, equivalencia de desplazamiento a 30/60/120 Hz, reanudación sin saltos, validación, límites de rebote, resolución del canvas, medición sin confundir dt limitado con intervalo real, diez reinicios, contexto nulo, sincronización de controles y tema, pausa al ocultar, limpieza durante diez salidas/regresos y movimiento reducido.

Estas pruebas usan reloj, Canvas y DOM simulados. No miden FPS reales, rasterizado, accesibilidad completa ni memoria del navegador. La revisión visual automatizada fue bloqueada por la política de acceso a archivos locales del navegador integrado; no se tomaron capturas ni se completó un perfil real de Performance/Memory.

## Métricas de navegador para la entrega

Los contadores están implementados. **Las mediciones reales de esta tabla están pendientes**, no se han sustituido por resultados sintéticos de los tests.

Registra navegador, versión, equipo, frecuencia de pantalla y tamaño de ventana. Graba cada escenario durante 15 segundos en Performance, examina scripting, renderizado y tareas largas. El intervalo entre frames no equivale al tiempo de CPU de dibujo.

| Escenario | FPS promedio | Intervalo entre frames (ms) | Heap antes/después (MB) |
| --- | --- | --- | --- |
| 80 partículas, velocidad 1×, sin estelas | Pendiente | Pendiente | Pendiente |
| 200 partículas, velocidad 3×, con estelas | Pendiente | Pendiente | Pendiente |
| Después de 10 reinicios y pausas | Pendiente | Pendiente | Pendiente |

Para Memory, compara snapshots antes y después de varios reinicios; inspecciona objetos retenidos y nodos separados del DOM. Comprueba además el diseño a 360, 768 y 1440 píxeles, navegación por teclado y ausencia de errores en Console.

## Historial de avances

Todos los mensajes son cortos y en primera persona:

1. `Añado la interfaz del laboratorio`.
2. `Documento los pasos de la práctica`.
3. `Añado el motor de partículas`.
4. `Conecto los controles de la simulación`.
5. `Verifico la animación y los controles`.
6. `Documento el laboratorio terminado`.

## Autoría y evidencias académicas

Esta versión se completó con asistencia de IA por petición expresa del estudiante. Los archivos incluyen comentarios que identifican esa ayuda. **No se acredita el 70 % de lógica escrita manualmente que exige la guía**; se debe declarar esta situación al presentar el trabajo.

La implementación está completa; para la entrega académica quedan evidencias personales y verificaciones en navegador:

- [ ] Completar nombres y apellidos.
- [ ] Capturar los pasos en Visual Studio Code usando los avances reales del historial.
- [ ] Capturar la página local funcionando.
- [ ] Adjuntar Performance y Memory con interpretación propia.
- [ ] Completar las métricas reales de la tabla.
- [ ] Publicar los commits en GitHub cuando corresponda.

Repositorio configurado: [DAW_SEMANA_4](https://github.com/ZairRaaa/DAW_SEMANA_4). Los commits están guardados localmente; no se ha realizado push.
