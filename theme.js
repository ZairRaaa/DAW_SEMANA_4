/* Asistencia de IA: tema persistente y adaptación a la preferencia del sistema. */
(() => {
  'use strict';

  const storageKey = 'orbita-color-theme';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'dark' || saved === 'light') preference = saved;
  } catch {
    // El tema también funciona cuando el navegador bloquea el almacenamiento.
  }

  const applyTheme = () => {
    const dark = preference ? preference === 'dark' : systemTheme.matches;
    document.documentElement.classList.toggle('dark-mode', dark);
    const button = document.querySelector('#theme-toggle');
    if (!button) return;
    button.setAttribute('aria-pressed', String(dark));
    button.title = dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    document.querySelector('#theme-icon').textContent = dark ? '☀' : '☾';
    document.querySelector('#theme-label').textContent = dark ? 'Modo claro' : 'Modo oscuro';
  };

  // Se ejecuta antes del CSS para evitar un destello claro al restaurar el tema.
  applyTheme();
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    document.querySelector('#theme-toggle').addEventListener('click', () => {
      preference = document.documentElement.classList.contains('dark-mode') ? 'light' : 'dark';
      try { localStorage.setItem(storageKey, preference); } catch { /* Preferencia en memoria. */ }
      applyTheme();
    });
  }, { once: true });
  systemTheme.addEventListener('change', () => { if (!preference) applyTheme(); });
  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : null;
    applyTheme();
  });
})();
