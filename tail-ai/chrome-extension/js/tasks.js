// Task management
class TaskManager {
    constructor() {
        this.tasks = [];
        this.lastFetch = null;
        this.cacheTimeout = 2 * 60 * 1000; // 2 minutes
    }

    // Load tasks from cache or API
    async loadTasks(filters = {}, forceRefresh = false) {
        const now = Date.now();
        
        // Check cache first
        if (!forceRefresh && this.lastFetch && (now - this.lastFetch) < this.cacheTimeout) {
            return this.getFilteredTasks(filters);
        }

        try {
            const response = await window.tailAIAPI.getTasks(filters);
            this.tasks = response.tasks || [];
            this.lastFetch = now;
            
            // Cache tasks
            await chrome.storage.local.set({ 
                tasks: this.tasks,
                tasksLastFetch: now
            });
            
            return this.tasks;
        } catch (error) {
            console.error('Failed to load tasks:', error);
            
            // Try to load from cache as fallback
            try {
                const cached = await chrome.storage.local.get(['tasks', 'tasksLastFetch']);
                if (cached.tasks && cached.tasksLastFetch) {
                    const cacheAge = now - cached.tasksLastFetch;
                    if (cacheAge < this.cacheTimeout * 2) { // Allow stale cache for up to 4 minutes
                        this.tasks = cached.tasks;
                        return this.getFilteredTasks(filters);
                    }
                }
            } catch (cacheError) {
                console.error('Failed to load cached tasks:', cacheError);
            }
            
            throw error;
        }
    }

    // Get filtered tasks
    getFilteredTasks(filters = {}) {
        let filteredTasks = [...this.tasks];
        
        if (filters.status) {
            filteredTasks = filteredTasks.filter(task => task.status === filters.status);
        }
        
        if (filters.projectId) {
            filteredTasks = filteredTasks.filter(task => task.projectId === filters.projectId);
        }
        
        if (filters.priority) {
            filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
        }
        
        return filteredTasks;
    }

    // Create new task
    async createTask(taskData) {
        try {
            const response = await window.tailAIAPI.createTask(taskData);
            
            // Add to local tasks array
            this.tasks.unshift(response.task); // Add to beginning for recent tasks
            this.lastFetch = Date.now();
            
            // Update cache
            await chrome.storage.local.set({ 
                tasks: this.tasks,
                tasksLastFetch: this.lastFetch
            });
            
            return { success: true, task: response.task };
        } catch (error) {
            console.error('Failed to create task:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to create task' 
            };
        }
    }

    // Update task
    async updateTask(taskId, taskData) {
        try {
            const response = await window.tailAIAPI.updateTask(taskId, taskData);
            
            // Update local tasks array
            const index = this.tasks.findIndex(task => task.id === taskId);
            if (index !== -1) {
                this.tasks[index] = response.task;
            }
            this.lastFetch = Date.now();
            
            // Update cache
            await chrome.storage.local.set({ 
                tasks: this.tasks,
                tasksLastFetch: this.lastFetch
            });
            
            return { success: true, task: response.task };
        } catch (error) {
            console.error('Failed to update task:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to update task' 
            };
        }
    }

    // Delete task
    async deleteTask(taskId) {
        try {
            await window.tailAIAPI.deleteTask(taskId);
            
            // Remove from local tasks array
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.lastFetch = Date.now();
            
            // Update cache
            await chrome.storage.local.set({ 
                tasks: this.tasks,
                tasksLastFetch: this.lastFetch
            });
            
            return { success: true };
        } catch (error) {
            console.error('Failed to delete task:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to delete task' 
            };
        }
    }

