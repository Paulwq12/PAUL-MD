const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const express = require('express');

const APP_NAME = 'PAUL-MD';  // Define your bot's name here

// Ensure necessary directories
function ensurePermissions() {
    const directories = ['tmp', 'XeonMedia', 'lib', 'src'];
    directories.forEach((dir) => {
        const fullPath = path.join(__dirname, dir);
        try {
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                console.log(`Created directory: ${fullPath}`);
            }
            fs.chmodSync(fullPath, 0o755); // Ensure permissions
        } catch (err) {
            console.error(`Error ensuring directory ${fullPath} exists:`, err);
            process.exit(1);
        }
    });
}

function displayMessages() {
    const messages = [
        `0|${APP_NAME}  | Getting creds.json from session folder ✅`,
        `0|${APP_NAME}  | Session downloaded ✅`,
        `0|${APP_NAME}  | ${APP_NAME} files downloaded successfully ✅`,
        `0|${APP_NAME}  | Loading all files and folders....✅`,
        `0|${APP_NAME}  | Files and folders loaded successfully ✅`,
        `0|${APP_NAME}  | Connecting WhatsApp 🧬...`,
        `0|${APP_NAME}  | 😼 Installing, PLEASE WAIT A WHILE...`,
        `0|${APP_NAME}  | ${APP_NAME} Bot connected to WhatsApp ✅`
    ];

    let totalDelay = 3000;  // Initial delay of 3 seconds

    messages.forEach((message, index) => {
        let delay = 1500;  // Default 1.5 second interval
        if (message.includes('Session downloaded') || message.includes('Loading all files and folders')) {
            delay = 5000;  // Special 5-second interval for these messages
        }

        setTimeout(() => {
            console.log(message);
        }, totalDelay);

        totalDelay += delay;
    });
}


function start() {
    ensurePermissions();
    const mainFile = path.join(__dirname, 'main.js');
    let args = ['--max-old-space-size=4000', mainFile, ...process.argv.slice(2)];

    console.log(`Starting Bot with: ${['node', ...args].join(' ')}`);

    displayMessages();

    let p = spawn('node', args, {
        stdio: ['inherit', 'inherit', 'pipe', 'ipc'],
    });

    p.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
    });

    p.on('message', (data) => {
        if (data === 'reset') {
            console.log('Restarting Bot...');
            p.kill();
            start();
        }
    });

    p.on('exit', (code) => {
        console.error('Exited with code:', code);
        if (code !== 0) {
            console.log('Restarting Bot...');
            start();
        } else {
            console.log('Bot exited gracefully.');
        }
    });

}

start();
