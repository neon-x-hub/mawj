const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let mainWindow = null;
let serverProcess = null;

// Find server.js - SIMPLE PATH RESOLUTION
function getServerPath() {
  if (app.isPackaged) {
    // In packaged app, server is at: app/.next/standalone/server.js
    return path.join(app.getAppPath(), '.next', 'standalone', 'server.js');
  }
  // In dev, it's in project root
  return path.join(__dirname, '.next', 'standalone', 'server.js');
}

// Start Next.js server - SIMPLE
function startServer() {
  const serverPath = getServerPath();
  const serverDir = path.dirname(serverPath);

  console.log('Starting server from:', serverPath);

  if (!fs.existsSync(serverPath)) {
    throw new Error(`Server not found: ${serverPath}`);
  }

  // Start the process
  serverProcess = spawn('node', [serverPath], {
    cwd: serverDir,
    env: { ...process.env, PORT: '3000', NODE_ENV: 'production' }
  });

  // Log output
  serverProcess.stdout.on('data', (data) => {
    console.log('Server:', data.toString().trim());
  });

  serverProcess.stderr.on('data', (data) => {
    console.log('Server Error:', data.toString().trim());
  });

  // Don't wait for server to be ready - just start it
  console.log('Server started (PID:', serverProcess.pid, ')');
}

// Create window - SIMPLE
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true
  });

  // Load the app (will retry if server not ready)
  mainWindow.loadURL('http://localhost:3000');

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Main startup - SIMPLE
app.whenReady().then(() => {
  console.log('App starting...');

  // 1. Start server
  startServer();

  // 2. Create window immediately (don't wait)
  createWindow();

  // 3. If window fails to load, retry after 2 seconds
  setTimeout(() => {
    if (mainWindow) {
      mainWindow.webContents.reload();
    }
  }, 2000);
});

// Cleanup - SIMPLE
app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
