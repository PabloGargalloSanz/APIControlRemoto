// config front
const API_URL = ""; 
const POLLING_RATE = 10000; ///10s

// Variables globales
let currentUser = localStorage.getItem('user_email') || "Desconocido";

// ref DOM
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const metrics = document.getElementById('btn-audit-metrics');
const erroresLog = document.getElementById('btn-audit-errores');
const shell = document.getElementById('btn-audit-shell');


// login///////////////////////

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('username').value;
    const tokenInput = document.getElementById('token').value; 

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: tokenInput })
        });

        const data = await response.json();

        if (response.ok) {
            // guardar token y usuario
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_email', email); // guardar email
            currentUser = email;
            
            loginScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
            
            // cargamos dashboard
            updateDashboard();

        } else {
            showToast(data.error || "Acceso denegado", 'danger');
        }
    } catch (error) {
        showToast("Error de conexión con el servidor de autenticación", 'danger');
    }
});

// logout////////////////////

function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    location.reload();
}

function switchPage(pageId) {
    // Actualizar botones
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`btn-${pageId}`);
    if(btn) btn.classList.add('active');
    
    // Cambiar secciones
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    const page = document.getElementById(`page-${pageId}`);
    if(page) page.classList.remove('hidden');
    
    const title = document.getElementById('page-title');
    if(title) title.innerText = pageId.charAt(0).toUpperCase() + pageId.slice(1);
}

// shell//////////////////////

const termInput = document.getElementById('terminal-input');
const termOutput = document.getElementById('terminal-output');
const termWord = document.getElementById('palabra');
let currentPath = "";

if(termInput) {
    termInput.addEventListener('keypress', async (e) => {

        if(e.key === 'Enter') {
            const cmd = termInput.value.trim();
            const key = termWord?.innerText?.trim() ?? "";
            
            if(!cmd) return;
            
            // mostrar comando terminal
            const line = document.createElement('p');
            line.innerHTML = `<span class="prompt">➜ ${currentPath || '~'}</span> ${cmd}`;
            termOutput.appendChild(line);
            termInput.value = "";

            // mensaje cara
            const resp = document.createElement('p');
            resp.style.color = "#94a3b8";
            resp.style.marginLeft = "1rem";
            resp.innerText = "Procesando...";
            termOutput.appendChild(resp);
            
            scrollToBottom();

            try {
                const response = await fetch(`${API_URL}/api/shell/execute`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}` 
                    },
                    body: JSON.stringify({ command: cmd, key: key })
                });

                const data = await response.json();

                // actualizar path
                if (data.cwd) {
                    currentPath = data.cwd;
                }

                
                if (response.ok) {
                    
                    resp.innerText = data.output || "Comando ejecutado (sin salida)";
                    resp.style.color = "#fff"; 
                    
                    addAuditLog(`SHELL: ${cmd}`, "OK");
                    await loadShellLogs();

                } else {
                    // error credencialees
                    resp.innerText = `Error: ${data.error}`;
                    resp.style.color = "#ef4444"; 
                    
                    showToast(data.error || "Fallo en la ejecución", 'danger');
                    addAuditLog(`SHELL: ${cmd}`, "ERROR");
                }
                //scroll automatico
                scrollToBottom();
            
            } catch (error) {
                resp.innerText = "Error de conexión";
                resp.style.color = "#ef4444";
                showToast("Comando erroneo o error de conexión con el servidor", 'danger');
                addAuditLog(`SHELL: ${cmd}`, "COMMAND_FAIL//NETWORK_ERROR");
            }
        }
    });
}

function scrollToBottom() {
    if(termOutput) {
        setTimeout(() => {
            termOutput.scrollTo({
                top: termOutput.scrollHeight,
                behavior: 'smooth' 
            });
        }, 100);
    }
}

// logs auditoria////////////////////
function addAuditLog(action, status) {
    const tbody = document.getElementById('audit-logs');
    if(!tbody) return;

    const now = new Date().toLocaleTimeString();
    const row = document.createElement('tr');
    
    
    let badgeClass = 'badge-ok'; 
    if (status === 'ERROR' || status === 'FAIL' || status === 'COMMAND_FAIL//NETWORK_ERROR') {
        badgeClass = 'badge-alert'; 
    } else if (status === 'ALERT') {
        badgeClass = 'badge-alert';
    }
    
    row.innerHTML = `
        <td>${now}</td>
        <td>${currentUser}</td>
        <td style="font-family: monospace;">${action}</td>
        <td><span class="badge ${badgeClass}">${status}</span></td>
    `;
    tbody.prepend(row);
}

function quickAction(type) {
    showToast(`Acción: ${type} solicitada`);
    addAuditLog(`ACTION: ${type.toUpperCase()}`, "PENDING"); 
}

// Log metricas sistema///////////////////////////
metrics.addEventListener('click', async (e) => {
    e.preventDefault();
    loadLogMetricas();
});

async function loadLogMetricas(){
    try {
        const response = await fetch(`${API_URL}/api/metrics/warning`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
        });

        const data = await response.json();

        if (response.ok) {
            addAuditMetricsLog(data.data);

        } else {
            showToast(data.error || "Error al obtener datos", 'danger');
        }
    } catch (error) {
        showToast("Error de conexión con el servidor", 'danger');
    }
}

// Log errores///////////////////////////
erroresLog.addEventListener('click', async (e) => {
    e.preventDefault();
    loadErrores();
});

async function loadErrores(){
    try {
        const response = await fetch(`${API_URL}/api/log/error`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
        });

        const data = await response.json();

        if (response.ok) {
            addAuditErroresLog(data.data);

        } else {
            showToast(data.error || "Error al obtener datos", 'danger');
        }
    } catch (error) {
        showToast("Error de conexión con el servidor", 'danger');
    }
}

// Log shell///////////////////////////
shell.addEventListener('click', async (e) => {
    e.preventDefault();
    loadShellLogs();
});

async function loadShellLogs() {
    try {
        const response = await fetch(`${API_URL}/api/shell/logs`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
        });

        const data = await response.json();

        if (response.ok) {
            addAuditShellLog(data.data);

        } else {
            showToast(data.error || "Error al obtener datos", 'danger');
        }
    } catch (error) {
        showToast("Error de conexión con el servidor", 'danger');
    }
}

function addAuditMetricsLog(response){
    const tbody = document.getElementById('audit-metrics-logs');
    if(!tbody){return};

    tbody.innerHTML = '';

    response.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
        
            <td>${log.id}</td>
            <td>${log.componente}</td>
            <td>${log.tipo}</td>
            <td>${log.valor}</td>
            <td>${log.fecha_creado}</td>
        `;
        tbody.appendChild(row); 
    });
}

//Relleno tabla erroes
function addAuditErroresLog(response){
    const tbody = document.getElementById('audit-errores-logs');
    if(!tbody){return};

    tbody.innerHTML = '';

    response.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.id}</td>
            <td>${log.ip_origen}</td>
            <td>${log.ruta}</td>
            <td><span class="badge ${log.status_codigo >= 500 ? 'badge-alert' : 'badge-ok'}">${log.status_codigo}</span></td>
            <td>${log.detalles}</td>
            <td>${log.fecha_creado}</td>
        `;
        tbody.appendChild(row); 
    });
}

function addAuditShellLog(response){
    const tbody = document.getElementById('audit-shell-logs');
    if(!tbody){return};

    tbody.innerHTML = '';

    response.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
        
            <td>${log.id}</td>
            <td>${log.ip_origen}</td>
            <td>${log.comando_ejecutado}</td>
            <td>${log.status_codigo}</td>
            <td>${log.fecha_creado}</td>
        `;
        tbody.appendChild(row); 
    });
}

