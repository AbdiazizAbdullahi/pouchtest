const db = require('./pouchdb');
const remoteDB = new PouchDB('http://localhost:5984/tasks');

db.sync(remoteDB, {
  live: true,
  retry: true
}).on('change', function (change) {
  console.log('Sync change:', change);
}).on('error', function (err) {
  console.error('Sync error:', err);
});
