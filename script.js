let TARGET_PATH = ""; 
let storageChart, historyChart;
let historyData = JSON.parse(localStorage.getItem('mergerfs_trend_40')) || [];
let balanceProcess = null; 

function cleanTerminalOutput(text) {
    return text.replace(/\x1B\[[0-9;]*[JKmsu]/g, '').trim();
}

// --- 1. ARRAY STORAGE DISK GRID ---
async function updateHardwareGrid() {
    const container = document.getElementById("disk-health-grid");
    const parityCheckRow = document.getElementById("parity-check-container");
    if (!container) return;

    try {
        const nrRaw = await cockpit.spawn(
            ["script", "-q", "-c", "nmdctl status", "/dev/null"], 
            { superuser: "require", err: "out" }
        );
        
        const nrStatus = cleanTerminalOutput(nrRaw);
        const lines = nrStatus.split('\n');
        
        const progMatch = nrStatus.match(/Progress\s+:\s+(\d+%)/);
        const opMatch = nrStatus.match(/Operation\s+:\s+(.*)/);
        if (progMatch) {
            parityCheckRow.innerHTML = `<div class="sync-badge">🛠️ ${opMatch ? opMatch[1].trim() : 'Syncing'}: ${progMatch[1]}</div>`;
        } else { parityCheckRow.innerHTML = ""; }

        let html = "";
        for (const line of lines) {
            const trimmedLine = line.trim();
            const parts = trimmedLine.split(/\s+/);
            const slot = parts[0];
            
            if (slot === "P" || slot === "Q" || /^\d+$/.test(slot)) {
                const isParity = (slot === "P" || slot === "Q");
                const rawStatus = parts[1];
                const dev = parts[2];
                
                let usagePercent = "";
                parts.forEach(p => {
                    if (p.includes('%')) usagePercent = p;
                });
                
                let smartInfo = "Loading SMART data...";
                try {
                    const baseDev = dev.replace(/[0-9]/g, '');
                    const sOut = await cockpit.spawn(["smartctl", "-H", "/dev/" + baseDev], { superuser: "require" });
                    smartInfo = cleanTerminalOutput(sOut);
                } catch(e) { smartInfo = "SMART Not Available"; }

                html += generateDiskTile(slot, dev, rawStatus, usagePercent, isParity, smartInfo);
            }
        }
        container.innerHTML = html || "No disks found.";
    } catch (e) {
        container.innerHTML = `<div style="padding:20px; color:#d20000;">⚠️ Access Error: Check Administrative Access.</div>`;
    }
}

function generateDiskTile(slot, dev, rawStatus, usage, isParity, smartInfo) {
    const css = isParity ? 'class="parity-disk"' : '';
    const label = isParity ? `PARITY ${slot}` : `DISK ${slot}`;
    const isOk = rawStatus.includes("OK");
    const dot = isOk ? "🟢" : "🔴";
    const statusLabel = isOk ? "Online" : "Offline";
    
    let color = "#1e8e3e";
    let usageDisplay = "";

    if (isParity || usage === "-") {
        usageDisplay = "PROTECTED";
        color = "#0066cc";
    } else if (usage && usage.includes("%")) {
        usageDisplay = usage + " USED";
        const pNum = parseInt(usage);
        if (pNum > 90) color = "#d20000";
        else if (pNum > 75) color = "#f0ad4e";
    } else {
        usageDisplay = "ACTIVE DATA";
    }

    return `
        <table ${css}>
            <tr>
                <td>
                    <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 5px;">
                        ${label} (${dev}) 
                        <span class="status-dot" title="${smartInfo}">${dot}</span>
                    </div>
                    <div style="color: ${color}; font-size: 0.9rem; font-weight: bold;">
                        ${usageDisplay}
                    </div>
                    <div style="font-size: 0.7rem; color: #888; margin-top: 5px;">
                        Status: ${statusLabel}
                    </div>
                </td>
            </tr>
        </table>`;
}

// --- 2. TRENDS & CHARTING ---
function recordTrendData(p) {
    const day = new Date().toLocaleDateString();
    let h = JSON.parse(localStorage.getItem('mergerfs_trend_40')) || [];
    if (!h.length || h[h.length-1].date !== day) {
        h.push({ date: day, val: p });
        if (h.length > 40) h.shift();
        localStorage.setItem('mergerfs_trend_40', JSON.stringify(h));
        if (historyChart) {
            historyChart.data.labels = h.map(d => d.date);
            historyChart.data.datasets[0].data = h.map(d => d.val);
            historyChart.update();
        }
    }
}

function initCharts() {
    const storageCtx = document.getElementById('storageChart');
    if (storageCtx) {
        storageChart = new Chart(storageCtx, {
            type: 'doughnut',
            data: { 
                labels: ['Used', 'Free'], 
                datasets: [{ data: [0, 100], backgroundColor: ['#0066cc', '#3e8635'], borderWidth: 0 }] 
            },
            options: { 
                cutout: '75%', 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        displayColors: false,
                        callbacks: {
                            title: () => '',
                            label: function(context) {
                                return context.raw + '% ' + context.label;
                            }
                        }
                    }
                } 
            }
        });
    }
    const historyCtx = document.getElementById('historyChart');
    if (historyCtx) {
        historyChart = new Chart(historyCtx, {
            type: 'line',
            data: { labels: historyData.map(d => d.date), datasets: [{ data: historyData.map(d => d.val), borderColor: '#0066cc', fill: true, tension: 0.3 }] },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                scales: { y: { beginAtZero: true, max: 100 } }, 
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) { return context.raw + '% Used'; }
                        }
                    }
                } 
            }
        });
    }
}