    // Render tasks list
    renderTasksList(containerElement, filters = {}) {
        const filteredTasks = this.getFilteredTasks(filters);
        
        if (filteredTasks.length === 0) {
            containerElement.innerHTML = '<p class="no-data">No tasks found</p>';
            return;
        }

        // Sort tasks by creation date (most recent first)
        const sortedTasks = filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const tasksHtml = sortedTasks.map(task => `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <span class="task-status status-${task.status.toLowerCase().replace('_', '-')}">
                        ${task.status.replace('_', ' ')}
                    </span>
                </div>
                <div class="task-meta">
                    <span>${window.projectManager.getProjectName(task.projectId)}</span>
                    ${task.priority ? `<span class="priority-${task.priority.toLowerCase()}">${task.priority}</span>` : ''}
                    ${task.estimatedHours ? `<span>Est: ${task.estimatedHours}h</span>` : ''}
                    ${task.dueDate ? `<span>Due: ${this.formatDate(task.dueDate)}</span>` : ''}
                </div>
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                <div class="task-actions">
                    <button class="btn btn-small btn-secondary edit-task-btn" data-task-id="${task.id}">
                        Edit
                    </button>
                    <button class="btn btn-small btn-danger delete-task-btn" data-task-id="${task.id}">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        containerElement.innerHTML = tasksHtml;
        
        // Add event listeners for edit and delete buttons
        this.addTaskButtonListeners(containerElement);
    }

    // Edit task
    editTask(taskId) {
        // Find the task
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            this.showMessage('Task not found', 'error');
            return;
        }

        // Pre-fill the form with task data
        const projectSelect = document.getElementById('projectSelect');
        const taskTitle = document.getElementById('taskTitle');
        const taskDescription = document.getElementById('taskDescription');
        const taskPriority = document.getElementById('taskPriority');
        const dueDate = document.getElementById('dueDate');
        const estimatedHours = document.getElementById('estimatedHours');

        if (projectSelect) projectSelect.value = task.projectId;
        if (taskTitle) taskTitle.value = task.title;
        if (taskDescription) taskDescription.value = task.description || '';
        if (taskPriority) taskPriority.value = task.priority || 'MEDIUM';
        if (dueDate) dueDate.value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
        if (estimatedHours) estimatedHours.value = task.estimatedHours || '';

        // Store the task ID for updating
        window.currentEditingTaskId = taskId;

        // Change form submit behavior
        const form = document.getElementById('quickTaskForm');
        if (form) {
            form.setAttribute('data-editing', 'true');
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Update Task';
                submitBtn.classList.add('btn-update');
            }
        }

        // Scroll to form
        const formSection = document.querySelector('.quick-task-section');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }

        this.showMessage('Task loaded for editing. Make changes and click Update Task.', 'success');
    }

    // Delete task with confirmation
    async deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            const result = await this.deleteTask(taskId);
            if (result.success) {
                this.showMessage('Task deleted!', 'success');
                this.refreshTasksList();
            } else {
                this.showMessage(result.error, 'error');
            }
        }
    }

    // Add event listeners for task buttons
    addTaskButtonListeners(containerElement) {
        // Edit buttons
        const editButtons = containerElement.querySelectorAll('.edit-task-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                this.editTask(taskId);
            });
        });

        // Delete buttons
        const deleteButtons = containerElement.querySelectorAll('.delete-task-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                this.deleteTask(taskId);
            });
        });
    }

    // Refresh tasks list
    refreshTasksList() {
        const container = document.getElementById('tasksList');
        const filter = document.getElementById('taskFilter');
        const filters = filter ? { status: filter.value } : {};
        this.renderTasksList(container, filters);
    }

    // Show message
    showMessage(message, type = 'success') {
        const messageElement = document.getElementById('taskSuccess');
        const errorElement = document.getElementById('taskError');
        
        if (type === 'success') {
            messageElement.textContent = message;
            messageElement.style.display = 'block';
            errorElement.style.display = 'none';
        } else {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            messageElement.style.display = 'none';
        }
        
        // Hide message after 3 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
            errorElement.style.display = 'none';
        }, 3000);
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Clear cache
    async clearCache() {
        this.tasks = [];
        this.lastFetch = null;
        await chrome.storage.local.remove(['tasks', 'tasksLastFetch']);
    }
}

// Create global task manager instance
window.taskManager = new TaskManager();
