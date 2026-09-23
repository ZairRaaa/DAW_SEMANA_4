UNIVERSIDAD NACIONAL DEL CENTRO DEL PERÚ
FACULTAD DE INGENIERÍA DE SISTEMAS
DEPARTAMENTO ACADÉMICO DE INGENIERÍA DE SISTEMAS
PROGRAMA DE INGENIERÍA DE SISTEMAS
GUÍA PRÁCTICA SEMANA 04
Asignatura: Desarrollo de Aplicaciones Web (IS093A)
Unidad I: Desarrollo Web Frontend
Tema: JavaScript & TypeScript, Manipulación del DOM, Funciones Avanzadas
(Closures, IIFE, Arrow), Canvas API y Animaciones
Modalidad: Presencial / Laboratorio
Fecha: 23.009.2026
Duración: 80 minutos
APELLIDOS Y NOMBRES: ______________________________________________
OBJETIVO DE LA PRÁCTICA
Manipular el Árbol DOM dinámicamente con JavaScript moderno (ES6+), aplicar
estructuras de control, funciones flecha, autoinvocadas (IIFE) y closures para
gestión de estado, e implementar una animación interactiva usando Canvas API.
Comprender el motor de ejecución JS, el Event Loop, el ciclo de renderizado y
estrategias de optimización (requestAnimationFrame, prevención de fugas de
memoria).
RECURSOS REQUERIDOS
• Visual Studio Code (Extensiones: Live Server, JavaScript/TypeScript
Language Features, ESLint, Canvas Preview)
• Navegador Chrome/Firefox + DevTools (Consola, Elements, Performance,
Memory)
• TypeScript (opcional: tsc global o playground online para validación de
tipos)
• Documentación oficial: MDN Web Docs (DOM, Canvas,
requestAnimationFrame)
• Conexión a internet
PARTE 1: EJERCICIO PASO A PASO
Paso Actividad Concepto Clave
Restricción/Nota
Técnica
1
Crear index.html, app.js
(o app.ts), estructurar UI
con controles y
<canvas>
Integración JS/TS, carga
diferida (defer),
estructura DOM
No usar
frameworks ni
librerías externas.
UNIVERSIDAD NACIONAL DEL CENTRO DEL PERÚ
FACULTAD DE INGENIERÍA DE SISTEMAS
DEPARTAMENTO ACADÉMICO DE INGENIERÍA DE SISTEMAS
PROGRAMA DE INGENIERÍA DE SISTEMAS
Vanilla JS/TS
únicamente
2
Implementar IIFE para
aislamiento de scope,
closures para estado de
animación y arrow
functions para handlers
Execution context,
closure scope, this
lexical binding
Documentar en
comentarios
cómo el closure
retiene el estado
entre frames
3
Manipulación DOM:
querySelector,
addEventListener,
modificación dinámica
de estilos/clases,
validación de inputs
DOM API, Event
Bubbling/Capturing,
reflow vs repaint
Evitar style inline.
Usar
classList.toggle()
y variables CSS
para rendimiento
4
Canvas: contexto 2D,
requestAnimationFrame,
loop de renderizado,
dibujo básico (arc,
fillRect, stroke)
Event Loop, render
pipeline, FPS,
sincronización con
display refresh
Prohibido
setInterval para
animación. Usar
delta time (dt)
para movimiento
uniforme
5
Depuración y
optimización: Console
Profiler, Memory
Snapshot, detección de
listeners huérfanos, FPS
counter
Garbage collection,
detached nodes,
cancelAnimationFrame,
performance metrics
Registrar
métricas en
README.md. IA
solo para
interpretar
gráficos de
Performance
USO DE HERRAMIENTAS DE IA (Recomendado para optimizar el ejercicio)
Herramienta Uso Permitido
Prompt
Ejemplo
Uso
Prohibido
ChatGPT/Claude/Copil
ot
Explicar closure vs
global scope, depurar
context null, optimizar
"¿Por qué mi
closure
pierde
"Genera el
código
completo
UNIVERSIDAD NACIONAL DEL CENTRO DEL PERÚ
FACULTAD DE INGENIERÍA DE SISTEMAS
DEPARTAMENTO ACADÉMICO DE INGENIERÍA DE SISTEMAS
PROGRAMA DE INGENIERÍA DE SISTEMAS
requestAnimationFram
e
referencia
actxtras 100
frames?
Dame patrón
de
encapsulació
n seguro"
de una
animación
de
partículas
con canvas
y controles
DOM"
TypeScript Playground
Validar tipos,
inferencia de
funciones, interfaces
para state
(Oficial)
Usar any o
as any para
silenciar
errores sin
justificación
técnica
DevTools Performance
Medir FPS, detectar
layout thrashing,
analizar heap
(Automático)
Ignorar
advertencia
s de
Detached
DOM nodes
o Long
Tasks
Regla de laboratorio: El 70% de la lógica de animación y manipulación DOM debe
escribirse manualmente. Cada uso de IA debe llevar comentario
Evidencias del Ejercicio Desarrollado:
• Añada capturas de pantalla de cada paso realizado en Visual Studio Code.
• Añada capturas de la Página Web implementada de manera local
• Proporcione el enlace de Github de su proyecto