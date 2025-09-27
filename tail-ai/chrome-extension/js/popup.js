// Main popup functionality
class PopupManager {
    constructor() {
        this.isInitialized = false;
    }

    // Initialize popup
    async init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        await this.loadInitialData();
        this.isInitialized = true;
    }

    // Setup event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Quick task form
        const quickTaskForm = document.getElementById('quickTaskForm');
        if (quickTaskForm) {
            quickTaskForm.addEventListener('submit', this.handleCreateTask.bind(this));
        }

        // Task filter
        const taskFilter = document.getElementById('taskFilter');
        if (taskFilter) {
            taskFilter.addEventListener('change', this.handleTaskFilter.bind(this));
        }

        // Refresh tasks button
        const refreshBtn = document.getElementById('refreshTasks');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.handleRefreshTasks.bind(this));
        }
    }

    // Load initial data
    async loadInitialData() {
        this.showLoading(true);
        
        try {
            // Initialize authentication
            await window.authManager.init();
            
            if (window.authManager.isUserAuthenticated()) {
                await this.showAuthenticatedState();
            } else {
                this.showLoginForm();
            }
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showLoginForm();
        } finally {
            this.showLoading(false);
        }
    }

    // Show loading state
    showLoading(show) {
        const loading = document.getElementById('loading');
        const loginForm = document.getElementById('loginForm');
        const mainApp = document.getElementById('mainApp');
        
        if (show) {
            loading.style.display = 'block';
            loginForm.style.display = 'none';
            mainApp.style.display = 'none';
        } else {
            loading.style.display = 'none';
        }
    }

    // Show login form
    showLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const mainApp = document.getElementById('mainApp');
        const userInfo = document.getElementById('userInfo');
        
        loginForm.style.display = 'block';
        mainApp.style.display = 'none';
        userInfo.style.display = 'none';
    }

    // Show authenticated state
    async showAuthenticatedState() {
        const loginForm = document.getElementById('loginForm');
        const mainApp = document.getElementById('mainApp');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        
        // Show user info
        const user = window.authManager.getCurrentUser();
        if (user && userName) {
            userName.textContent = user.name || user.email;
        }
        
        userInfo.style.display = 'block';
        loginForm.style.display = 'none';
        mainApp.style.display = 'block';
        
        // Load projects and tasks
        await this.loadProjectsAndTasks();
        
        // Check for Gmail data
        await this.checkGmailData();
    }

    // Load projects and tasks
    async loadProjectsAndTasks() {
        try {
            // Load projects
            const projects = await window.projectManager.loadProjects();
            const projectSelect = document.getElementById('projectSelect');
            const projectsList = document.getElementById('projectsList');
            
            if (projectSelect) {
                window.projectManager.populateProjectSelect(projectSelect);
            }
            
            if (projectsList) {
                window.projectManager.renderProjectsList(projectsList);
            }
            
            // Load tasks
            const tasks = await window.taskManager.loadTasks();
            const tasksList = document.getElementById('tasksList');
            
            if (tasksList) {
                window.taskManager.renderTasksList(tasksList);
            }
        } catch (error) {
            console.error('Failed to load projects and tasks:', error);
            this.showMessage('Failed to load data. Please try again.', 'error');
        }
    }

    // Handle login
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('loginError');
        
        if (!email || !password) {
            this.showMessage('Please enter both email and password.', 'error', errorElement);
            return;
        }
        
        this.showLoading(true);
        
        try {
            const result = await window.authManager.signIn(email, password);
            
            if (result.success) {
                await this.showAuthenticatedState();
                this.showMessage('Login successful!', 'success');
            } else {
                this.showMessage(result.error, 'error', errorElement);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Login failed. Please try again.', 'error', errorElement);
        } finally {
            this.showLoading(false);
        }
    }

    // Handle logout
    async handleLogout() {
        await window.authManager.logout();
        await window.projectManager.clearCache();
        await window.taskManager.clearCache();
        
        this.showLoginForm();
        this.showMessage('Logged out successfully.', 'success');
    }

    // Handle create/update task
    async handleCreateTask(event) {
        event.preventDefault();
        
        const projectId = document.getElementById('projectSelect').value;
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('dueDate').value;
        const estimatedHours = document.getElementById('estimatedHours').value;
        const form = document.getElementById('quickTaskForm');
        
        if (!projectId || !title) {
            window.taskManager.showMessage('Please select a project and enter a task title.', 'error');
            return;
        }
        
        const taskData = {
            projectId,
            title,
            description,
            priority,
            dueDate: dueDate || null,
            estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null
        };
        
        try {
            let result;
            const isEditing = form.getAttribute('data-editing') === 'true';
            
            if (isEditing && window.currentEditingTaskId) {
                // Update existing task
                result = await window.taskManager.updateTask(window.currentEditingTaskId, taskData);
            } else {
                // Create new task
                result = await window.taskManager.createTask(taskData);
            }
            
            if (result.success) {
                // Clear form and reset to create mode
                form.reset();
                form.removeAttribute('data-editing');
                window.currentEditingTaskId = null;
                
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = 'Create Task';
                    submitBtn.classList.remove('btn-update');
                }
                
                // Refresh tasks list
                window.taskManager.refreshTasksList();
                
                const message = isEditing ? 'Task updated successfully!' : 'Task created successfully!';
                window.taskManager.showMessage(message, 'success');
            } else {
                window.taskManager.showMessage(result.error, 'error');
            }
        } catch (error) {
            console.error('Task operation error:', error);
            window.taskManager.showMessage('Failed to save task. Please try again.', 'error');
        }
    }

    // Handle task filter
    handleTaskFilter() {
        const filter = document.getElementById('taskFilter');
        const tasksList = document.getElementById('tasksList');
        
        if (filter && tasksList) {
            const filters = filter.value ? { status: filter.value } : {};
            window.taskManager.renderTasksList(tasksList, filters);
        }
    }

    // Handle refresh tasks
    async handleRefreshTasks() {
        try {
            await window.taskManager.loadTasks({}, true); // Force refresh
            window.taskManager.refreshTasksList();
            this.showMessage('Tasks refreshed!', 'success');
        } catch (error) {
            console.error('Refresh tasks error:', error);
            this.showMessage('Failed to refresh tasks.', 'error');
        }
    }

    // Check for Gmail data and pre-fill form
    async checkGmailData() {
        try {
            const result = await chrome.storage.local.get(['gmailTaskData', 'gmailDataReady']);
            
            console.log('Gmail data check result:', result);
            
            if (result.gmailTaskData && result.gmailDataReady) {
                const { title, description } = result.gmailTaskData;
                
                console.log('Raw title:', title);
                console.log('Raw description:', description);
                
                // Pre-fill the form
                const taskTitle = document.getElementById('taskTitle');
                const taskDescription = document.getElementById('taskDescription');
                
                const cleanTitle = this.cleanText(title);
                const cleanDescription = this.cleanText(description);
                
                console.log('Clean title:', cleanTitle);
                console.log('Clean description:', cleanDescription);
                
                if (taskTitle) taskTitle.value = cleanTitle;
                if (taskDescription) taskDescription.value = cleanDescription;
                
                // Clear the stored data
                await chrome.storage.local.remove(['gmailTaskData', 'gmailDataReady']);
                
                // Show success message
                this.showMessage('Email data loaded! Review and create your task.', 'success');
                
                // Scroll to form
                const formSection = document.querySelector('.quick-task-section');
                if (formSection) {
                    formSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        } catch (error) {
            console.error('Failed to check Gmail data:', error);
        }
    }

    // Clean text to remove Gmail JavaScript and other unwanted content
    cleanText(text) {
        if (!text) return '';

        // Remove Gmail JavaScript code
        text = text.replace(/\(function\(\)\{[^}]*\}\(\);/g, '');
        text = text.replace(/var [^=]*=function[^;]*;/g, '');
        text = text.replace(/\/\*[^*]*\*\/|\/\/.*$/gm, '');

        // Remove common email metadata patterns
        text = text.replace(/Print allIn new window/gi, '');
        text = text.replace(/Dave Simmons\s*<[^>]+>/gi, '');
        text = text.replace(/\w{3}\s+\d{1,2},\s+\d{4},\s+\d{1,2}:\d{2}\s+[AP]M/gi, '');
        text = text.replace(/📋\s*Create Task/gi, '');
        text = text.replace(/to me/gi, '');
        text = text.replace(/from\s+[^@]+@[^\s]+/gi, '');
        text = text.replace(/sent\s+[^,]+,/gi, '');
        text = text.replace(/reply[^,]*/gi, '');
        text = text.replace(/forward[^,]*/gi, '');
        
        // Remove specific subject + date patterns that appear at the very beginning only
        // This is safer than removing all dates/times which could remove legitimate email content
        
        // Remove the specific pattern we're seeing: "Help on logoSun, May 11, 12:37 PM"
        text = text.replace(/^Help on logo[^,]*,?\s*(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+\w+\s+\d{1,2},?\s*\d{1,2}:\d{2}\s*[AP]M/gi, '');
        text = text.replace(/^Design Change Request[^,]*,?\s*(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+\w+\s+\d{1,2},?\s*\d{1,2}:\d{2}\s*[AP]M/gi, '');
        
        // Only remove standalone date/time patterns at the very beginning (not in email body)
        text = text.replace(/^(Wed|Mon|Tue|Thu|Fri|Sat|Sun),\s+\w+\s+\d{1,2},\s+\d{1,2}:\d{2}\s+[AP]M/gi, '');
        text = text.replace(/^(Wed|Mon|Tue|Thu|Fri|Sat|Sun),\s+\w+\s+\d{1,2}\s+\d{1,2}:\d{2}\s+[AP]M/gi, '');
        
        // Remove "This has been fixed" and similar responses at the end
        text = text.replace(/,\s*will do\.This has been fixed\.$/gi, '');
        text = text.replace(/This has been fixed\.$/gi, '');
        text = text.replace(/Yes, will do\.$/gi, '');
        text = text.replace(/Sure thing!$/gi, '');
        text = text.replace(/,\s*will do\.$/gi, '');
        text = text.replace(/, will do\.$/gi, '');
        
        // Remove Google quick response suggestions (anywhere in text, not just end)
        text = text.replace(/, I'll take a look\./gi, '');
        text = text.replace(/I'll take a look\./gi, '');
        text = text.replace(/Yes, I will check\./gi, '');
        text = text.replace(/Ok, I'll take a look\./gi, '');
        text = text.replace(/Sure thing!/gi, '');
        text = text.replace(/Yes, I will check\./gi, '');
        
        // Remove other common quick responses (but NOT "Thanks!" as it might be legitimate email content)
        text = text.replace(/Got it!/gi, '');
        text = text.replace(/Perfect!/gi, '');
        text = text.replace(/Sounds good!/gi, '');
        text = text.replace(/Will do!/gi, '');
        text = text.replace(/On it!/gi, '');
        
        // Preserve line breaks and formatting
        text = text.replace(/\n\s*\n\s*\n/g, '\n\n'); // Keep double line breaks
        text = text.replace(/^\s+|\s+$/gm, ''); // Trim each line
        text = text.replace(/\n\s+/g, '\n'); // Remove leading spaces from lines
        
        // Ensure proper spacing around bullet points
        text = text.replace(/•\s*/g, '\n• ');
        text = text.replace(/\n\s*\n/g, '\n\n'); // Preserve double line breaks
        
        // Remove empty lines at start and end
        text = text.replace(/^\s*\n+/, '').replace(/\n+\s*$/, '');
        
        // If still too long, truncate more intelligently
        if (text.length > 1000) {
            // Try to break at sentence boundaries
            const sentences = text.split(/[.!?]+/);
            let result = '';
            for (const sentence of sentences) {
                if (result.length + sentence.length > 950) break;
                result += sentence + '. ';
            }
            text = result.trim();
        }

        return text;
    }

    // Show message
    showMessage(message, type = 'success', element = null) {
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
            
            if (type === 'success') {
                element.className = 'success-message';
            } else {
                element.className = 'error-message';
            }
            
            setTimeout(() => {
                element.style.display = 'none';
            }, 3000);
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const popupManager = new PopupManager();
    await popupManager.init();
});
