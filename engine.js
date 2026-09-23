/* Asistencia de IA: motor Canvas y gestión de estado, desarrollados a petición del estudiante. */
(() => {
  'use strict';

  const PALETTES = Object.freeze({
    mint: ['#b9f788', '#71dfca', '#e5ffd5'],
    violet: ['#c6a0ff', '#8fafff', '#f1d8ff'],
    amber: ['#ffc476', '#ff8d80', '#ffe7b3'],
  });
  const DEFAULTS = Object.freeze({ count: 80, speed: 1, palette: 'mint', trails: false });
  const validate = (options) => {
    if (!Number.isInteger(options.count) || options.count < 10 || options.count > 200) {
      throw new RangeError('La cantidad debe ser un entero entre 10 y 200.');
    }
    if (!Number.isFinite(options.speed) || options.speed < 0.25 || options.speed > 3) {
      throw new RangeError('La velocidad debe estar entre 0.25 y 3.');
    }
    if (!Object.hasOwn(PALETTES, options.palette) || typeof options.trails !== 'boolean') {
      throw new TypeError('Selecciona una paleta y una opción de estelas válidas.');
    }
    return options;
  };

  const create = (canvas, { onState = () => {}, onMetrics = () => {} } = {}) => {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Tu navegador no pudo iniciar Canvas 2D.');

    // Este closure retiene estas variables entre frames. Cada instancia tiene
    // su propio estado; las funciones devueltas acceden a él sin exponerlo.
    let options = { ...DEFAULTS };
    let particles = [];
    let width = 1;
    let height = 1;
    let running = false;
    let destroyed = false;
    let frameId = null;
    let previousTime = null;
    let elapsed = 0;
    let frames = 0;
    let pointer = null;

    const clearMetrics = () => {
      previousTime = null;
      elapsed = 0;
      frames = 0;
      onMetrics({ fps: null, frameMs: null, count: particles.length });
    };
    const createParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 18 + Math.random() * 28;
      const radius = 1.8 + Math.random() * 2.6;
      return {
        x: radius + Math.random() * Math.max(0, width - radius * 2),
        y: radius + Math.random() * Math.max(0, height - radius * 2),
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        radius,
        color: Math.floor(Math.random() * 3),
      };
    };
    const draw = (clear = false, dt = 1 / 60) => {
      context.fillStyle = options.trails && !clear
        ? `rgba(13, 21, 26, ${1 - Math.exp(-9 * dt)})` : '#0d151a';
      context.fillRect(0, 0, width, height);
      const colors = PALETTES[options.palette];

      // Una cuadrícula espacial evita comparar todos los pares de partículas.
      const cellSize = 95;
      const cells = new Map();
      context.lineWidth = 0.7;
      context.strokeStyle = colors[0];
      for (const particle of particles) {
        const cx = Math.floor(particle.x / cellSize);
        const cy = Math.floor(particle.y / cellSize);
        for (let dx = -1; dx <= 1; dx += 1) {
          for (let dy = -1; dy <= 1; dy += 1) {
            const neighbors = cells.get(`${cx + dx},${cy + dy}`) ?? [];
            for (const neighbor of neighbors) {
              const distance = Math.hypot(particle.x - neighbor.x, particle.y - neighbor.y);
              if (distance >= cellSize) continue;
              context.globalAlpha = (1 - distance / cellSize) * 0.22;
              context.beginPath();
              context.moveTo(particle.x, particle.y);
              context.lineTo(neighbor.x, neighbor.y);
              context.stroke();
            }
          }
        }
        const key = `${cx},${cy}`;
        if (!cells.has(key)) cells.set(key, []);
        cells.get(key).push(particle);
      }
      context.globalAlpha = 1;
      for (const particle of particles) {
        context.fillStyle = colors[particle.color];
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
    };
    const update = (dt) => {
      for (const particle of particles) {
        // El puntero atrae suavemente sin alterar permanentemente la velocidad.
        if (pointer) {
          const distance = Math.hypot(pointer.x - particle.x, pointer.y - particle.y);
          if (distance > 1 && distance < 160) {
            const pull = (1 - distance / 160) * 65 * dt;
            particle.x += (pointer.x - particle.x) / distance * pull;
            particle.y += (pointer.y - particle.y) / distance * pull;
          }
        }
        particle.x += particle.vx * options.speed * dt;
        particle.y += particle.vy * options.speed * dt;
        const r = particle.radius;
        if (particle.x < r || particle.x > width - r) {
          particle.vx = particle.x < r ? Math.abs(particle.vx) : -Math.abs(particle.vx);
          particle.x = Math.max(r, Math.min(width - r, particle.x));
        }
        if (particle.y < r || particle.y > height - r) {
          particle.vy = particle.y < r ? Math.abs(particle.vy) : -Math.abs(particle.vy);
          particle.y = Math.max(r, Math.min(height - r, particle.y));
        }
      }
    };
    const tick = (timestamp) => {
      if (!running || destroyed) return;
      if (previousTime !== null) {
        const interval = Math.max(0, (timestamp - previousTime) / 1000);
        const dt = Math.min(interval, 0.05);
        update(dt);
        draw(false, dt);
        // Medimos el intervalo real, no el dt limitado usado para física.
        elapsed += interval;
        frames += 1;
        if (elapsed >= 1) {
          onMetrics({ fps: frames / elapsed, frameMs: elapsed * 1000 / frames, count: particles.length });
          elapsed = 0;
          frames = 0;
        }
      }
      previousTime = timestamp;
      frameId = requestAnimationFrame(tick);
    };
    const pause = () => {
      running = false;
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      clearMetrics();
      onState(false);
    };
    const start = () => {
      if (running || destroyed) return;
      running = true;
      clearMetrics();
      onState(true);
      frameId = requestAnimationFrame(tick);
    };
    const resize = () => {
      if (destroyed) return;
      const bounds = canvas.getBoundingClientRect();
      const oldWidth = width;
      const oldHeight = height;
      width = Math.max(12, bounds.width);
      height = Math.max(12, bounds.height);
      const ratio = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      for (const particle of particles) {
        particle.x = Math.max(particle.radius, Math.min(width - particle.radius, particle.x / oldWidth * width));
        particle.y = Math.max(particle.radius, Math.min(height - particle.radius, particle.y / oldHeight * height));
      }
      pointer = null;
      draw(true);
    };
    const configure = (changes) => {
      if (destroyed) return;
      const next = validate({ ...options, ...changes });
      options = next;
      particles = particles.slice(0, options.count);
      while (particles.length < options.count) particles.push(createParticle());
      clearMetrics();
      draw(true);
    };
    const reset = () => {
      if (destroyed) return;
      pause();
      pointer = null;
      particles = [];
      configure({ ...DEFAULTS });
    };
    resize();
    configure(DEFAULTS);
    return Object.freeze({
      start, pause, reset, configure, resize,
      setPointer: (position) => { pointer = position; },
      isRunning: () => running,
      destroy: () => {
        pause();
        destroyed = true;
        particles = [];
        pointer = null;
      },
    });
  };

  window.OrbitEngine = Object.freeze({ create, defaults: DEFAULTS });
})();
