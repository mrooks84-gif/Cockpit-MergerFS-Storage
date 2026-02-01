# Cockpit-MergerFS-Storage
A custom Cockpit plugin that auto-detects MergerFS pools. It provides a real-time visual breakdown of storage and tracks usage trends over a rolling 40-day period.
I am only a beginner and really needed this feature, i couldent find one that anyone else has created so i built one with the help of ai, i hope it helps others.
Anyone is welcome to make changes.

Summary of What This Does
Automatic Detection: No more hardcoding paths. It finds your MergerFS mount using system-level calls.

Visual Status: A clean doughnut chart shows your current ratio of Used vs. Free space.

Stat Cards: Clearly separated boxes showing the exact gigabytes/terabytes of your pool.

Trend Logging: Automatically records one usage point every 24 hours (saved in browser storage) to build a 40-day trend line.

1. The Setup (Terminal Commands)
First, create the directory and download the required chart library that makes the visuals possible.

# Create the plugin directory
sudo mkdir -p /usr/share/cockpit/mergerfs-storage

# Download the essential Chart.js library
sudo wget https://cdn.jsdelivr.net/npm/chart.js -O /usr/share/cockpit/mergerfs-storage/chart.min.js

# Set the correct permissions so Cockpit can run the files
sudo chown -R root:root /usr/share/cockpit/mergerfs-storage
sudo chmod -R 755 /usr/share/cockpit/mergerfs-storage


