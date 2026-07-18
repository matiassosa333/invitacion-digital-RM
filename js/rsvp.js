import { supabase } from './supabase-client.js';

const NUMERO_WHATSAPP_PLANNER = '595981234567'; // <-- reemplazar con el número real, formato internacional sin +

let familiaActual = null;
let asistenciaElegida = null; // true = sí, false = no

export function inicializarRSVP(datosFamilia) {
  familiaActual = datosFamilia;
  if (!familiaActual) return;

  // Llenar el <select> con opciones de 0 hasta pases_asignados
  const select = document.getElementById('pasesConfirmados');
  select.innerHTML = '';
  for (let i = familiaActual.pases_asignados; i >= 1; i--) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${i} de ${familiaActual.pases_asignados}`;
    select.appendChild(opt);
  }

  const btnSi = document.getElementById('btnConfirmarSi');
  const btnNo = document.getElementById('btnConfirmarNo');
  const detalles = document.getElementById('rsvpDetalles');
  const btnEnviar = document.getElementById('btnEnviarRSVP');

  btnSi.addEventListener('click', () => {
    asistenciaElegida = true;
    btnSi.classList.add('activo');
    btnNo.classList.remove('activo');
    detalles.style.display = 'flex';
  });

  btnNo.addEventListener('click', () => {
    asistenciaElegida = false;
    btnNo.classList.add('activo');
    btnSi.classList.remove('activo');
    detalles.style.display = 'none';
    enviarConfirmacion(0, ''); // si dice que no, se envía directo sin más pasos
  });

  btnEnviar.addEventListener('click', () => {
    const pasesConfirmados = parseInt(document.getElementById('pasesConfirmados').value, 10);
    const mensaje = document.getElementById('mensajeNovios').value.trim();
    enviarConfirmacion(pasesConfirmados, mensaje);
  });
}

async function enviarConfirmacion(pasesConfirmados, mensaje) {
  const estado = asistenciaElegida ? 'confirmado' : 'rechazado';

  const { error } = await supabase.rpc('confirmar_asistencia', {
    p_slug: familiaActual.slug,
    p_pases_confirmados: pasesConfirmados,
    p_mensaje: mensaje,
    p_estado: estado,
  });

  if (error) {
    console.error('Error al confirmar:', error);
    alert('Hubo un problema al enviar tu confirmación. Por favor intenta de nuevo.');
    return;
  }

  // Ocultar formulario, mostrar agradecimiento
  document.getElementById('rsvpForm').style.display = 'none';
  document.getElementById('rsvpGracias').style.display = 'block';

  // Generar y abrir el link de WhatsApp hacia la planner
  abrirWhatsAppPlanner(estado, pasesConfirmados, mensaje);
}

function abrirWhatsAppPlanner(estado, pasesConfirmados, mensaje) {
  const nombres = familiaActual.nombres_invitados?.join(', ') || familiaActual.nombre_grupo;

  const textoEstado = estado === 'confirmado' ? '✅ CONFIRMÓ asistencia' : '❌ NO podrá asistir';

  let texto = `${textoEstado}\n`;
  texto += `Grupo: ${familiaActual.nombre_grupo}\n`;
  texto += `Nombres: ${nombres}\n`;
  texto += `Pases asignados: ${familiaActual.pases_asignados}\n`;

  if (estado === 'confirmado') {
    texto += `Pases confirmados: ${pasesConfirmados}\n`;
  }
  if (mensaje) {
    texto += `Mensaje: "${mensaje}"\n`;
  }

  const url = `https://wa.me/${NUMERO_WHATSAPP_PLANNER}?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank');
}

// === Countdown de la fecha límite de RSVP ===
export function iniciarCountdownRSVP(fechaLimiteISO) {
  const fechaLimite = new Date(fechaLimiteISO).getTime();

  document.getElementById('fechaLimiteTexto').textContent =
    new Date(fechaLimiteISO).toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric' });

  function actualizar() {
    const ahora = new Date().getTime();
    const diferencia = fechaLimite - ahora;

    if (diferencia <= 0) {
      document.getElementById('countdownRSVP').innerHTML = '<p>El plazo de confirmación ha finalizado</p>';
      clearInterval(intervalo);
      return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    document.getElementById('rsvpDias').textContent = String(dias).padStart(2, '0');
    document.getElementById('rsvpHoras').textContent = String(horas).padStart(2, '0');
    document.getElementById('rsvpMinutos').textContent = String(minutos).padStart(2, '0');

    // Urgencia visual en los últimos 15 días
    const countdownEl = document.getElementById('countdownRSVP');
    if (dias <= 15) {
      countdownEl.classList.add('countdown-urgente');
    }
  }

  actualizar();
  const intervalo = setInterval(actualizar, 60000); // actualiza cada minuto
}