// dashboard////////////////
async function updateDashboard() {
    if(mainApp.classList.contains('hidden')) return;

    try {
        const response = await fetch(`${API_URL}/api/metrics/status`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        
        if (response.status === 401) {
            logout();
            return;
        }

        const data = await response.json();
        const m = data.metrics;

        if(!m) return;

        // Actualizar barras
        updateMetric('cpu', m.cpu.val, m.cpu.percent, m.cpu.unit, 'usage');
        updateMetric('cpu-temp', m.cpuTemp.val, m.cpuTemp.percent, m.cpuTemp.unit, 'usage');
        updateMetric('cpu-carga', m.cpuCarga.val, m.cpuCarga.percent, m.cpuCarga.unit, 'usage');

        updateMetric('ram', m.ram.val, m.ram.percent, m.ram.unit, 'available');
        updateMetric('ram-uso', m.ramUso.val, m.ramUso.percent, m.ramUso.unit, 'usage');
        updateMetric('swap', m.swapUso.val, m.swapUso.percent, m.swapUso.unit, 'usage');

        updateMetric('disk', m.discoUso.val, m.discoUso.percent, m.discoUso.unit, 'usage');
        updateMetric('disk-read', m.diskRead.val, m.diskRead.percent, m.diskRead.unit, 'usage');
        updateMetric('disk-write', m.diskWrite.val, m.diskWrite.percent, m.diskWrite.unit, 'usage');

        updateMetric('red-in', m.netIn.val, m.netIn.percent, m.netIn.unit, 'usage');
        updateMetric('red-out', m.netOut.val, m.netOut.percent, m.netOut.unit, 'usage');

        // Alertas del sistema
        if (data.alerts && data.alerts.length > 0) {
            data.alerts.forEach((alert, index) => {
                addAuditLog(alert.message, "ALERT");
                setTimeout(() => {
                    showToast(alert.message, alert.level);
                }, index * 300);
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

        
        let color = "#00C851"; 
        
        if (mode === 'usage') {
            if (percent > 90) color = "#ff4444"; 
            else if (percent > 75) color = "#ffbb33"; 
        } else if (mode === 'available') {
            if (percent < 10) color = "#ff4444";
            else if (percent < 25) color = "#ffbb33";
        }
        bar.style.backgroundColor = color;
    }
}

//Popup
function showToast(message, level = 'info') {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const activeLevel = level.toLowerCase();
    
    toast.className = `toast ${activeLevel}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500); 
    }, 4000);
}

// inicio
setInterval(() => {
    updateDashboard();

    const pageShell = document.getElementById('page-audit-shell');
    const pageMetrics = document.getElementById('page-audit-metrics');
    const pageErrors = document.getElementById('page-audit-errores');

    if (pageShell && !pageShell.classList.contains('hidden')) {
        loadShellLogs();
    }

    if (pageMetrics && !pageMetrics.classList.contains('hidden')) {
        loadLogMetricas();
    }

    if (pageErrors && !pageErrors.classList.contains('hidden')) {
        loadErrores();
    }

}, POLLING_RATE);