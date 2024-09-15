// renderer.js
const PouchDB = require('pouchdb');
const taskDb = new PouchDB('tasks');
const remoteCouch = 'http://admin:adeego2027@127.0.0.1:5984/tasks';  // Add your CouchDB URL

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const searchTask = document.getElementById('search-task');

// Sync PouchDB to CouchDB
function syncDb() {
    taskDb.sync(remoteCouch, {
        live: true,
        retry: true
    }).on('change', fetchAndDisplayTasks);
}

// Fetch tasks from PouchDB
async function fetchAndDisplayTasks() {
    const result = await taskDb.allDocs({include_docs: true});
    const tasks = result.rows.map(row => row.doc);
    displayTasks(tasks);
}

// Display tasks in the list
function displayTasks(tasks) {
    taskList.innerHTML = '';
    if (tasks.length === 0) {
        taskList.innerHTML = 'No tasks to display.';
        return;
    }

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-item');
        taskElement.innerHTML = `
            <h3>${task.title} (${task.priority})</h3>
            <p>${task.description}</p>
            <p>Due: ${task.dueDate}</p>
            <button onclick="markComplete('${task._id}')">Complete</button>
            <button onclick="deleteTask('${task._id}')">Delete</button>
        `;
        taskList.appendChild(taskElement);
    });
}

// Add new task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const dueDate = document.getElementById('task-date').value;
    const priority = document.getElementById('task-priority').value;

    const task = {
        _id: new Date().toISOString(),
        title,
        description,
        dueDate,
        priority,
        completed: false
    };

    await taskDb.put(task);
    await fetchAndDisplayTasks();
    taskForm.reset();
});

// Mark task as complete
async function markComplete(taskId) {
    const task = await taskDb.get(taskId);
    task.completed = true;
    await taskDb.put(task);
    await fetchAndDisplayTasks();
}

// Delete a task
async function deleteTask(taskId) {
    const task = await taskDb.get(taskId);
    await taskDb.remove(task);
    await fetchAndDisplayTasks();
}

// Search tasks
searchTask.addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase();
    const result = await taskDb.allDocs({ include_docs: true });
    const tasks = result.rows.map(row => row.doc);
    const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(query));
    displayTasks(filteredTasks);
});

// Initial load and sync
fetchAndDisplayTasks();
syncDb();