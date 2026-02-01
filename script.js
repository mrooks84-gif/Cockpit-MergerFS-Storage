let TARGET_PATH = ""; 
let storageChart, historyChart;
let historyData = JSON.parse(localStorage.getItem('mergerfs_trend_40')) || [];

async function findMergerFSPath() {
    try {
        const output = await cockpit.spawn(["df", "--output=target,fstype"], { superuser: "try" });
        const lines = output.trim().split('\n');
        for (let line of lines) {
            if (line.toLowerCase().includes("mergerfs")) {
                return line.split(/\s+/)[0];
            }
        }
        return "Not Found"; 
    } catch (err) {
        return "Error";
    }
}

function initCharts() {
    const ctx1 = document.getElementById('storageChart').getContext('2d');
    storageChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Used', 'Free'],
            datasets: [{ data: [0, 100], backgroundColor: ['#0066cc', '#3e8635'], borderWidth: 0 }]
        },
        options: { cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    const ctx2 = document.getElementById('historyChart').getContext('2d');
    historyChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: historyData.map(d => d.date),
            datasets: [{
                label: 'Usage %',
                data: historyData.map(d => d.val),
                borderColor: '#0066cc',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } },
                x: { ticks: { maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 20 } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function updateSpace() {
    if (!TARGET_PATH || ["Not Found", "Error"].includes(TARGET_PATH)) return;

    cockpit.spawn(["df", "-h", TARGET_PATH], { superuser: "try" }).then(output => {
        const stats = output.trim().split('\n').pop().split(/\s+/);
        const size = stats[1], used = stats[2], avail = stats[3], pUsed = parseInt(stats[4]);
        const today = new Date().toLocaleDateString();

        document.getElementById("size-text").innerText = size;
        document.getElementById("used-text").innerText = used + " (" + pUsed + "%)";
        document.getElementById("avail-text").innerText = avail;
        document.getElementById("path-display").innerText = TARGET_PATH;

        storageChart.data.datasets[0].data = [pUsed, 100 - pUsed];
        storageChart.update();

        const lastEntry = historyData[historyData.length - 1];
        if (!lastEntry || lastEntry.date !== today) {
            historyData.push({ date: today, val: pUsed });
            if (historyData.length > 40) historyData.shift();
            localStorage.setItem('mergerfs_trend_40', JSON.stringify(historyData));
            historyChart.data.labels = historyData.map(d => d.date);
            historyChart.data.datasets[0].data = historyData.map(d => d.val);
            historyChart.update();
        }
    });
}

window.onload = async function() {
    initCharts();
    TARGET_PATH = await findMergerFSPath();
    if (["Not Found", "Error"].includes(TARGET_PATH)) {
        document.getElementById("path-display").innerText = "No MergerFS Pool detected.";
    } else {
        updateSpace();
        setInterval(updateSpace, 3600000); // Update every hour
    }
};
