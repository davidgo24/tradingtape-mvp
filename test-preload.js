const { contextBridge } = require('electron');

try {
  const OBSWebSocket = require('obs-websocket-js').default;
  const obs = new OBSWebSocket();

  console.log("✅ obs-websocket-js loaded successfully in preload");

  contextBridge.exposeInMainWorld('obsControl', {
    connect: async () => {
      await obs.connect('ws://localhost:4455');
    },
    startRecording: () => obs.call('StartRecording'),
    stopRecording: () => obs.call('StopRecording')
  });

} catch (e) {
  console.error("❌ Failed to load obs-websocket-js:", e);
}
