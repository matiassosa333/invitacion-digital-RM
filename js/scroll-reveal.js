export function activarScrollRevealGeneral() {
  const secciones = document.querySelectorAll('section');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('seccion-visible');
        observer.unobserve(entry.target); // se anima una sola vez
      }
    });
  }, { threshold: 0.15 });

  secciones.forEach((seccion) => observer.observe(seccion));
}