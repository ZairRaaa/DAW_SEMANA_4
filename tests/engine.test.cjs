/* Asistencia de IA: pruebas de contratos del motor con reloj y canvas simulados. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const source = readFileSync(join(__dirname, '..', 'engine.js'), 'utf8');

function setup({ contextAvailable = true } = {}) {
  let id = 0;
  let arcs = [];
  let bounds = { width: 600, height: 420 };
  const pending = new Map();
  const metrics = [];
  const states = [];
  const transforms = [];
  const context = {
    fillRect: () => { arcs = []; }, beginPath() {}, moveTo() {}, lineTo() {},
    stroke() {}, fill() {}, arc: (x, y, radius) => arcs.push({ x, y, radius }),
    setTransform: (...values) => transforms.push(values),
  };
  const canvas = {
    getContext: () => contextAvailable ? context : null,
    getBoundingClientRect: () => bounds,
  };
  // Semilla constante para comparar trayectorias con diferentes frecuencias.
  const math = Object.create(Math);
  math.random = () => 0.4;
  const sandbox = {
    window: { devicePixelRatio: 2 }, Math: math,
    requestAnimationFrame: (callback) => { pending.set(++id, callback); return id; },
    cancelAnimationFrame: (frameId) => pending.delete(frameId),
  };
  vm.runInNewContext(source, sandbox);
  const engine = sandbox.window.OrbitEngine.create(canvas, {
    onMetrics: (value) => metrics.push(value), onState: (value) => states.push(value),
  });
  return {
    engine, canvas, pending, metrics, states, transforms,
    arcs: () => arcs,
    resize: (width, height) => { bounds = { width, height }; engine.resize(); },
    frame: (timestamp) => {
      const callbacks = [...pending.values()];
      pending.clear();
      for (const callback of callbacks) callback(timestamp);
    },
  };
}

test('iniciar repetidamente mantiene un único frame; pausar y destruir lo cancelan', () => {
  const lab = setup();
  lab.engine.start();
  lab.engine.start();
  assert.equal(lab.pending.size, 1);
  lab.frame(0);
  assert.equal(lab.pending.size, 1);
  lab.engine.pause();
  assert.equal(lab.pending.size, 0);
  assert.equal(lab.engine.isRunning(), false);
  lab.engine.start();
  lab.engine.destroy();
  lab.engine.start();
  assert.equal(lab.pending.size, 0);
});

test('la trayectoria es equivalente a 30, 60 y 120 frames por segundo', () => {
  const positions = [30, 60, 120].map((hz) => {
    const lab = setup();
    lab.engine.start();
    for (let frame = 0; frame <= hz; frame += 1) lab.frame(frame * 1000 / hz);
    return lab.arcs()[0];
  });
  for (const position of positions) {
    assert.ok(Math.abs(position.x - positions[0].x) < 1e-8);
    assert.ok(Math.abs(position.y - positions[0].y) < 1e-8);
  }
});

test('reanudar reinicia el tiempo y los saltos largos quedan limitados', () => {
  const lab = setup();
  lab.engine.start();
  lab.frame(0);
  lab.frame(16);
  const before = lab.arcs()[0];
  lab.engine.pause();
  lab.engine.start();
  lab.frame(10000);
  assert.deepEqual(lab.arcs()[0], before);
  lab.frame(20000);
  const after = lab.arcs()[0];
  assert.ok(Math.hypot(after.x - before.x, after.y - before.y) <= 46 * 0.05);
});

test('valida entradas antes de cambiar el estado', () => {
  const lab = setup();
  for (const changes of [
    { count: 9 }, { count: 201 }, { count: 10.5 }, { count: NaN },
    { speed: Infinity }, { speed: 0 }, { speed: 4 },
    { palette: 'desconocida' }, { palette: '__proto__' }, { trails: 'sí' },
  ]) assert.throws(() => lab.engine.configure(changes));
  assert.equal(lab.arcs().length, 80);
  lab.engine.configure({ count: 200, speed: 3, palette: 'amber', trails: true });
  assert.equal(lab.arcs().length, 200);
  lab.engine.configure({ count: 10, speed: 0.25 });
  assert.equal(lab.arcs().length, 10);
});

test('rebotes y redimensionamiento mantienen todos los círculos dentro del canvas', () => {
  const lab = setup();
  lab.resize(80, 60);
  lab.engine.configure({ count: 10, speed: 3 });
  lab.engine.start();
  for (let frame = 0; frame < 200; frame += 1) {
    lab.frame(frame * 50);
    for (const { x, y, radius } of lab.arcs()) {
      assert.ok(x >= radius && x <= 80 - radius);
      assert.ok(y >= radius && y <= 60 - radius);
    }
  }
  assert.equal(lab.canvas.width, 160);
  assert.equal(lab.canvas.height, 120);
  assert.deepEqual(lab.transforms.at(-1), [2, 0, 0, 2, 0, 0]);
});

test('métricas usan el intervalo real y no escriben en cada frame', () => {
  const lab = setup();
  lab.engine.start();
  const initial = lab.metrics.length;
  for (let frame = 0; frame <= 10; frame += 1) lab.frame(frame * 100);
  // La física limita dt a 50 ms, pero la medición debe reflejar 100 ms.
  lab.frame(1100);
  assert.equal(lab.metrics.length, initial + 1);
  assert.ok(Math.abs(lab.metrics.at(-1).fps - 10) < 1e-8);
  assert.ok(Math.abs(lab.metrics.at(-1).frameMs - 100) < 1e-8);
});

test('diez reinicios restauran 80 partículas y no dejan frames pendientes', () => {
  const lab = setup();
  for (let cycle = 0; cycle < 10; cycle += 1) {
    lab.engine.configure({ count: 200, speed: 3 });
    lab.engine.start();
    lab.frame(cycle * 100);
    lab.engine.reset();
    assert.equal(lab.pending.size, 0);
    assert.equal(lab.arcs().length, 80);
    assert.equal(lab.metrics.at(-1).count, 80);
  }
});

test('informa cuando Canvas 2D no está disponible', () => {
  assert.throws(() => setup({ contextAvailable: false }), /Canvas 2D/);
});
