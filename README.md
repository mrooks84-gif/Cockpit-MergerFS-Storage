# Cockpit-MergerFS-Storage
A custom Cockpit plugin that auto-detects MergerFS pools. It provides a real-time visual breakdown of storage and tracks usage trends over a rolling 40-day period.
I am only a beginner and really needed this feature, i couldent find one that anyone else has created so i built one with the help of ai, i hope it helps others.
Anyone is welcome to make changes.

Summary of What This Does
Automatic Detection: No more hardcoding paths. It finds your MergerFS mount using system-level calls.

Visual Status: A clean doughnut chart shows your current ratio of Used vs. Free space.

Stat Cards: Clearly separated boxes showing the exact gigabytes/terabytes of your pool.

Trend Logging: Automatically records one usage point every 24 hours (saved in browser storage) to build a 40-day trend line.



# 1. The Setup (Terminal Commands)
First, create the directory and download the required chart library that makes the visuals possible.

code sudo mkdir -p /usr/share/cockpit/mergerfs-storage
code sudo wget https://cdn.jsdelivr.net/npm/chart.js -O /usr/share/cockpit/mergerfs-storage/chart.min.js
code sudo wget https://github.com/mrooks84-gif/Cockpit-MergerFS-Storage/blob/main/index.html -O /usr/share/cockpit/mergerfs-storage/index.html
code sudo wget https://github.com/mrooks84-gif/Cockpit-MergerFS-Storage/blob/main/manifest.json -O /usr/share/cockpit/mergerfs-storage/manifest.json
code sudo wget https://github.com/mrooks84-gif/Cockpit-MergerFS-Storage/blob/main/script.js -O /usr/share/cockpit/mergerfs-storage/script.js
code sudo chown -R root:root /usr/share/cockpit/mergerfs-storage
code sudo chmod -R 755 /usr/share/cockpit/mergerfs-storage