async function updateSpace() {
    if (!TARGET_PATH || TARGET_PATH === "Not Found") {
        TARGET_PATH = await findPath();
    }
    try {
        const out = await cockpit.spawn(["df", "-h", TARGET_PATH]);
        const s = out.trim().split('\n').pop().split(/\s+/);
        const p = parseInt(s[4]);
        
        const usedVal = s[2].replace(/[a-zA-Z]/g, '') + " TB";
        const freeVal = s[3].replace(/[a-zA-Z]/g, '') + " TB";
        const totalVal = s[1].replace(/[a-zA-Z]/g, '') + " TB";

        document.getElementById("used-text").innerText = usedVal + " (" + p + "%)";
        document.getElementById("avail-text").innerText = freeVal;
        document.getElementById("size-text").innerText = totalVal;
        document.getElementById("path-display").innerText = TARGET_PATH;
        
        if (storageChart) {
            storageChart.data.datasets[0].data = [p, 100 - p];
            storageChart.update();
        }
        recordTrendData(p);
        updateHardwareGrid(); 
    } catch (e) {}
}

async function findPath() {
    try {
        const out = await cockpit.spawn(["df", "--output=target,fstype"]);
        for (let l of out.split('\n')) { if (l.includes("mergerfs")) return l.split(/\s+/)[0]; }
    } catch (e) {}
    return "Not Found";
}

function setupButtons() {
    const startBtn = document.getElementById("btn-start-balance");
    const stopBtn = document.getElementById("btn-stop-balance");
    const statusBox = document.getElementById("balance-status-box");
    if (startBtn) {
        startBtn.onclick = async () => {
            statusBox.innerText = "> Running Balance...";
            startBtn.disabled = true; stopBtn.disabled = false;
            try {
                balanceProcess = cockpit.spawn(["mergerfs.balance", TARGET_PATH], { superuser: "require", err: "out" });
                balanceProcess.stream(data => { statusBox.innerText = "> " + data.trim().split('\n').pop(); });
                await balanceProcess;
                statusBox.innerText = "> Complete.";
                updateSpace(); resetUI();
            } catch (err) { statusBox.innerText = "> Stopped."; resetUI(); }
        };
    }
    if (stopBtn) stopBtn.onclick = () => { if (balanceProcess) balanceProcess.close(); };
    function resetUI() { startBtn.disabled = false; stopBtn.disabled = true; }
}

window.onload = async () => {
    initCharts(); setupButtons();
    updateSpace();
    setInterval(updateSpace, 30000); 
};
