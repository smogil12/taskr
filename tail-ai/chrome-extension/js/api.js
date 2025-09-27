// API Configuration and utilities
class TailAIAPI {
    constructor() {
        // Production backend URL - points to your DigitalOcean server
        this.baseURL = 'http://167.99.115.97:3002/api';
        // For development, you can use: this.baseURL = 'http://localhost:4000/api';
        
        this.token = null;
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Authentication endpoints
    async signIn(email, password) {
        return this.request('/auth/signin', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    // Project endpoints
    async getProjects() {
        return this.request('/projects');
    }

    async createProject(projectData) {
        return this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData),
        });
    }

    // Task endpoints
    async getTasks(filters = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });
        
        const endpoint = queryParams.toString() ? `/tasks?${queryParams}` : '/tasks';
        return this.request(endpoint);
    }

    async getTask(taskId) {
        return this.request(`/tasks/${taskId}`);
    }

    async createTask(taskData) {
        return this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
    }

    async updateTask(taskId, taskData) {
        return this.request(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(taskData),
        });
    }

    async deleteTask(taskId) {
        return this.request(`/tasks/${taskId}`, {
            method: 'DELETE',
        });
    }

    // Time entry endpoints (for future use)
    async getTimeEntries(filters = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });
        
        const endpoint = queryParams.toString() ? `/time-entries?${queryParams}` : '/time-entries';
        return this.request(endpoint);
    }

    async createTimeEntry(timeEntryData) {
        return this.request('/time-entries', {
            method: 'POST',
            body: JSON.stringify(timeEntryData),
        });
    }

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
            return response.ok;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
}

// Create global API instance
window.tailAIAPI = new TailAIAPI();
