const { ipcRenderer } = require('electron');
const db = require('./database');
const { showNotification } = require('./notifications');
const { exportTasks, importTasks } = require('./export-import');

let currentTaskId = null;

function loadTasks() {
  db.getAllTasks().then(tasks => {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
      const taskElement = createTaskElement(task);
      taskList.appendChild(taskElement);
    });
  });
}

function createTaskElement(task) {
  const taskElement = document.createElement('div');
  taskElement.className = 'task-item';
  taskElement.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <p>Due: ${task.dueDate}</p>
    <p>Priority: ${task.priority}</p>
    <button class="edit-task" data-id="${task._id}">Edit</button>
    <button class="delete-task" data-id="${task._id}">Delete</button>
    <input type="checkbox" class="complete-task" data-id="${task._id}" ${task.completed ? 'checked' : ''}>
  `;
  return taskElement;
}

document.getElementById('add-task').addEventListener('click', () => {
  document.getElementById('task-form').style.display = 'block';
  document.getElementById('add-task').style.display = 'none';
});

document.getElementById('cancel-task').addEventListener('click', () => {
  document.getElementById('task-form').style.display = 'none';
  document.getElementById('add-task').style.display = 'block';
  document.getElementById('task-form').reset();
  currentTaskId = null;
});

document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;
  const dueDate = document.getElementById('task-due-date').value;
  const priority = document.getElementById('task-priority').value;

  const task = { title, description, dueDate, priority, completed: false };

  if (currentTaskId) {
    task._id = currentTaskId;
    db.updateTask(task).then(() => {
      loadTasks();
      document.getElementById('task-form').reset();
      document.getElementById('task-form').style.display = 'none';
      document.getElementById('add-task').style.display = 'block';
      currentTaskId = null;
    });
  } else {
    db.addTask(task).then(() => {
      loadTasks();
      document.getElementById('task-form').reset();
      document.getElementById('task-form').style.display = 'none';
      document.getElementById('add-task').style.display = 'block';
    });
  }
});

document.getElementById('task-list').addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-task')) {
    const taskId = e.target.getAttribute('data-id');
    db.getAllTasks().then(tasks => {
      const task = tasks.find(t => t._id === taskId);
      if (task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description;
        document.getElementById('task-due-date').value = task.dueDate;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-form').style.display = 'block';
        document.getElementById('add-task').style.display = 'none';
        currentTaskId = taskId;
      }
    });
  } else if (e.target.classList.contains('delete-task')) {
    const taskId = e.target.getAttribute('data-id');
    db.deleteTask(taskId).then(() => {
      loadTasks();
    });
  } else if (e.target.classList.contains('complete-task')) {
    const taskId = e.target.getAttribute('data-id');
    db.getAllTasks().then(tasks => {
      const task = tasks.find(t => t._id === taskId);
      if (task) {
        task.completed = e.target.checked;
        db.updateTask(task).then(() => {
          loadTasks();
        });
      }
    });
  }
});

document.getElementById('search-input').addEventListener('input', (e) => {
  const query = e.target.value;
  if (query) {
    db.searchTasks(query).then(result => {
      const taskList = document.getElementById('task-list');
      taskList.innerHTML = '';
      result.docs.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
      });
    });
  } else {
    loadTasks();
  }
});

document.getElementById('manual-sync').addEventListener('click', () => {
  db.syncWithRemote().then(() => {
    showNotification('Sync completed', 'Your tasks have been synchronized with the server.');
  });
});

document.getElementById('export-tasks').addEventListener('click', () => {
  db.getAllTasks().then(tasks => {
    exportTasks(tasks, 'json');
  });
});

document.getElementById('import-tasks').addEventListener('click', () => {
  importTasks().then(tasks => {
    tasks.forEach(task => db.addTask(task));
    loadTasks();
  });
});

document.getElementById('toggle-mode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Initialize dark mode
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

// Load tasks on startup
loadTasks();

// Start background sync
db.syncWithRemote();

// Check for due tasks and show notifications
setInterval(() => {
  db.getAllTasks().then(tasks => {
    const now = new Date();
    tasks.forEach(task => {
      const dueDate = new Date(task.dueDate);
      if (!task.completed && dueDate > now && dueDate - now <= 24 * 60 * 60 * 1000) {
        showNotification('Task Due Soon', `${task.title} is due in 24 hours or less.`);
      }
    });
  });
}, 60 * 60 * 1000); // Check every hour
