/* Asistencia de IA: pruebas de integración con DOM y reloj simulados; no sustituyen QA visual. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

class Element extends EventTarget {
  constructor(value = '') {
    super();
    this.value = value;
    this.textContent = '';
    this.checked = false;
    this.disabled = true;
    this.attributes = new Map();
    this.classes = new Set();
    this.classList = {
      toggle: (name, enabled) => enabled ? this.classes.add(name) : this.classes.delete(name),
    };
  }
  setAttribute(name, value) { this.attributes.set(name, value); }
}

function setup() {
  const selectors = [
    '#particle-canvas', '#controls-form', '#controls-form fieldset', '#particle-count',
    '#speed', '#palette', '#trails', '#count-output', '#speed-output', '#toggle-animation',
    '#reset-animation', '#status', '#engine-output', '.stage', '#empty-state', '#fps-output',
    '#frame-output', '#active-output', '#validation-message', '.notice',
  ];
  const elements = new Map(selectors.map((selector) => [selector, new Element()]));
  const get = (selector) => elements.get(selector);
  const reset = () => {
    get('#particle-count').value = '80';
    get('#speed').value = '1';
    get('#palette').value = 'mint';
    get('#trails').checked = false;
  };
  reset();
  get('#controls-form').reset = reset;
  get('#particle-canvas').getBoundingClientRect = () => ({ width: 600, height: 420, left: 0, top: 0 });
  get('#particle-canvas').getContext = () => ({
    fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
    fill() {}, arc() {}, setTransform() {},
  });
  const document = new Element();
  document.querySelector = get;
  document.body = new Element();
  document.hidden = false;
  const preference = new Element();
  preference.matches = true;
  const window = new Element();
  window.matchMedia = () => preference;
  window.devicePixelRatio = 1;
  const pending = new Map();
  let id = 0;
  let observers = 0;
  class ResizeObserver {
    observe() { observers += 1; }
    disconnect() { observers -= 1; }
  }
  const sandbox = vm.createContext({
    window, document, AbortController, ResizeObserver,
    requestAnimationFrame: (callback) => { pending.set(++id, callback); return id; },
    cancelAnimationFrame: (frameId) => pending.delete(frameId),
  });
  for (const file of ['engine.js', 'app.js']) {
    vm.runInContext(readFileSync(join(__dirname, '..', file), 'utf8'), sandbox);
  }
  return {
    get, document, window, preference, pending,
    observers: () => observers,
    emit: (target, type) => target.dispatchEvent(new Event(type)),
  };
}

test('prepara controles sin iniciar movimiento y permite iniciar, pausar y reiniciar', () => {
  const lab = setup();
  assert.equal(lab.get('#controls-form fieldset').disabled, false);
  assert.equal(lab.pending.size, 0);
  assert.match(lab.get('.notice').textContent, /Movimiento reducido/);
  lab.emit(lab.get('#toggle-animation'), 'click');
  assert.equal(lab.pending.size, 1);
  assert.equal(lab.get('#status').textContent, 'En movimiento');
  assert.equal(lab.get('#empty-state').classes.has('is-hidden'), true);
  lab.emit(lab.get('#toggle-animation'), 'click');
  assert.equal(lab.pending.size, 0);
  assert.equal(lab.get('#status').textContent, 'En pausa');
  lab.emit(lab.get('#reset-animation'), 'click');
  assert.equal(lab.get('#status').textContent, 'Listo para explorar');
  assert.equal(lab.get('#active-output').textContent, '80');
  assert.equal(lab.get('#empty-state').classes.has('is-hidden'), false);
});

test('actualiza parámetros y tema; un valor inválido muestra error sin cambiar el motor', () => {
  const lab = setup();
  lab.get('#particle-count').value = '200';
  lab.get('#speed').value = '3';
  lab.get('#palette').value = 'violet';
  lab.get('#trails').checked = true;
  lab.emit(lab.get('#controls-form'), 'input');
  assert.equal(lab.get('#active-output').textContent, '200');
  assert.equal(lab.get('#count-output').value, '200');
  assert.equal(lab.document.body.classes.has('theme-violet'), true);
  lab.get('#particle-count').value = '999';
  lab.emit(lab.get('#controls-form'), 'input');
  assert.match(lab.get('#validation-message').textContent, /entre 10 y 200/);
  assert.equal(lab.get('#active-output').textContent, '200');
  lab.emit(lab.get('#reset-animation'), 'click');
  assert.equal(lab.get('#validation-message').textContent, '');
  assert.equal(lab.document.body.classes.has('theme-mint'), true);
  assert.equal(lab.get('#trails').checked, false);
});

test('ocultar la pestaña pausa y volver no reinicia automáticamente', () => {
  const lab = setup();
  lab.emit(lab.get('#toggle-animation'), 'click');
  lab.document.hidden = true;
  lab.emit(lab.document, 'visibilitychange');
  assert.equal(lab.pending.size, 0);
  lab.document.hidden = false;
  lab.emit(lab.document, 'visibilitychange');
  assert.equal(lab.pending.size, 0);
});

test('diez salidas y regresos limpian observers y listeners sin duplicar acciones', () => {
  const lab = setup();
  for (let cycle = 0; cycle < 10; cycle += 1) {
    lab.emit(lab.get('#toggle-animation'), 'click');
    assert.equal(lab.pending.size, 1);
    lab.emit(lab.window, 'pagehide');
    assert.equal(lab.pending.size, 0);
    assert.equal(lab.observers(), 0);
    lab.emit(lab.get('#toggle-animation'), 'click');
    assert.equal(lab.pending.size, 0);
    lab.emit(lab.window, 'pageshow');
    lab.emit(lab.window, 'pageshow');
    assert.equal(lab.observers(), 1);
  }
});

test('activar movimiento reducido durante la animación cancela el frame', () => {
  const lab = setup();
  lab.emit(lab.get('#toggle-animation'), 'click');
  lab.preference.matches = true;
  lab.emit(lab.preference, 'change');
  assert.equal(lab.pending.size, 0);
  assert.equal(lab.get('#status').textContent, 'En pausa');
});
