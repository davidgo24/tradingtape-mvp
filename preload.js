const { contextBridge } = require('electron');
const OBSWebSocket = require('obs-websocket-js').default;

const obs = new OBSWebSocket();

let apiVersion = 5; // default assumption

contextBridge.exposeInMainWorld('obsControl', {
  connect: async () => {
    try {
      await obs.connect('ws://localhost:4455');
      console.log("✅ Connected to OBS WebSocket");

      // Try detecting API version
      try {
        const versionResponse = await obs.call('GetVersion');
        console.log("📦 OBS WebSocket Version Info:", versionResponse);

        if (versionResponse.obsWebSocketVersion?.startsWith("4")) {
          apiVersion = 4;
        } else {
          apiVersion = 5;
        }

        console.log(`🔢 Detected WebSocket API version: ${apiVersion}`);
      } catch (err) {
        console.warn("⚠️ Could not determine version, defaulting to v5 format.", err);
      }
    } catch (err) {
      console.error("❌ Failed to connect:", err);
    }
  },

  startRecording: async () => {
    try {
      if (apiVersion === 4) {
        await obs.call('StartRecording', {});
      } else {
        await obs.call('StartRecord', {});
      }
    } catch (err) {
      console.error("❌ StartRecording Error:", err);
      throw err;
    }
  },

  stopRecording: async () => {
    try {
      if (apiVersion === 4) {
        await obs.call('StopRecording', {});
      } else {
        await obs.call('StopRecord', {});
      }
    } catch (err) {
      console.error("❌ StopRecording Error:", err);
      throw err;
    }
  }
});
