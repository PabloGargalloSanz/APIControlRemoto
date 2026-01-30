// Variables de Estado
let isBypassLogin = false;
let isBypassOps = false;
let currentUser = "admin";

// config front
const API_URL = "http://localhost:4000"; 
const POLLING_RATE = 10000; ///10s

// Referencias DOM
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');

// login////////////////////////////////
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
            // guardamso token
            localStorage.setItem('auth_token', data.token);
            currentUser = email;
            
            loginScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
            
            // Iniciamos el dashboard
            updateDashboard();

        } else {
            showToast(data.error || "Acceso denegado", 'danger');
        }
    } catch (error) {
        showToast("Error de conexión con el servidor de autenticación", 'danger');
    }
});

// logout
function logout() {
    location.reload();
}

// navegacion////////////////////////////
function switchPage(pageId) {
    // actualizar botones
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${pageId}`).classList.add('active');
    
    // cambiar secciones
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(`page-${pageId}`).classList.remove('hidden');    
    document.getElementById('page-title').innerText = pageId.charAt(0).toUpperCase() + pageId.slice(1);
}


// terminal shell///////////////////////////////////////
const termInput = document.getElementById('terminal-input');
const termOutput = document.getElementById('terminal-output');
const termWord = document.getElementById('palabra');
let currentPath = "C:/Users/PabloGargalloSanz/Desktop/Pablo/Servidor/APIControlRemoto/backend";

if(termInput) {
    termInput.addEventListener('keypress', async (e) => {

        if(e.key === 'Enter') {
            const cmd = termInput.value.trim();
            const key = termWord?.innerText?.trim() ?? "";
            if(!cmd) return;
            
            // Mostrar comando en terminal
            const line = document.createElement('p');
            line.innerHTML = `<span class="prompt">➜ ${currentPath}</span> ${cmd}`;
            termOutput.appendChild(line);
            
            // Respuesta simulada
            const resp = document.createElement('p');
            resp.style.color = "#94a3b8";
            resp.style.marginLeft = "1rem";
            resp.innerText = "Procesando...";
            termOutput.appendChild(resp);
                                    
            addAuditLog(`SHELL: ${cmd}`, isBypassOps ? "ALERT" : "OK");
            termInput.value = "";

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

                if (data.cwd) {
                    currentPath = data.cwd;
                }

                if (response.ok) {
                    resp.innerText = data.output || "Comando ejecutado (sin salida)";
                } else {
                    resp.innerText = `Error: ${data.error || "Acceso denegado"}`;
                    resp.style.color = "#ef4444";
                    showToast(data.error || "Fallo en la ejecución", 'danger');
                }
                setTimeout(() => {
                    termOutput.scrollTo({
                        top: termOutput.scrollHeight,
                        behavior: 'smooth' 
                    });
                }, 100);
            
            } catch (error) {
                showToast("Error de conexión con el servidor de autenticación", 'danger');
            }

        }
    });
}


// logs auditoria////////////////////////////////////////
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


function quickAction(type) {
    showToast(`Acción: ${type} solicitada`);
    addAuditLog(`ACTION: ${type.toUpperCase()}`, isBypassOps ? "ALERT" : "OK");
}

// actualizacion metricas dashboard///////////////////
async function updateDashboard() {
    try {
        const response = await fetch(`${API_URL}/api/metrics/status`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });

        const data = await response.json();
        const m = data.metrics;

        // barras de progreso
        
        // cpu
        updateMetric('cpu', m.cpu.val, m.cpu.percent, m.cpu.unit, 'usage');
        updateMetric('cpu-temp', m.cpuTemp.val, m.cpuTemp.percent, m.cpuTemp.unit, 'usage');
        updateMetric('cpu-carga', m.cpuCarga.val, m.cpuCarga.percent, m.cpuCarga.unit, 'usage');

        // ram
        updateMetric('ram', m.ram.val, m.ram.percent, m.ram.unit, 'available');
        updateMetric('ram-uso', m.ramUso.val, m.ramUso.percent, m.ramUso.unit, 'usage');
        updateMetric('swap', m.swapUso.val, m.swapUso.percent, m.swapUso.unit, 'usage');

        // disco
        updateMetric('disk', m.discoUso.val, m.discoUso.percent, m.discoUso.unit, 'usage');
        updateMetric('disk-read', m.diskRead.val, m.diskRead.percent, m.diskRead.unit, 'usage');
        updateMetric('disk-write', m.diskWrite.val, m.diskWrite.percent, m.diskWrite.unit, 'usage');

        // red
        updateMetric('red-in', m.netIn.val, m.netIn.percent, m.netIn.unit, 'usage');
        updateMetric('red-out', m.netOut.val, m.netOut.percent, m.netOut.unit, 'usage');

        // alertas
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

// dar colores y unidades a las barras
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


// popups //////////////////////////////////
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
        
        setTimeout(() => {
            toast.remove();
        }, 500); 
    }, 4000); //  visible 4 segundos
}

/*
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
*/

// Iniciar el bucle de consulta////////////////////////////////////////////
setInterval(updateDashboard, POLLING_RATE);