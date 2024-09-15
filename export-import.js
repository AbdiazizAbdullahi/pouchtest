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
const { dialog } = require('electron').remote;
const fs = require('fs');

function exportTasks(tasks, format) {
  const data = format === 'json' ? JSON.stringify(tasks, null, 2) : tasks.map(task => Object.values(task).join(',')).join('\n');
  const defaultPath = `tasks.${format}`;

  dialog.showSaveDialog({
    title: 'Export Tasks',
    defaultPath: defaultPath,
    filters: [{ name: format.toUpperCase(), extensions: [format] }]
  }).then(result => {
    if (!result.canceled) {
      fs.writeFileSync(result.filePath, data);
    }
  });
}

function importTasks() {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog({
      title: 'Import Tasks',
      filters: [{ name: 'JSON', extensions: ['json'] }, { name: 'CSV', extensions: ['csv'] }]
    }).then(result => {
      if (!result.canceled) {
        const data = fs.readFileSync(result.filePaths[0], 'utf8');
        const tasks = result.filePaths[0].endsWith('.json') ? JSON.parse(data) : parseCSV(data);
        resolve(tasks);
      } else {
        reject(new Error('Import canceled'));
      }
    });
  });
}

function parseCSV(data) {
  // Simple CSV parsing, you might want to use a library for more robust parsing
  const lines = data.split('\n');
  return lines.map(line => {
    const [title, description, dueDate, priority, completed] = line.split(',');
    return { title, description, dueDate, priority, completed: completed === 'true' };
  });
}

module.exports = { exportTasks, importTasks };
