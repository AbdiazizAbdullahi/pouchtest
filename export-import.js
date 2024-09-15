const fs = require('fs');
const db = require('./pouchdb');

function exportTasks(format) {
  db.allDocs({ include_docs: true }).then(result => {
    const tasks = result.rows.map(row => row.doc);
    const data = format === 'json' ? JSON.stringify(tasks) : tasks.map(task => Object.values(task).join(',')).join('\n');
    fs.writeFileSync(`tasks.${format}`, data);
  });
}

function importTasks(file) {
  const data = fs.readFileSync(file, 'utf8');
  const tasks = JSON.parse(data);
  tasks.forEach(task => db.put(task));
}

module.exports = { exportTasks, importTasks };
