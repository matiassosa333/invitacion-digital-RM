import { supabase } from './supabase-client.js';

const NUMERO_WHATSAPP_PLANNER = '595991238882'; // <-- reemplazar con el número real, formato internacional sin +

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

  // Ocultar formulario, mostrar agradecimiento y agregar calendario
  document.getElementById('rsvpForm').style.display = 'none';
  document.getElementById('rsvpGracias').style.display = 'block';
  if (estado === 'confirmado') {
    document.getElementById('btnAgregarCalendario').addEventListener('click', generarArchivoICS);
  }


  // Generar y abrir el link de WhatsApp hacia la planner
  abrirWhatsAppPlanner(estado, pasesConfirmados, mensaje);
}

function abrirWhatsAppPlanner(estado, pasesConfirmados, mensaje) {
  const nombres = familiaActual.nombres_invitados?.join(', ') || familiaActual.nombre_grupo;

  const fraseInicial = estado === 'confirmado'
    ? 'Hola, quiero confirmar mi asistencia a la boda de Ruth y Mathias'
    : 'Hola, quiero avisar que no podré asistir a la boda de Ruth y Mathias';

  const textoEstado = estado === 'confirmado' ? '✅ CONFIRMÓ asistencia' : '❌ NO podrá asistir';

  let texto = `${fraseInicial}\n\n`;
  texto += `${textoEstado}\n`;
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

// === Agregar al calendario ===
function generarArchivoICS() {
  const fechaInicio = '20261023T200000Z'; // 23 oct 2026, 17:00 PY = 20:00 UTC
  const fechaFin = '20261024T040000Z';     // 24 oct 2026, 01:00 PY = 04:00 UTC

  const contenidoICS = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${fechaInicio}`,
    `DTEND:${fechaFin}`,
    'SUMMARY:Boda de Ruth y Mathias',
    'DESCRIPTION:¡Los esperamos con mucho cariño para celebrar juntos!',
    'LOCATION:Parroquia Virgen del Carmen, Av. Américo Picco - Villa Elisa',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([contenidoICS], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'boda-ruth-mathias.ics';
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

// === Countdown de la fecha límite de RSVP ===
export function iniciarCountdownRSVP(fechaLimiteISO) {
  const fechaLimite = new Date(fechaLimiteISO).getTime();

  document.getElementById('fechaLimiteTexto').textContent =
    new Date(fechaLimiteISO).toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric' });

  function actualizarNumero(elementoId, valorNuevo) {
    const el = document.getElementById(elementoId);
    if (el.textContent !== valorNuevo) {
      el.textContent = valorNuevo;
      el.classList.remove('flip');
      void el.offsetWidth; // fuerza el reinicio de la animación
      el.classList.add('flip');
    }
  }

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

    actualizarNumero('rsvpDias', String(dias).padStart(2, '0'));
    actualizarNumero('rsvpHoras', String(horas).padStart(2, '0'));
    actualizarNumero('rsvpMinutos', String(minutos).padStart(2, '0'));

    // Urgencia visual en los últimos 15 días
    const countdownEl = document.getElementById('countdownRSVP');
    if (dias <= 15) {
      countdownEl.classList.add('countdown-urgente');
    }
  }

  actualizar();
  const intervalo = setInterval(actualizar, 60000); // actualiza cada minuto
}