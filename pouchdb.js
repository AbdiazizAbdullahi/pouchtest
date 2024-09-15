const PouchDB = require('pouchdb');
const db = new PouchDB('tasks');

module.exports = db;
