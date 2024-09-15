const { Notification } = require('electron');

function showNotification(title, body) {
  new Notification({ title, body }).show();
}

module.exports = { showNotification };
