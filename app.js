/**
 * Órbita · Práctica de la semana 04.
 * Asistencia de IA: comentarios de orientación, sin lógica implementada.
 * La guía exige escribir manualmente al menos el 70 % de la lógica DOM y Canvas.
 * Registra cualquier ayuda adicional junto al fragmento correspondiente.
 */

// PASO 2 — Aislamiento y estado.
// Escribe una IIFE con modo estricto. Mantén el resto del programa dentro de ella.
// Crea una función que devuelva operaciones para iniciar, pausar y reiniciar.
// Su closure debe conservar partículas, estado, timestamp anterior e ID del frame.
// Explica con tus palabras por qué ese estado sigue accesible entre frames.

// PASO 3 — DOM y validación.
// Selecciona canvas y controles con querySelector. Comprueba el contexto 2D.
// Registra handlers flecha; valida números finitos y los límites del HTML.
// Actualiza los output y usa classList.toggle para .is-running y .is-hidden.
// Activa el fieldset solamente cuando los controles tengan comportamiento real.
// Mantén sincronizados el botón iniciar/pausar, el estado y los mensajes de error.

// PASO 4 — Canvas y tiempo.
// Crea partículas con posición, velocidad y radio dentro de los límites del canvas.
// Implementa dibujo con arc, fillRect y stroke, y rebote considerando el radio.
// Usa el timestamp de requestAnimationFrame para calcular dt en segundos.
// Reinicia el timestamp al reanudar y limita dt tras una pestaña inactiva.
// Evita programar más de un loop simultáneo. No uses setInterval.
// Ajusta resolución y coordenadas al tamaño visible y devicePixelRatio.
// Respeta prefers-reduced-motion: no inicies movimiento automáticamente.

// PASO 5 — Métricas y limpieza.
// Promedia FPS y duración de frame durante una ventana de aproximadamente 1 s.
// Actualiza métricas DOM una vez por ventana, no en cada frame.
// Cancela el frame al pausar o desmontar y elimina listeners al desmontar.
// Considera visibilitychange para pausar al ocultar la página.
// Registra mediciones reales y evidencia de Performance/Memory en README.md.
