// Variables de Estado
let isBypassLogin = false;
let isBypassOps = false;
let currentUser = "admin";

// config front
const API_URL = "http://localhost:3000/api/metrics/status"; 
const POLLING_RATE = 10000; ///10s

// Referencias DOM
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');

// --- MANEJO DE LOGIN ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userInput = document.getElementById('username').value;
    currentUser = userInput;
    doLogin(false);
});

function loginBypass() {
    currentUser = "BYPASS_ADMIN";
    doLogin(true);
}

function doLogin(isBypass) {
    isBypassLogin = isBypass;
    loginScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
    
    if(isBypass) {
        showToast("⚠️ ACCESO MEDIANTE BYPASS");
        addAuditLog("SECURITY: LOGIN BYPASS", "ALERT");
    } else {
        showToast("Bienvenido al Panel de Control");
        addAuditLog("LOGIN: Usuario autenticado", "OK");
    }
    
    updateDashboard();
}

function logout() {
    location.reload();
}

// --- NAVEGACIÓN ---
function switchPage(pageId) {
    // Actualizar botones del menú
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${pageId}`).classList.add('active');
    
    // Cambiar secciones
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(`page-${pageId}`).classList.remove('hidden');
    
    document.getElementById('page-title').innerText = pageId.charAt(0).toUpperCase() + pageId.slice(1);
}

// --- BYPASS DE OPERACIONES ---
function toggleBypass(active) {
    isBypassOps = active;
    const alertBar = document.getElementById('bypass-alert');
    if(active) {
        alertBar.classList.remove('hidden');
        showToast("Modo Bypass Operacional: ON");
        addAuditLog("SECURITY: OPS BYPASS ACTIVATED", "ALERT");
    } else {
        alertBar.classList.add('hidden');
        showToast("Seguridad restaurada");
        addAuditLog("SECURITY: OPS BYPASS DEACTIVATED", "OK");
    }
}


// --- TERMINAL ---
const termInput = document.getElementById('terminal-input');
const termOutput = document.getElementById('terminal-output');

if(termInput) {
    termInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            const cmd = termInput.value.trim();
            if(!cmd) return;
            
            // Mostrar comando en terminal
            const line = document.createElement('p');
            const modeLabel = isBypassOps ? "[BYPASS]" : "[SECURE]";
            line.innerHTML = `<span class="prompt">➜ ${modeLabel}</span> ${cmd}`;
            termOutput.appendChild(line);
            
            // Respuesta simulada
            const resp = document.createElement('p');
            resp.style.color = "#94a3b8";
            resp.style.marginLeft = "1rem";
            
            if(cmd === 'help') {
                resp.innerHTML = "Comandos: stats, reboot, clear, ls";
            } else if(cmd === 'reboot') {
                resp.innerText = "Reiniciando servidor... (Simulado)";
                quickAction('Reinicio');
            } else if(cmd === 'clear') {
                termOutput.innerHTML = "";
            } else {
                resp.innerText = `Ejecutando '${cmd}'... Hecho.`;
            }
            
            termOutput.appendChild(resp);
            termOutput.scrollTop = termOutput.scrollHeight;
            
            addAuditLog(`SHELL: ${cmd}`, isBypassOps ? "ALERT" : "OK");
            termInput.value = "";
        }
    });
}

// --- UTILIDADES ---
function addAuditLog(action, status) {
    const tbody = document.getElementById('audit-logs');
    const now = new Date().toLocaleTimeString();
    const row = document.createElement('tr');
    
    const badgeClass = status === 'OK' ? 'badge-ok' : 'badge-alert';
    
    row.innerHTML = `
        <td>${now}</td>
        <td>${currentUser}</td>
        <td style="font-family: monospace;">${action}</td>
        <td><span class="badge ${badgeClass}">${status}</span></td>
    `;
    tbody.prepend(row);
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function quickAction(type) {
    showToast(`Acción: ${type} solicitada`);
    addAuditLog(`ACTION: ${type.toUpperCase()}`, isBypassOps ? "ALERT" : "OK");
}

//funciones para formatear metricas
function formatNetSpeed(mbValue) {
    // pasamos a numero 
    const mb = parseFloat(mbValue) || 0;

    if (mb >= 1) {
        return { val: mb.toFixed(2), unit: ' MB/s' };
    } else if (mb > 0) {
        const kb = mb * 1024;
        return { val: kb.toFixed(2), unit: ' KB/s' };
    } else {
        return { val: "0", unit: ' B/s' };
    }
}

// actualizacion metricas dashboard
async function updateDashboard() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // barras de progreso

        // cpu
        updateMetric('cpu', data.metrics.cpuUso, data.metrics.cpuUso, '%', 'usage');
        updateMetric('cpu-temp', data.metrics.cpuTemp, data.metrics.cpuTemp, 'ºC', 'usage');
        const cargaPercent = (data.metrics.cpuCarga / data.metrics.cpuCores) * 100;
        updateMetric('cpu-carga', data.metrics.cpuCarga, cargaPercent, '', 'usage');

        // ram
        const ramTotalMB = parseFloat(data.metrics.ramTotal) || 16000; 
        const ramDispMB = parseFloat(data.metrics.ramDisponible) || 0;

        const ramDisponibleGB = (ramDispMB / 1024).toFixed(2);
        const ramLibrePercent = (ramDispMB / ramTotalMB) * 100;

        updateMetric('ram', ramDisponibleGB, ramLibrePercent, ' GB', 'available');
        updateMetric('ram-uso', data.metrics.ramUso, data.metrics.ramUso, '%', 'usage');
        updateMetric('swap', data.metrics.swapUso, data.metrics.swapUso, '%', 'usage');

        // disco
        const DISK_LIMIT_MB = 2600; 

        updateMetric('disk', data.metrics.discoUso, data.metrics.discoUso, '%', 'usage');

        const readMB = parseFloat(data.metrics.discoRead) ;
        const writeMB = parseFloat(data.metrics.discoWrite);

        const readPercent = (readMB / DISK_LIMIT_MB) * 100;
        const writePercent = (writeMB / DISK_LIMIT_MB) * 100;
        const readFormatted = formatNetSpeed(readMB);
        const writeFormatted = formatNetSpeed(writeMB);

        updateMetric('disk-read', readFormatted.val, readPercent, readFormatted.unit, 'usage');
        updateMetric('disk-write', writeFormatted.val, writePercent, writeFormatted.unit, 'usage');

        // red
        const NET_LIMIT_MB = 1000;

        const rawInMB = data.metrics.netIn; 
        const rawOutMB = data.metrics.netOut;

        const inFormatted = formatNetSpeed(rawInMB);
        const outFormatted = formatNetSpeed(rawOutMB);
        const inPercent = Math.min((parseFloat(rawInMB) / NET_LIMIT_MB) * 100, 100);
        const outPercent = Math.min((parseFloat(rawOutMB) / NET_LIMIT_MB) * 100, 100);

        updateMetric('red-in', inFormatted.val, inPercent, inFormatted.unit, 'usage');
        updateMetric('red-out', outFormatted.val, outPercent, outFormatted.unit, 'usage');
        
        // alertas
        if (data.alerts && data.alerts.length > 0) {
            data.alerts.forEach(alert => {
                showToast(alert.message, alert.level);
            });
        }
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

function updateMetric(id, value, percent, unit = '%', mode = 'usage') {
    const bar = document.getElementById(`${id}-bar`);
    const text = document.getElementById(`${id}-text`);

    if (bar && text) {
        bar.style.width = `${percent}%`;
        text.innerText = `${value}${unit}`;

        // cambio de color
        if (mode === 'usage') {
            if (percent > 90) bar.style.backgroundColor = "#ff4444";
            else if (percent > 75) bar.style.backgroundColor = "#ffbb33";
            else bar.style.backgroundColor = "#00C851";
        } else if (mode === 'available') {
            if (percent < 10) bar.style.backgroundColor = "#ff4444"; 
            else if (percent < 25) bar.style.backgroundColor = "#ffbb33"; 
            else bar.style.backgroundColor = "#00C851"; 
        }
    }
}

function showToast(message, level) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.className = `toast show ${level}`; 

    // ocultar popup 
    setTimeout(() => {
        toast.className = "toast hidden";
    }, 4000); //4s
}

// Iniciar el bucle de consulta
setInterval(updateDashboard, POLLING_RATE);