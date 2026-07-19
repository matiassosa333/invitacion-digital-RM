import { supabase } from '../js/supabase-client.js';

// ⚠️ Contraseña simple compartida — cambiala por una propia
const PASSWORD_ADMIN = 'WeddingRM';

let todosLosDatos = [];
let filtroActivo = 'todos';

// === LOGIN ===
document.getElementById('btnLogin').addEventListener('click', intentarLogin);
document.getElementById('passwordInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') intentarLogin();
});

function intentarLogin() {
  const valor = document.getElementById('passwordInput').value;
  if (valor === PASSWORD_ADMIN) {
    document.getElementById('loginContenedor').style.display = 'none';
    document.getElementById('panelContenedor').style.display = 'block';
    cargarDatos();
  } else {
    document.getElementById('loginError').textContent = 'Contraseña incorrecta';
  }
}

// === CARGA DE DATOS ===
async function cargarDatos() {
  const { data, error } = await supabase
    .rpc('obtener_todas_familias');

  if (error) {
    console.error(error);
    return;
  }

  todosLosDatos = data;
  actualizarStats(data);
  renderizarTabla(data);
}

function actualizarStats(data) {
  const confirmados = data.filter(f => f.estado === 'confirmado');
  const pendientes = data.filter(f => f.estado === 'pendiente');
  const rechazados = data.filter(f => f.estado === 'rechazado');
  const totalPases = confirmados.reduce((sum, f) => sum + (f.pases_confirmados || 0), 0);

  document.getElementById('statTotalFamilias').textContent = data.length;
  document.getElementById('statConfirmados').textContent = confirmados.length;
  document.getElementById('statPendientes').textContent = pendientes.length;
  document.getElementById('statRechazados').textContent = rechazados.length;
  document.getElementById('statPasesTotal').textContent = totalPases;
}

function renderizarTabla(data) {
  const tbody = document.getElementById('tablaBody');
  tbody.innerHTML = '';

  const busqueda = document.getElementById('buscador').value.toLowerCase();

  const filtrados = data.filter(f => {
    const coincideFiltro = filtroActivo === 'todos' || f.estado === filtroActivo;
    const coincideBusqueda = f.nombre_grupo.toLowerCase().includes(busqueda) ||
      (f.nombres_invitados || []).join(' ').toLowerCase().includes(busqueda);
    return coincideFiltro && coincideBusqueda;
  });

  filtrados.forEach(f => {
    const tr = document.createElement('tr');

    const badgeClase = `badge--${f.estado}`;
    const nombres = (f.nombres_invitados || []).join(', ');
    const link = `${window.location.origin}${window.location.pathname.replace('admin/index.html', '')}?id=${f.slug}`;

    tr.innerHTML = `
      <td>${f.nombre_grupo}</td>
      <td>${nombres}</td>
      <td>${f.pases_asignados}</td>
      <td>${f.pases_confirmados ?? '-'}</td>
      <td><span class="badge ${badgeClase}">${f.estado}</span></td>
      <td>${f.mensaje || '-'}</td>
      <td><button class="link-copiar" data-link="${link}">Copiar link</button></td>
    `;

    tbody.appendChild(tr);
  });

  // Botones de copiar link
  document.querySelectorAll('.link-copiar').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.link);
      btn.textContent = '¡Copiado!';
      setTimeout(() => btn.textContent = 'Copiar link', 1500);
    });
  });
}

// === FILTROS ===
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    filtroActivo = btn.dataset.filtro;
    renderizarTabla(todosLosDatos);
  });
});

document.getElementById('buscador').addEventListener('input', () => {
  renderizarTabla(todosLosDatos);
});

document.getElementById('btnActualizar').addEventListener('click', cargarDatos);