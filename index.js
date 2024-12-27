const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const express = require('express');

const APP_NAME = 'PAUL-MD';  // Define your bot's name here

// Flag to track if the server has already been started
let serverStarted = false;

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

// Function to delete .cache and .npm folders
function deleteCacheAndNpm() {
    const cachePath = path.join(__dirname, '.cache');
    const npmPath = path.join(__dirname, '.npm');

    try {
        if (fs.existsSync(cachePath)) {
            fs.rmSync(cachePath, { recursive: true, force: true });
            console.log('.cache folder deleted.');
        }
        if (fs.existsSync(npmPath)) {
            fs.rmSync(npmPath, { recursive: true, force: true });
            console.log('.npm folder deleted.');
        }
    } catch (err) {
        console.error('Error deleting .cache or .npm folder:', err);
    }
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

// Setup server and port
function setupServer() {
    if (serverStarted) {
        return;  // Prevent restarting the server if it's already running
    }

    const app = express();
    const port = process.env.PORT || 3001;  // Use PORT from environment or default to 3000

    app.get('/', (req, res) => {
        res.send(`
            <html>
                <head>
                    <title>${APP_NAME} - Bot Live</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            background-color: #f4f4f4;
                            text-align: center;
                        }
                        .container {
                            background-color: white;
                            padding: 30px;
                            border-radius: 8px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            font-size: 2rem;
                            color: #4CAF50;
                        }
                        p {
                            font-size: 1rem;
                            color: #555;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>${APP_NAME} is LIVE</h1>
                        <p>Your bot is running and ready to go!</p>
                    </div>
                </body>
            </html>
        `);
    });

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        serverStarted = true;  // Set the flag to true once the server starts
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

    // Delete the .cache and .npm folders after connecting
    deleteCacheAndNpm();

    // Start the server to show bot live message
    setupServer();
}

start();
