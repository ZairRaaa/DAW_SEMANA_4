# Órbita · Estación de experimentos

Práctica de la semana 04 · Desarrollo de Aplicaciones Web · Ingeniería de Sistemas · UNCP.

Una estación espacial con cinco misiones activables. El diseño toma como referencia las funcionalidades de las imágenes proporcionadas por el estudiante y las presenta con una identidad propia: tonos claros, planeta ilustrado con CSS y panel de código oscuro.

## Abrir la estación

Abre `index.html` en un navegador moderno o utiliza **Open with Live Server** en Visual Studio Code. No hay dependencias, compilación ni servicios externos.

La primera misión se abre inicialmente. Activa las demás por separado o utiliza **Activar todas**. Abrir una misión no pone en marcha automáticamente sus animaciones; el monitor sí inicia su muestreo cuando se activa.

## Las cinco misiones

| Misión | Experiencia | Conceptos |
| --- | --- | --- |
| 01 · Tu señal en el universo | Escribe tu nombre, transmite, pausa, cambia velocidad y restablece | HTML, defer, Canvas y requestAnimationFrame |
| 02 · El núcleo que recuerda | Envía órdenes y carga energía; el estado persiste al cerrar el módulo | IIFE, closure, funciones flecha |
| 03 · Módulo lunar | Alterna energía, activa un pulso, observa eventos y valida un correo | DOM, classList, capturing, bubbling, validación |
| 04 · Tu constelación | Controla partículas, velocidad, paleta, estelas y atracción del puntero | Canvas 2D, delta time, rebotes, cancelAnimationFrame |
| 05 · Telemetría | Observa FPS, heap disponible, listeners del módulo y retención controlada | Performance, referencias y limpieza |

El panel **Código al descubierto** muestra fragmentos de las funciones implementadas mediante `toString()`. Las pestañas corresponden a las misiones activas. El botón Copiar utiliza el portapapeles; si el navegador lo bloquea, selecciona el texto para copiarlo con Ctrl+C. Los fragmentos necesitan el contexto del proyecto y no son programas independientes.

## Comportamiento

- El nombre admite hasta 24 caracteres y se dibuja como texto, sin interpretar HTML.
- El núcleo acumula órdenes y energía hasta 100 %. Cerrar la misión conserva ese estado; reiniciar memoria lo elimina.
- El módulo lunar cambia mediante clases CSS. El indicador de eventos muestra captura, acción y burbujeo.
- El formulario usa validación nativa del campo email, sin enviar ni guardar datos.
- El campo de estrellas admite de 10 a 200 partículas, velocidad de 0.25× a 3× y tres paletas. **+ Estrella** añade una partícula hasta el límite.
- Reiniciar la constelación restaura los valores originales y pausa la simulación.
- Ocultar la pestaña pausa las animaciones. Al volver, solo se reactiva el monitor si su misión sigue abierta.
- Desactivar una misión cancela su animación o monitor; desactivar telemetría también libera los bloques didácticos.
- La preferencia de movimiento reducido elimina el pulso CSS. Las animaciones Canvas requieren una acción explícita y se pausan cuando se activa esa preferencia.

## Telemetría sin cifras inventadas

Los FPS del monitor se calculan con sus callbacks de `requestAnimationFrame`; no representan el tiempo de CPU ni certifican todos los repintados de la pantalla. La gráfica conserva 60 muestras, aproximadamente una por segundo, y ajusta su escala a la frecuencia observada. El motor de partículas tiene métricas independientes dentro de su misión.

El heap depende de la API opcional `performance.memory`: si no existe, se muestra **N/D**. El porcentaje compara el heap usado con el límite informado por el navegador; no es un porcentaje de RAM física. Los buffers didácticos no necesariamente aparecen reflejados en esa cifra de heap.

El contador de listeners corresponde solo a los registrados por el gestor de misiones; no representa todos los listeners del navegador o del proyecto. Las tareas largas se observan mediante `PerformanceObserver` cuando el navegador soporta `longtask`.

**Simular retención** mantiene un buffer de 2 MiB por clic, con un máximo de cinco bloques (10 MiB). Es una demostración controlada, no un detector de fugas ni una fuga permanente. **Liberar referencias** vacía la colección; la recolección de basura queda a cargo del navegador. La bitácora conserva como máximo 30 entradas.

## Organización

- `index.html`: cinco misiones, controles y panel lateral.
- `styles.css`: identidad visual, componentes, temas, movimiento reducido y adaptación móvil.
- `engine.js`: motor de partículas con estado privado, cuadrícula de proximidad y delta time.
- `app.js`: conexión entre el motor y los controles de la constelación.
- `missions.js`: señal Canvas, closure del núcleo, experimentos DOM, código visible y monitor.
- `informacion.md`: enunciado original.
- `tests/`: pruebas de la versión anterior; no se han ejecutado ni adaptado como parte de este rediseño.

Se usan IIFE para aislar ámbitos y closures para conservar estado. Los handlers son funciones flecha. Las animaciones emplean requestAnimationFrame, no setInterval. Los listeners de instancia se eliminan con AbortController, los observers se desconectan y los frames se cancelan al abandonar la página. El ciclo pagehide/pageshow permite reconstruir la estación al volver desde el caché de navegación.

## Avances de este rediseño

1. `Rediseño la estación de misiones`.
2. `Añado las cinco misiones interactivas`.
3. `Organizo y documento las misiones`.

Por petición del estudiante, **no se ejecutaron tests, verificaciones ni revisión visual de esta versión**. Los resultados de pruebas de versiones anteriores no certifican este rediseño.

## Entrega académica

Implementación realizada con asistencia de IA, declarada en los archivos. No acredita el porcentaje de desarrollo manual exigido en la guía original.

Quedan por incorporar las evidencias personales de entrega: nombres y apellidos, capturas de Visual Studio Code y de la página local, y registros reales de Performance/Memory. No se han inventado capturas, métricas ni diagnósticos.

| Escenario para registrar | FPS | Intervalo entre frames | Heap observado |
| --- | --- | --- | --- |
| Constelación con 80 partículas | Pendiente | Pendiente | Pendiente |
| 200 partículas y estelas | Pendiente | Pendiente | Pendiente |
| Tras activar, cerrar y reabrir misiones | Pendiente | Pendiente | Pendiente |

Repositorio: [DAW_SEMANA_4](https://github.com/ZairRaaa/DAW_SEMANA_4). Los avances se guardan en commits locales; no se realizó push.

## Modo oscuro

El botón de la cabecera alterna entre modo claro y oscuro. La preferencia se guarda localmente; en la primera visita se utiliza el tema del sistema. Si el almacenamiento está bloqueado, el selector sigue funcionando durante la sesión. `theme.js` aplica el tema antes de cargar los estilos para evitar destellos y mantiene el cambio separado de las paletas de partículas.

Cambio añadido sin ejecutar tests ni verificaciones, según la indicación del estudiante.
