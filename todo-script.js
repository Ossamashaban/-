// To-Do List Application with Local Storage

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const toast = document.getElementById('toast');

// Stats elements
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

// Local Storage Key
const STORAGE_KEY = 'todoList_tasks';
const FILTER_KEY = 'todoList_filter';

// Current filter state
let currentFilter = localStorage.getItem(FILTER_KEY) || 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
    setActiveFilter();
});

// Setup event listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            localStorage.setItem(FILTER_KEY, currentFilter);
            setActiveFilter();
            renderTasks();
        });
    });
}

// Get tasks from local storage
function getTasks() {
    const tasks = localStorage.getItem(STORAGE_KEY);
    return tasks ? JSON.parse(tasks) : [];
}

// Save tasks to local storage
function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();

    if (!taskText) {
        showToast('Please enter a task!');
        return;
    }

    // XSS protection - escape HTML
    const escapedText = escapeHtml(taskText);

    const task = {
        id: Date.now(),
        text: escapedText,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    const tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks);

    taskInput.value = '';
    taskInput.focus();
    renderTasks();
    showToast('✓ Task added successfully!');
}

// Render tasks based on current filter
function renderTasks() {
    const tasks = getTasks();
    const filteredTasks = filterTasks(tasks, currentFilter);

    tasksList.innerHTML = '';

    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            tasksList.appendChild(taskElement);
        });
    }

    updateStats();
    updateButtonStates();
}

// Create task element
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.innerHTML = `
        <input 
            type="checkbox" 
            class="task-checkbox" 
            ${task.completed ? 'checked' : ''}
            onchange="toggleTask(${task.id})"
        >
        <div class="task-content">
            <div class="task-text">${task.text}</div>
            <div class="task-time">${task.createdAt}</div>
        </div>
        <button class="btn btn-delete" onclick="deleteTask(${task.id})">Delete</button>
    `;
    return li;
}

// Toggle task completion
function toggleTask(id) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    
    if (task) {
        task.completed = !task.completed;
        saveTasks(tasks);
        renderTasks();
        showToast(task.completed ? '✓ Task completed!' : '↻ Task marked as active');
    }
}

// Delete a task
function deleteTask(id) {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex > -1) {
        const deletedTask = tasks[taskIndex];
        tasks.splice(taskIndex, 1);
        saveTasks(tasks);
        renderTasks();
        showToast('✗ Task deleted');
    }
}

// Clear all completed tasks
function clearCompleted() {
    const tasks = getTasks();
    const completedCount = tasks.filter(t => t.completed).length;

    if (completedCount === 0) {
        showToast('No completed tasks to clear');
        return;
    }

    if (confirm(`Delete ${completedCount} completed task(s)?`)) {
        const remainingTasks = tasks.filter(t => !t.completed);
        saveTasks(remainingTasks);
        renderTasks();
        showToast(`✓ ${completedCount} completed task(s) deleted`);
    }
}

// Clear all tasks
function clearAll() {
    const tasks = getTasks();

    if (tasks.length === 0) {
        showToast('No tasks to clear');
        return;
    }

    if (confirm(`Delete all ${tasks.length} task(s)? This cannot be undone.`)) {
        saveTasks([]);
        renderTasks();
        showToast('✓ All tasks cleared');
    }
}

// Filter tasks
function filterTasks(tasks, filter) {
    switch (filter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

// Update statistics
function updateStats() {
    const tasks = getTasks();
    const completed = tasks.filter(t => t.completed).length;
    const active = tasks.length - completed;

    totalCount.textContent = tasks.length;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// Update button states
function updateButtonStates() {
    const tasks = getTasks();
    const completedTasks = tasks.filter(t => t.completed).length;

    clearCompletedBtn.disabled = completedTasks === 0;
    clearAllBtn.disabled = tasks.length === 0;
}

// Set active filter button
function setActiveFilter() {
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        }
    });
}

// Load and render tasks from storage
function loadTasks() {
    renderTasks();
}

// Show toast notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// XSS Protection - Escape HTML characters
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
