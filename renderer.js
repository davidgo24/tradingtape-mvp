const ipcRenderer = window.ipc;
let recordingStartTime = null;
let timerInterval = null;
const recordTimer = document.getElementById('recordTimer');
window.addEventListener('DOMContentLoaded', () => {
  const sessionListDiv = document.getElementById('sessionList');
  const player = document.getElementById('player');
  const sessionTitle = document.getElementById('sessionTitle');
  const status = document.getElementById('status');

  const switchView = (id) => {
    document.getElementById('view-session-list').style.display = 'none';
    document.getElementById('view-player').style.display = 'none';
    document.getElementById(id).style.display = 'block';
  };

  function formatDate(dateObj) {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  }

  window.switchView = switchView;

  window.loadSessions = async function () {
    sessionListDiv.innerHTML = '';
    const sessions = window.fileAPI.getSessions();
    sessions.forEach((session, i) => {
      const div = document.createElement('div');
      div.className = 'session-item';

      const span = document.createElement('span');
      span.className = 'title';
      span.textContent = `${i + 1}. ${session.title}`;
      span.onclick = () => {
        sessionTitle.textContent = session.title;
        player.src = session.path;
        switchView('view-player');
      };

      const meta = document.createElement('span');
      meta.className = 'meta';
      let safeDate = '';
      try {
        safeDate = formatDate(new Date(session.date));
      } catch (e) {
        console.warn('Invalid session date:', session.title, session.date);
      }
      meta.textContent = safeDate || '📁 Unknown Date';

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️';
      deleteBtn.title = 'Delete';
      deleteBtn.onclick = async (e) => {
        e.stopPropagation();
        const confirmed = confirm(`Delete ${session.title}?`);
        if (confirmed) {
          const result = await window.fileAPI.deleteSession(session.path);
          if (result.success) {
            loadSessions();
          } else {
            alert('Failed to delete: ' + result.error);
          }
        }
      };

      div.appendChild(span);
      div.appendChild(meta);
      div.appendChild(deleteBtn);
      sessionListDiv.appendChild(div);
    });
  };

  // Initial load
  switchView('view-session-list');
  loadSessions();

  // OBS control buttons
  document.getElementById('connect').onclick = async () => {
    try {
      await window.obsControl.connect();
    } catch (e) {
      status.textContent = '❌ Failed to connect: ' + e.message;
    }
  };

  document.getElementById('start').onclick = () => {
    window.obsControl.startRecording().then(() => {
      status.textContent = '🔴 Recording started';
  
      recordingStartTime = Date.now();
      recordTimer.style.display = 'inline';
  
      timerInterval = setInterval(() => {
        const seconds = Math.floor((Date.now() - recordingStartTime) / 1000);
        const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        const timerText = `⏱ ${minutes}:${secs}`;
      
        recordTimer.textContent = timerText;
        document.getElementById('testOverlayMirror').textContent = timerText;

      
        ipcRenderer.send('update-overlay', timerText);
        console.log("Sending to overlay:", timerText);

      }, 1000);
    });
  };
  


  document.getElementById('stop').onclick = () => {
    const confirmed = confirm('Are you sure you want to stop this recording?');
    if (!confirmed) return;
  
    window.obsControl.stopRecording().then(() => {
      status.textContent = '⏹️ Recording stopped';
      clearInterval(timerInterval);
      recordTimer.textContent = '';
      recordTimer.style.display = 'none';
    });
  };
  
  

  ipcRenderer.on('status-update', (event, message) => {
    status.textContent = message;
  });
});
