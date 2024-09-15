// main.js

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      contextIsolation: false,
      nodeIntegration: true    // Be careful with nodeIntegration, ensure no untrusted remote sources!
    }
  });

  mainWindow.loadFile('index.html');
}

// When Electron finishes initializing
app.whenReady().then(createWindow);