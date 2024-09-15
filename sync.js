const db = require('./database');

function startSync() {
  db.syncWithRemote().on('complete', function (info) {
    console.log('Sync completed');
  }).on('error', function (err) {
    console.error('Sync error:', err);
  });
}

module.exports = { startSync };
