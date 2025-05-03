window.addEventListener('DOMContentLoaded', () => {
    console.log("✅ Renderer loaded");
  
    const status = document.getElementById('status');
  
    document.getElementById('connect').onclick = async () => {
      try {
        await window.obsControl.connect();
        status.textContent = '✅ Connected to OBS';
      } catch (e) {
        status.textContent = '❌ Failed to connect: ' + e.message;
        console.error(e);
      }
    };
  
    document.getElementById('start').onclick = async () => {
      try {
        await window.obsControl.startRecording();
        status.textContent = '🔴 Recording started';
      } catch (err) {
        status.textContent = '❌ Start failed: ' + err.message;
      }
    };
  
    document.getElementById('stop').onclick = async () => {
      try {
        await window.obsControl.stopRecording();
        status.textContent = '⏹️ Recording stopped';
      } catch (err) {
        status.textContent = '❌ Stop failed: ' + err.message;
      }
    };
  });
  