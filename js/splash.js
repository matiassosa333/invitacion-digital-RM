export function inicializarSplash() {
  const splash = document.getElementById('splashSobre');

  if (!splash) {
    console.warn('No se encontró #splashSobre en el HTML');
    return;
  }

  document.body.classList.add('splash-bloqueado');

  splash.addEventListener('click', () => {
    splash.classList.add('splash-tocado');

    setTimeout(() => {
      splash.classList.add('splash-oculto');
      document.body.classList.remove('splash-bloqueado');
    }, 350);
  });
}