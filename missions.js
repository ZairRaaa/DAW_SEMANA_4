/* Asistencia de IA: módulos educativos, señal Canvas, closures y telemetría. */
(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  // Las operaciones conservan acceso a estas variables privadas entre clics.
  const createCore = () => {
    let clicks = 0;
    let energy = 0;
    let action = 'En espera';
    return {
      charge: () => {
        clicks += 1;
        energy = Math.min(100, energy + 10);
        action = energy === 100 ? 'Núcleo cargado' : `Orden #${clicks}`;
        return { clicks, energy, action };
      },
      reset: () => {
        clicks = 0;
        energy = 0;
        action = 'En espera';
        return { clicks, energy, action };
      },
    };
  };

  const createBeacon = (canvas) => {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D no está disponible.');
    let width = 600;
    let height = 210;
    let phase = 0;
    let previous = null;
    let frameId = null;
    let running = false;

    const draw = () => {
      context.fillStyle = '#152b29';
      context.fillRect(0, 0, width, height);
      for (let i = 0; i < 45; i += 1) {
        const x = ((i * 137.5) % width);
        const y = ((i * 79.3) % height);
        context.fillStyle = i % 3 ? '#426251' : '#9ab985';
        context.beginPath();
        context.arc(x, y, i % 3 ? 0.8 : 1.3, 0, Math.PI * 2);
        context.fill();
      }
      const text = $('#signal-name').value.trim() || 'TU PRÓXIMA MISIÓN';
      const size = Math.min(35, width / Math.max(9, text.length * 0.68));
      context.font = `600 ${size}px "Segoe UI", sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = '#d3edb2';
      context.shadowColor = '#b2db82';
      context.shadowBlur = 15;
      context.fillText(text, width / 2, height / 2 + Math.sin(phase) * 20);
      context.shadowBlur = 0;
      context.strokeStyle = '#547554';
      context.lineWidth = 1;
      context.beginPath();
      context.ellipse(width / 2, height / 2 + 40, Math.min(width * 0.34, 210), 24, -0.12, 0, Math.PI * 2);
      context.stroke();
    };
    const tick = (time) => {
      if (!running) return;
      if (previous !== null) phase += Math.min((time - previous) / 1000, 0.05) * Number($('#signal-speed').value);
      previous = time;
      draw();
      frameId = requestAnimationFrame(tick);
    };
    const pause = () => {
      running = false;
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      previous = null;
      $('#signal-state').textContent = 'Señal en pausa';
    };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width) return;
      width = bounds.width;
      height = bounds.height;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    };
    return {
      draw, resize, pause,
      play: () => {
        if (running) return;
        running = true;
        previous = null;
        $('#signal-state').textContent = 'Transmitiendo al universo';
        frameId = requestAnimationFrame(tick);
      },
      reset: () => {
        pause();
        phase = 0;
        $('#signal-name').value = 'HOLA, UNIVERSO';
        $('#signal-speed').value = '1';
        $('#signal-speed-output').value = '1×';
        $('#signal-state').textContent = 'Señal en espera';
        draw();
      },
    };
  };

  const toggleModuleEnergy = () => {
    const module = $('#lunar-module');
    const active = module.classList.toggle('is-highlighted');
    $('#highlight-module').setAttribute('aria-pressed', String(active));
    $('#module-state').textContent = active ? 'ENERGÍA ESTABLE' : 'SISTEMAS EN ESPERA';
  };
  const validateEmail = (event) => {
    event.preventDefault();
    const input = $('#crew-email');
    input.value = input.value.trim();
    const valid = input.validity.valid;
    input.setAttribute('aria-invalid', String(!valid));
    const message = $('#email-message');
    message.classList.toggle('is-error', !valid);
    message.classList.toggle('is-valid', valid);
    message.textContent = valid
      ? '✓ Dirección válida. Tripulación lista para despegar. No se envió ningún dato.'
      : 'Introduce un correo válido, por ejemplo astronauta@orbita.pe.';
  };

  const createMonitor = (listenerCount) => {
    const chart = $('#fps-chart');
    const context = chart.getContext('2d');
    let running = false;
    let frameId = null;
    let previous = null;
    let elapsed = 0;
    let frames = 0;
    let latest = null;
    let history = [];
    let blocks = [];
    let longTasks = 0;
    let observer = null;
    const log = (message) => {
      const output = $('#performance-log');
      const lines = output.textContent.split('\n').filter(Boolean);
      lines.push(`[${new Date().toLocaleTimeString('es-PE')}] ${message}`);
      output.textContent = lines.slice(-30).join('\n');
      output.scrollTop = output.scrollHeight;
    };
    const drawChart = () => {
      if (!context) return;
      const width = chart.clientWidth || 600;
      const height = 150;
      const ratio = window.devicePixelRatio || 1;
      chart.width = Math.round(width * ratio);
      chart.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = '#172e29';
      context.fillRect(0, 0, width, height);
      const maximum = Math.max(60, ...history) * 1.15;
      context.strokeStyle = '#415740';
      context.setLineDash([4, 4]);
      const lineY = height - 20 - (60 / maximum) * (height - 35);
      context.beginPath();
      context.moveTo(0, lineY);
      context.lineTo(width, lineY);
      context.stroke();
      context.setLineDash([]);
      context.font = '9px monospace';
      context.fillStyle = '#9aad88';
      context.fillText('60 FPS', 8, Math.max(12, lineY - 5));
      const barWidth = (width - 20) / 60;
      history.forEach((fps, index) => {
        const barHeight = (fps / maximum) * (height - 35);
        context.fillStyle = fps >= 45 ? '#badc87' : '#e4b982';
        context.fillRect(10 + index * barWidth, height - 15 - barHeight, Math.max(1, barWidth - 2), barHeight);
      });
    };
    const sampleMemory = () => {
      // API opcional del navegador. N/D no equivale a cero memoria utilizada.
      const memory = performance.memory;
      const supported = memory && Number.isFinite(memory.usedJSHeapSize) && memory.jsHeapSizeLimit > 0;
      $('#monitor-memory').textContent = supported ? (memory.usedJSHeapSize / 1048576).toFixed(1) : 'N/D';
      const ratio = supported ? memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100 : 0;
      $('#memory-progress').value = Math.min(100, ratio);
      $('#memory-ratio').textContent = supported ? `${ratio.toFixed(1)} % del límite` : 'Este navegador no expone el heap';
      $('#monitor-listeners').textContent = String(listenerCount());
      $('#monitor-retained').textContent = String(blocks.length);
    };
    const tick = (time) => {
      if (!running) return;
      if (previous !== null) {
        elapsed += time - previous;
        frames += 1;
      }
      previous = time;
      if (elapsed >= 1000) {
        latest = frames * 1000 / elapsed;
        history.push(latest);
        history = history.slice(-60);
        $('#monitor-fps').textContent = latest.toFixed(0);
        $('#health-status').textContent = latest >= 45 ? 'Fluidez estable' : 'Fluidez reducida';
        sampleMemory();
        drawChart();
        frames = 0;
        elapsed = 0;
      }
      frameId = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      previous = null;
      frames = 0;
      elapsed = 0;
      latest = null;
      observer?.disconnect();
      observer = null;
      $('#monitor-fps').textContent = '—';
      $('#health-status').textContent = 'Monitor en pausa';
    };
    return {
      stop,
      start: () => {
        if (running) return;
        running = true;
        $('#health-status').textContent = 'Esperando muestra';
        if (window.PerformanceObserver?.supportedEntryTypes?.includes('longtask')) {
          try {
            observer = new PerformanceObserver((list) => { longTasks += list.getEntries().length; });
            observer.observe({ type: 'longtask', buffered: false });
          } catch { observer = null; }
        }
        sampleMemory();
        drawChart();
        log('Telemetría activa. La gráfica mide callbacks de esta página.');
        frameId = requestAnimationFrame(tick);
      },
      analyze: () => {
        sampleMemory();
        log(latest === null ? 'Esperando un segundo de medición.' : `Fluidez: ${latest.toFixed(1)} FPS. No es el tiempo de CPU de dibujo.`);
        log(`Listeners del módulo de misiones: ${listenerCount()}. Retención controlada: ${blocks.length * 2} MiB.`);
        log(observer ? `Tareas mayores a 50 ms observadas: ${longTasks}.` : 'Observación de tareas largas no disponible.');
        log('Para diagnosticar fugas reales, compara snapshots en DevTools / Memory.');
      },
      retain: () => {
        if (blocks.length >= 5) return log('Límite didáctico alcanzado: 10 MiB. Libera referencias para continuar.');
        const block = new Uint8Array(2 * 1024 * 1024);
        block.fill(42);
        blocks.push(block);
        sampleMemory();
        log(`Retención simulada: ${blocks.length} bloque(s) de 2 MiB. No implica una fuga real detectada.`);
      },
      release: () => {
        blocks = [];
        sampleMemory();
        log('Referencias liberadas. La recolección de basura depende del navegador.');
      },
    };
  };

  let dispose = null;
  const mount = () => {
    if (dispose) return;
    const controller = new AbortController();
    let listeners = 0;
    const on = (target, event, handler, options = {}) => {
      target.addEventListener(event, handler, { ...options, signal: controller.signal });
      listeners += 1;
    };
    const core = createCore();
    let beacon = null;
    try { beacon = createBeacon($('#signal-canvas')); }
    catch (error) { $('#signal-state').textContent = error.message; }
    const monitor = createMonitor(() => listeners);
    const active = new Set();
    let selected = null;
    const snippets = {
      '1': { file: 'missions.js / createBeacon', code: createBeacon.toString() },
      '2': { file: 'missions.js / createCore', code: createCore.toString() },
      '3': { file: 'missions.js / DOM y validación', code: `${toggleModuleEnergy.toString()}\n\n${validateEmail.toString()}` },
      '4': { file: 'engine.js / create', code: window.OrbitEngine.create.toString() },
      '5': { file: 'missions.js / createMonitor', code: createMonitor.toString() },
    };
    const showCode = (id) => {
      selected = id;
      $('#code-filename').textContent = id ? snippets[id].file : 'Selecciona una misión';
      $('#live-code').textContent = id ? snippets[id].code : '// Activa una misión para explorar su código.';
      $('#copy-status').textContent = '';
      $('#copy-code').disabled = !id;
      $$('#code-tabs button').forEach((button) => {
        button.disabled = !active.has(button.dataset.code);
        button.classList.toggle('is-selected', button.dataset.code === id);
        button.setAttribute('aria-pressed', String(button.dataset.code === id));
      });
    };
    const setMission = (id, enabled) => {
      const section = $(`[data-mission="${id}"]`);
      section.classList.toggle('is-active', enabled);
      $(`#mission-${id}`).hidden = !enabled;
      const toggle = section.querySelector('.mission-toggle');
      toggle.textContent = enabled ? 'Activa ✓' : 'Activar ↗';
      toggle.setAttribute('aria-expanded', String(enabled));
      if (enabled) active.add(id); else active.delete(id);
      if (id === '1') { if (enabled) beacon?.resize(); else beacon?.pause(); }
      if (id === '3' && !enabled) {
        $('#lunar-module').classList.remove('is-pulsing');
        $('#pulse-module').textContent = 'Activar pulso';
      }
      if (id === '5') {
        if (enabled && !document.hidden) monitor.start();
        else { monitor.stop(); monitor.release(); }
      }
      document.dispatchEvent(new CustomEvent('orbit:mission', { detail: { id, active: enabled } }));
      $('#mission-count').textContent = `${active.size} / 5 activas`;
      showCode(enabled ? id : active.has(selected) ? selected : [...active].at(-1) || null);
    };
    const renderCore = ({ clicks, energy, action }) => {
      $('#closure-clicks').textContent = clicks;
      $('#closure-energy').textContent = energy;
      $('#closure-action').textContent = action;
      $('#energy-progress').value = energy;
    };

    $$('.mission-toggle').forEach((button) => on(button, 'click', () => {
      const id = button.closest('[data-mission]').dataset.mission;
      setMission(id, !active.has(id));
    }));
    on($('#activate-all'), 'click', () => ['1', '2', '3', '4', '5'].forEach((id) => setMission(id, true)));
    on($('#deactivate-all'), 'click', () => ['1', '2', '3', '4', '5'].forEach((id) => setMission(id, false)));
    $$('#code-tabs button').forEach((button) => on(button, 'click', () => showCode(button.dataset.code)));
    on($('#copy-code'), 'click', async () => {
      try {
        await navigator.clipboard.writeText($('#live-code').textContent);
        $('#copy-status').textContent = 'Código copiado.';
      } catch {
        const range = document.createRange();
        range.selectNodeContents($('#live-code'));
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        $('#copy-status').textContent = 'Código seleccionado. Pulsa Ctrl+C para copiar.';
      }
    });
    on($('#signal-name'), 'input', () => beacon?.draw());
    on($('#signal-speed'), 'input', (event) => { $('#signal-speed-output').value = `${event.target.value}×`; });
    on($('#signal-play'), 'click', () => beacon?.play());
    on($('#signal-pause'), 'click', () => beacon?.pause());
    on($('#signal-reset'), 'click', () => beacon?.reset());
    on($('#charge-core'), 'click', () => renderCore(core.charge()));
    on($('#reset-core'), 'click', () => renderCore(core.reset()));
    on($('#highlight-module'), 'click', toggleModuleEnergy);
    on($('#pulse-module'), 'click', () => {
      const enabled = $('#lunar-module').classList.toggle('is-pulsing');
      $('#pulse-module').textContent = enabled ? 'Detener pulso' : 'Activar pulso';
    });
    on($('#reset-module'), 'click', () => {
      $('#lunar-module').classList.remove('is-highlighted', 'is-pulsing');
      $('#highlight-module').setAttribute('aria-pressed', 'false');
      $('#pulse-module').textContent = 'Activar pulso';
      $('#module-state').textContent = 'SISTEMAS EN ESPERA';
      $('#contact-form').reset();
      $('#crew-email').removeAttribute('aria-invalid');
      $('#email-message').classList.remove('is-error', 'is-valid');
      $('#email-message').textContent = 'Validación local: no se envía ni se guarda tu correo.';
    });
    // Capturing ocurre antes del handler del botón; bubbling después.
    on($('#mission-3'), 'click', (event) => {
      if (event.target.closest('button')) $('#event-path').textContent = '1. Captura en la misión';
    }, { capture: true });
    on($('#mission-3'), 'click', (event) => {
      if (event.target.closest('button')) $('#event-path').textContent += ' → 2. Acción del botón → 3. Burbujeo en la misión';
    });
    on($('#contact-form'), 'submit', validateEmail);
    on($('#crew-email'), 'input', () => {
      $('#crew-email').removeAttribute('aria-invalid');
      $('#email-message').classList.remove('is-error', 'is-valid');
      $('#email-message').textContent = 'Pulsa Validar para comprobar la dirección.';
    });
    on($('#analyze-performance'), 'click', monitor.analyze);
    on($('#retain-memory'), 'click', monitor.retain);
    on($('#release-memory'), 'click', monitor.release);
    on(document, 'visibilitychange', () => {
      if (document.hidden) { beacon?.pause(); monitor.stop(); }
      else if (active.has('5')) monitor.start();
    });
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    on(motion, 'change', () => { if (motion.matches) beacon?.pause(); });
    const observer = new ResizeObserver(() => { if (active.has('1')) beacon?.resize(); });
    observer.observe($('#signal-canvas'));
    renderCore(core.reset());
    ['1', '2', '3', '4', '5'].forEach((id) => setMission(id, false));
    setMission('1', true);

    dispose = () => {
      controller.abort();
      listeners = 0;
      observer.disconnect();
      beacon?.pause();
      monitor.stop();
      monitor.release();
      dispose = null;
    };
  };
  window.addEventListener('pagehide', () => dispose?.());
  window.addEventListener('pageshow', mount);
  mount();
})();
