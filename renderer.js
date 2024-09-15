const PouchDB = require('pouchdb');
const db = new PouchDB('todos');

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const statusFilter = document.getElementById('status-filter');
const priorityFilter = document.getElementById('priority-filter');
const searchInput = document.getElementById('search-input');

// Add task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;

    const task = {
        _id: new Date().toISOString(),
        title,
        description,
        dueDate,
        priority,
        completed: false
    };

    try {
        await db.put(task);
        renderTasks();
        taskForm.reset();
    } catch (err) {
        console.error('Error adding task:', err);
    }
});

// Render tasks
async function renderTasks() {
    const statusValue = statusFilter.value;
    const priorityValue = priorityFilter.value;
    const searchValue = searchInput.value.toLowerCase();

    try {
        const result = await db.allDocs({include_docs: true});
        const tasks = result.rows
            .map(row => row.doc)
            .filter(task => {
                if (statusValue === 'complete' && !task.completed) return false;
                if (statusValue === 'incomplete' && task.completed) return false;
                if (priorityValue !== 'all' && task.priority !== priorityValue) return false;
                if (searchValue && !task.title.toLowerCase().includes(searchValue) && !task.description.toLowerCase().includes(searchValue)) return false;
                return true;
            });

        taskList.innerHTML = tasks.map(task => `
            <li data-id="${task._id}" class="${task.completed ? 'completed' : ''}">
                <span>${task.title}</span>
                <p>${task.description}</p>
                <span>Due: ${task.dueDate}</span>
                <span>Priority: ${task.priority}</span>
                <button class="complete-btn">${task.completed ? 'Undo' : 'Complete'}</button>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </li>
        `).join('');
    } catch (err) {
        console.error('Error rendering tasks:', err);
    }
}

// Event listeners for task actions
taskList.addEventListener('click', async (e) => {
    const taskId = e.target.closest('li').dataset.id;
    
    if (e.target.classList.contains('complete-btn')) {
        try {
            const task = await db.get(taskId);
            task.completed = !task.completed;
            await db.put(task);
            renderTasks();
        } catch (err) {
            console.error('Error updating task:', err);
        }
    } else if (e.target.classList.contains('delete-btn')) {
        try {
            const task = await db.get(taskId);
            await db.remove(task);
            renderTasks();
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    } else if (e.target.classList.contains('edit-btn')) {
        // Implement edit functionality
    }
});

// Event listeners for filters
statusFilter.addEventListener('change', renderTasks);
priorityFilter.addEventListener('change', renderTasks);
searchInput.addEventListener('input', renderTasks);

// Initial render
renderTasks();

// Setup sync with CouchDB
const remoteDB = new PouchDB('http://localhost:5984/todos');
db.sync(remoteDB, {
    live: true,
    retry: true
}).on('change', function (change) {
    renderTasks();
}).on('error', function (err) {
    console.error('Sync error:', err);
});
