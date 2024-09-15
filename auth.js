const { ipcRenderer } = require('electron');

function login(username, password) {
  ipcRenderer.send('login', { username, password });
}

module.exports = { login };
