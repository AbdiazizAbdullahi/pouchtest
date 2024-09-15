const PouchDB = require('pouchdb');

const localDB = new PouchDB('todos');
const remoteDB = new PouchDB('http://localhost:5984/todos');

function setupSync() {
    localDB.sync(remoteDB, {
        live: true,
        retry: true
    }).on('change', function (change) {
        console.log('Sync change:', change);
    }).on('error', function (err) {
        console.error('Sync error:', err);
    });
}

module.exports = {
    localDB,
    remoteDB,
    setupSync
};
