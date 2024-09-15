const db = require('./pouchdb');
const { showNotification } = require('./notifications');
const { exportTasks, importTasks } = require('./export-import');
const { login } = require('./auth');

document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;
  const dueDate = document.getElementById('task-due-date').value;
  const priority = document.getElementById('task-priority').value;

  db.post({ title, description, dueDate, priority, completed: false }).then(() => {
    document.getElementById('task-form').reset();
    loadTasks();
  });
});

function loadTasks() {
  db.allDocs({ include_docs: true }).then(result => {
    const tasks = result.rows.map(row => row.doc);
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p>Due: ${task.dueDate}</p>
        <p>Priority: ${task.priority}</p>
        <button class="edit-task" data-id="${task._id}">Edit</button>
        <button class="delete-task" data-id="${task._id}">Delete</button>
        <input type="checkbox" class="complete-task" data-id="${task._id}" ${task.completed ? 'checked' : ''}>
      `;
      taskList.appendChild(taskElement);
    });
  });
}

document.getElementById('task-list').addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-task')) {
    const taskId = e.target.getAttribute('data-id');
    db.get(taskId).then(task => {
      // Implement edit functionality
    });
  } else if (e.target.classList.contains('delete-task')) {
    const taskId = e.target.getAttribute('data-id');
    db.remove(taskId).then(() => {
      loadTasks();
    });
  } else if (e.target.classList.contains('complete-task')) {
    const taskId = e.target.getAttribute('data-id');
    db.get(taskId).then(task => {
      task.completed = e.target.checked;
      db.put(task).then(() => {
        loadTasks();
      });
    });
  }
});

document.getElementById('filter-complete').addEventListener('change', loadTasks);
document.getElementById('filter-incomplete').addEventListener('change', loadTasks);
document.getElementById('filter-low').addEventListener('change', loadTasks);
document.getElementById('filter-medium').addEventListener('change', loadTasks);
document.getElementById('filter-high').addEventListener('change', loadTasks);

document.getElementById('search-input').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  db.find({
    selector: {
      $or: [
        { title: { $regex: query } },
        { description: { $regex: query } },
        { dueDate: { $regex: query } }
      ]
    }
  }).then(result => {
    const tasks = result.docs;
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p>Due: ${task.dueDate}</p>
        <p>Priority: ${task.priority}</p>
        <button class="edit-task" data-id="${task._id}">Edit</button>
        <button class="delete-task" data-id="${task._id}">Delete</button>
        <input type="checkbox" class="complete-task" data-id="${task._id}" ${task.completed ? 'checked' : ''}>
      `;
      taskList.appendChild(taskElement);
    });
  });
});

document.getElementById('manual-sync').addEventListener('click', () => {
  db.replicate.to('http://localhost:5984/tasks').then(() => {
    console.log('Manual sync completed');
  });
});

document.getElementById('export-tasks').addEventListener('click', () => {
  exportTasks('json');
});

document.getElementById('import-tasks').addEventListener('click', () => {
  importTasks('tasks.json');
});

document.getElementById('toggle-mode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

loadTasks();
