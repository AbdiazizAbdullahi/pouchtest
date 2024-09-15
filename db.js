// db.js (This can be part of renderer.js too for simplicity)

const PouchDB = require('pouchdb');
const db = new PouchDB('tasks');
const remoteCouch = 'http://admin:adeego2027@127.0.0.1:5984/tasks';  // Make sure CouchDB server is running

function syncDatabase() {
    db.sync(remoteCouch, {
        live: true,
        retry: true
    }).on('change', console.log.bind(console, 'Data changed in CouchDB'));
}

module.exports = { syncDatabase };