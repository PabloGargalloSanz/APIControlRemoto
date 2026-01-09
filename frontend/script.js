// Variables de Estado
let isBypassLogin = false;
let isBypassOps = false;
let currentUser = "admin";

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
    
    startMetricsSimulation();
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

// --- MÉTRICAS ---
function startMetricsSimulation() {
    setInterval(() => {
        const cpu = Math.floor(Math.random() * 30) + 5;
        const ram = Math.floor(Math.random() * 10) + 40;
        
        document.getElementById('cpu-text').innerText = cpu + "%";
        document.getElementById('cpu-bar').style.width = cpu + "%";
        
        document.getElementById('ram-text').innerText = ram + "%";
        document.getElementById('ram-bar').style.width = ram + "%";
    }, 2500);
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