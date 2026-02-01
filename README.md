# Cockpit-MergerFS-Storage

!https://github.com/mrooks84-gif/Cockpit-MergerFS-Storage/raw/refs/heads/main/screenshot.png

A custom Cockpit plugin that auto-detects MergerFS pools. It provides a real-time visual breakdown of storage and tracks usage trends over a rolling 40-day period.
I am only a beginner and really needed this feature, i couldent find one that anyone else has created so i built one with the help of ai, i hope it helps others.
Anyone is welcome to make changes.

Summary of What This Does
Automatic Detection: No more hardcoding paths. It finds your MergerFS mount using system-level calls.

Visual Status: A clean doughnut chart shows your current ratio of Used vs. Free space.

Stat Cards: Clearly separated boxes showing the exact gigabytes/terabytes of your pool.

Trend Logging: Automatically records one usage point every 24 hours (saved in browser storage) to build a 40-day trend line.

The Commands below and plugin have only been tested on Ubuntu Server.

# Create the plugin directory
` sudo mkdir -p /usr/share/cockpit/mergerfs-storage `
# Download chart.min.js
` sudo wget https://cdn.jsdelivr.net/npm/chart.js -O /usr/share/cockpit/mergerfs-storage/chart.min.js `
# Download index.html
` sudo wget https://github.com/mrooks84-gif/Cockpit-MergerFS-Storage/raw/refs/heads/main/index.html -O /usr/share/cockpit/mergerfs-storage/index.html `
# Download manifest.json
` sudo wget https://github.com/mrooks84-gif/Cockpit-MergerFS-Storage/raw/refs/heads/main/manifest.json -O /usr/share/cockpit/mergerfs-storage/manifest.json `
# Download script.js
` sudo wget https://github.com/mrooks84-gif/Cockpit-MergerFS-Storage/raw/refs/heads/main/script.js -O /usr/share/cockpit/mergerfs-storage/script.js `
# Download change folder owner to root
` sudo chown -R root:root /usr/share/cockpit/mergerfs-storage `
# Download change folder permission
` sudo chmod -R 755 /usr/share/cockpit/mergerfs-storage `
# Restart Cockpit
` sudo systemctl restart cockpit `


