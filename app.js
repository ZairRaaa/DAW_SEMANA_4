/* Asistencia de IA: integración DOM, validación, métricas y ciclo de vida. */
(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const ui = {
    canvas: $('#particle-canvas'), form: $('#controls-form'),
    fieldset: $('#controls-form fieldset'), count: $('#particle-count'),
    speed: $('#speed'), palette: $('#palette'), trails: $('#trails'),
    countOutput: $('#count-output'), speedOutput: $('#speed-output'),
    toggle: $('#toggle-animation'), reset: $('#reset-animation'),
    status: $('#status'), engine: $('#engine-output'), stage: $('.stage'),
    empty: $('#empty-state'), fps: $('#fps-output'), frame: $('#frame-output'),
    active: $('#active-output'), error: $('#validation-message'), notice: $('.notice'),
  };
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let dispose = null;

  const mount = () => {
    if (dispose) return;
    const controller = new AbortController();
    const { signal } = controller;
    let started = false;
    let engine;
    let observer;
    const setState = (running) => {
      ui.stage.classList.toggle('is-running', running);
      ui.status.textContent = running ? 'En movimiento' : started ? 'En pausa' : 'Listo para explorar';
      ui.engine.textContent = running ? 'Activo' : started ? 'En pausa' : 'Listo';
      ui.toggle.textContent = running ? 'Pausar simulación  Ⅱ' : started ? 'Continuar simulación  ↗' : 'Iniciar simulación  ↗';
      ui.toggle.setAttribute('aria-pressed', String(running));
    };
    const setMetrics = ({ fps, frameMs, count }) => {
      ui.fps.textContent = fps === null ? '—' : fps.toFixed(0);
      ui.frame.textContent = frameMs === null ? '—' : frameMs.toFixed(1);
      ui.active.textContent = String(count);
    };
    const showMotionNotice = () => {
      ui.notice.textContent = motionPreference.matches
        ? 'Movimiento reducido activado. La animación solo comienza si pulsas Iniciar.'
        : 'Acerca el puntero al canvas para atraer las partículas. Reiniciar restaura los valores iniciales.';
    };
    const syncControls = () => {
      ui.countOutput.value = ui.count.value;
      ui.speedOutput.value = `${Number(ui.speed.value).toLocaleString('es-PE')}×`;
      for (const name of ['mint', 'violet', 'amber']) {
        document.body.classList.toggle(`theme-${name}`, ui.palette.value === name);
      }
    };

    try {
      engine = window.OrbitEngine.create(ui.canvas, { onState: setState, onMetrics: setMetrics });
      // Las flechas capturan el ámbito léxico; no dependen del this del elemento.
      // Un listener recibe por bubbling los eventos de todos los controles.
      ui.form.addEventListener('input', () => {
        try {
          engine.configure({
            count: Number(ui.count.value), speed: Number(ui.speed.value),
            palette: ui.palette.value, trails: ui.trails.checked,
          });
          ui.error.textContent = '';
          syncControls();
        } catch (error) {
          ui.error.textContent = error.message;
        }
      }, { signal });
      ui.form.addEventListener('submit', (event) => event.preventDefault(), { signal });
      ui.toggle.addEventListener('click', () => {
        if (engine.isRunning()) {
          engine.pause();
        } else {
          started = true;
          ui.empty.classList.toggle('is-hidden', true);
          engine.start();
        }
      }, { signal });
      ui.reset.addEventListener('click', () => {
        started = false;
        ui.form.reset();
        ui.error.textContent = '';
        engine.reset();
        syncControls();
        ui.empty.classList.toggle('is-hidden', false);
      }, { signal });
      ui.canvas.addEventListener('pointermove', (event) => {
        const bounds = ui.canvas.getBoundingClientRect();
        engine.setPointer({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
      }, { signal, passive: true });
      for (const eventName of ['pointerleave', 'pointercancel', 'pointerup']) {
        ui.canvas.addEventListener(eventName, () => engine.setPointer(null), { signal });
      }
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && engine.isRunning()) engine.pause();
      }, { signal });
      motionPreference.addEventListener('change', () => {
        showMotionNotice();
        if (motionPreference.matches) engine.pause();
      }, { signal });
      // ResizeObserver agrupa cambios; nunca medimos layout en el loop de dibujo.
      observer = new ResizeObserver(() => engine.resize());
      observer.observe(ui.canvas);
      window.addEventListener('resize', () => engine.resize(), { signal });

      ui.fieldset.disabled = false;
      ui.form.reset();
      syncControls();
      setState(false);
      showMotionNotice();
      ui.empty.classList.toggle('is-hidden', false);
      ui.error.textContent = '';
      dispose = () => {
        controller.abort();
        observer.disconnect();
        engine.destroy();
        ui.fieldset.disabled = true;
        dispose = null;
      };
    } catch (error) {
      controller.abort();
      observer?.disconnect();
      engine?.destroy();
      ui.fieldset.disabled = true;
      ui.status.textContent = 'No disponible';
      ui.engine.textContent = 'Error';
      ui.error.textContent = error.message;
      ui.notice.textContent = 'Recarga la página o prueba con un navegador que admita Canvas 2D.';
    }
  };

  // pagehide limpia incluso al entrar al caché de navegación. pageshow restaura
  // una sola instancia al volver, sin acumular listeners ni ciclos de dibujo.
  window.addEventListener('pagehide', () => dispose?.());
  window.addEventListener('pageshow', () => mount());
  mount();
})();
