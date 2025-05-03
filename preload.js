const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const OBSWebSocket = require('obs-websocket-js').default;

// -- 1. fileAPI: recording file handling --
function getRecordingPath() {
  const configPath = path.join(__dirname, 'config.json');
  const defaultOBSPath = path.join(os.homedir(), 'Movies');

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config.recordingFolder || defaultOBSPath;
  } catch {
    return defaultOBSPath;
  }
}

contextBridge.exposeInMainWorld('fileAPI', {
  getSessions: () => {
    const folder = getRecordingPath();
    const files = fs.readdirSync(folder);

    return files
      .filter(file => file.endsWith('.mov'))
      .map(file => {
        const fullPath = path.join(folder, file);
        try {
          const stats = fs.statSync(fullPath);
          if (!stats.mtime) throw new Error('Invalid time');
          return {
            title: file.replace('.mov', ''),
            path: fullPath,
            date: stats.mtime
          };
        } catch (e) {
          console.warn('Skipping invalid file:', file);
          return null;
        }
      })
      .filter(Boolean);
  },

  deleteSession: async (path) => ipcRenderer.invoke('delete-file', path)
});

// -- 2. obsControl: OBS WebSocket commands --
const obs = new OBSWebSocket();

contextBridge.exposeInMainWorld('obsControl', {
  connect: async () => {
    await obs.connect('ws://localhost:4455');
    ipcRenderer.send('status-update', '✅ Connected to OBS');
  },
  startRecording: () => obs.call('StartRecord', {}),
  stopRecording: () => obs.call('StopRecord', {})
});

// -- 3. ipc bridge: generic IPC helpers --
contextBridge.exposeInMainWorld('ipc', {
  on: (...args) => ipcRenderer.on(...args),
  send: (...args) => ipcRenderer.send(...args)
});
