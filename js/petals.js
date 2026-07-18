const COLORES_PETALOS = ['#709282', '#EFA8B0', '#F5D76E', '#AEC6E8'];
const CANTIDAD_PETALOS = 14;

export function iniciarAnimacionPetalos() {
  const contenedor = document.getElementById('petalosContenedor');
  if (!contenedor) return;

  for (let i = 0; i < CANTIDAD_PETALOS; i++) {
    crearPetalo(contenedor);
  }
}

function crearPetalo(contenedor) {
  const petalo = document.createElement('div');
  petalo.classList.add('petalo');

  const tamano = Math.random() * 8 + 12;       // entre 12px y 20px
  const posicionInicial = Math.random() * 100;  // % izquierda-derecha
  const duracion = Math.random() * 8 + 10;       // entre 10s y 18s (más lento = más realista)
  const retraso = Math.random() * 12;
  const color = COLORES_PETALOS[Math.floor(Math.random() * COLORES_PETALOS.length)];
  const balanceo1 = Math.random() * 80 - 40;
  const balanceo2 = Math.random() * 80 - 40;
  const rotacionFinal = Math.random() * 720 - 360; // giro variable, más natural

  petalo.style.width = `${tamano}px`;
  petalo.style.height = `${tamano * 1.25}px`;
  petalo.style.left = `${posicionInicial}%`;
  petalo.style.background = `linear-gradient(135deg, ${color} 0%, var(--color-rosa-oscuro) 100%)`;
  petalo.style.setProperty('--balanceo1', `${balanceo1}px`);
  petalo.style.setProperty('--balanceo2', `${balanceo2}px`);
  petalo.style.setProperty('--rotacion-final', `${rotacionFinal}deg`);
  petalo.style.animation = `caer ${duracion}s ease-in-out ${retraso}s infinite`;

  contenedor.appendChild(petalo);
}