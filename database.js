const PouchDB = require('pouchdb');
const PouchFind = require('pouchdb-find');
PouchDB.plugin(PouchFind);

const localDB = new PouchDB('tasks');
const remoteDB = new PouchDB('http://localhost:5984/tasks');

function addTask(task) {
  return localDB.post(task);
}

function updateTask(task) {
  return localDB.put(task);
}

function deleteTask(taskId) {
  return localDB.get(taskId).then(doc => localDB.remove(doc));
}

function getAllTasks() {
  return localDB.allDocs({include_docs: true}).then(result => result.rows.map(row => row.doc));
}

function searchTasks(query) {
  return localDB.find({
    selector: {
      $or: [
        {title: {$regex: RegExp(query, 'i')}},
        {description: {$regex: RegExp(query, 'i')}}
      ]
    }
  });
}

function syncWithRemote() {
  return localDB.sync(remoteDB, {
    live: true,
    retry: true
  }).on('change', function (change) {
    console.log('Sync change:', change);
  }).on('error', function (err) {
    console.error('Sync error:', err);
  });
}

module.exports = {
  addTask,
  updateTask,
  deleteTask,
  getAllTasks,
  searchTasks,
  syncWithRemote
};
