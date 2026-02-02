# NonRAID & MergerFS Dashboard (Cockpit Plugin)

A dedicated, lightweight storage dashboard for the [Cockpit Project](https://cockpit-project.org/). This plugin is specifically designed to manage and monitor **NonRAID** kernel-level storage arrays and **MergerFS** pooled mounts.

This project replaces the legacy [Cockpit-MergerFS-Storage](https://github.com/mrooks84-gif/Cockpit-MergerFS-Storage) plugin with a modernized UI, real-time status tracking, and better hardware integration.

## 🤝 Authorship
This project was collaboratively designed and developed by **mrooks84-gif** and **Gemini (AI)**.

---

## ✨ Features

* **Total Array Overview:** A real-time doughnut chart displaying your total MergerFS pool capacity (Used vs. Free).
* **Disk Health Grid:** Visual status cards for every disk in the array, showing:
    * Individual disk usage percentages.
    * **SMART Status** integration (Hover over the health dot to see full SMART data).
    * Automatic distinction between Data disks and **NonRAID Parity** disks.
* **NonRAID Monitoring:** Live progress bar and status badge for `nmdctl` parity sync, scrub, or reconstruction operations.
* **MergerFS Tools:** Integrated management for the `mergerfs.balance` tool with a live terminal output log.
* **Usage Trends:** A 40-day historical chart tracking your storage growth over time.
* **Responsive UI:** Designed to look native within the Cockpit interface.

---

## 🔗 Project Links & Requirements

This dashboard relies on the following core technologies:

* **[NonRAID](https://github.com/qvr/nonraid):** An unRAID-compatible storage array kernel driver fork for Debian/Ubuntu.
* **[MergerFS](https://github.com/trapexit/mergerfs):** A featureful union filesystem used to pool your independent NonRAID disks.
* **[MergerFS-Tools](https://github.com/trapexit/mergerfs-tools):** Specifically required for the `mergerfs.balance` functionality.
* **Smartmontools:** Required for disk health reporting.

---

## 📦 Installation

### 1. Install Dependencies
Ensure your system has the required packages installed:
```bash
# Install Cockpit, MergerFS, and SMART tools
sudo apt update
sudo apt install cockpit mergerfs smartmontools

# Ensure NonRAID (nmdctl) and MergerFS-Tools are installed
# Follow instructions at [https://github.com/qvr/nonraid](https://github.com/qvr/nonraid) for NonRAID installation.


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
