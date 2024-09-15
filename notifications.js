const { Notification } = require('electron');

function showNotification(title, body) {
  new Notification({ title, body }).show();
}

module.exports = { showNotification };
const { ipcRenderer } = require('electron');

function showNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  }

  // Also send to main process for systems where web notifications don't work
  ipcRenderer.send('show-notification', title, body);
}

module.exports = { showNotification };
