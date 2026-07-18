import { supabase } from './supabase-client.js';
import { inicializarRSVP, iniciarCountdownRSVP } from './rsvp.js';
import { iniciarAnimacionPetalos } from './petals.js';
import { activarScrollRevealGeneral } from './scroll-reveal.js';


// 1. Leer el slug desde la URL (?id=familia-perez)
function obtenerSlugDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// 2. Traer los datos del invitado desde Supabase
async function cargarInvitado() {
  const slug = obtenerSlugDesdeURL();

  if (!slug) {
    document.getElementById('nombreGrupo').textContent = 'Estimado invitado';
    document.getElementById('pasesTexto').textContent = '';
    return null;
  }

  const { data, error } = await supabase
    .rpc('obtener_familia', { p_slug: slug })
    .single();

  if (error || !data) {
    console.error('No se encontró el invitado:', error);
    document.getElementById('nombreGrupo').textContent = 'Invitado no encontrado';
    return null;
  }

  // Rellenar la Sección 9 con los datos reales
  document.getElementById('nombreGrupo').textContent = data.nombre_grupo;
  document.getElementById('pasesTexto').textContent =
    `Tenemos reservados ${data.pases_asignados} ${data.pases_asignados === 1 ? 'lugar' : 'lugares'} para ti`;

  return data; // lo vamos a reusar más adelante para el RSVP
}

// 3. Animación de scroll reveal (aparece al hacer scroll hasta la sección)
function activarScrollReveal() {
  const nombreEl = document.getElementById('nombreGrupo');
  const pasesEl = document.getElementById('pasesTexto');
  const textoCompleto = nombreEl.dataset.textoCompleto || nombreEl.textContent;

  // Guardamos el texto real y vaciamos el elemento para "escribirlo" después
  nombreEl.dataset.textoCompleto = textoCompleto;
  nombreEl.textContent = '';

  let yaAnimado = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !yaAnimado) {
        yaAnimado = true;
        nombreEl.classList.add('visible');
        escribirTexto(nombreEl, textoCompleto, 80); // 80ms entre cada letra

        setTimeout(() => {
          pasesEl.classList.add('visible');
        }, textoCompleto.length * 80 + 300);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(document.getElementById('invitado'));
}

function escribirTexto(elemento, texto, velocidad) {
  let i = 0;
  elemento.textContent = '';

  const intervalo = setInterval(() => {
    if (i < texto.length) {
      elemento.textContent += texto.charAt(i);
      i++;
    } else {
      clearInterval(intervalo);
    }
  }, velocidad);
}


function activarCopiarCuenta() {
  const btnCopiar = document.getElementById('btnCopiarCuenta');
  const numeroCuenta = document.getElementById('numeroCuenta');
  const confirmacion = document.getElementById('copiarConfirmacion');

  btnCopiar.addEventListener('click', async () => {
    const textoCompleto = `Banco: ${document.querySelector('.regalo-banco').textContent}
Titular: ${document.querySelector('.regalo-titular').textContent}
Cuenta: ${numeroCuenta.textContent}`;

    try {
      await navigator.clipboard.writeText(textoCompleto);
      confirmacion.classList.add('visible');
      setTimeout(() => confirmacion.classList.remove('visible'), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  });
}
// 4. Ejecutar todo al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  iniciarAnimacionPetalos();
  activarScrollRevealGeneral();

  const datosFamilia = await cargarInvitado();
  activarScrollReveal();
  activarCopiarCuenta();

  if (datosFamilia) {
    inicializarRSVP(datosFamilia);
  }

  const { data: config } = await supabase
    .from('configuracion')
    .select('fecha_limite_rsvp')
    .single();

  if (config) {
    iniciarCountdownRSVP(config.fecha_limite_rsvp);
  }
});