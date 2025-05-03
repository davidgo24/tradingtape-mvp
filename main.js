const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  ipcMain.on('log', (event, msg) => console.log('[Renderer]', msg));
  ipcMain.on('status-update', (event, msg) => {
    win.webContents.send('status-update', msg);
  });

  ipcMain.handle('delete-file', async (event, filePath) => {
    try {
      fs.unlinkSync(filePath);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);
