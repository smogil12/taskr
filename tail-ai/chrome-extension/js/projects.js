// Project management
class ProjectManager {
    constructor() {
        this.projects = [];
        this.lastFetch = null;
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Load projects from cache or API
    async loadProjects(forceRefresh = false) {
        const now = Date.now();
        
        // Check cache first
        if (!forceRefresh && this.lastFetch && (now - this.lastFetch) < this.cacheTimeout) {
            return this.projects;
        }

        try {
            const response = await window.tailAIAPI.getProjects();
            this.projects = response.projects || [];
            this.lastFetch = now;
            
            // Cache projects
            await chrome.storage.local.set({ 
                projects: this.projects,
                projectsLastFetch: now
            });
            
            return this.projects;
        } catch (error) {
            console.error('Failed to load projects:', error);
            
            // Try to load from cache as fallback
            try {
                const cached = await chrome.storage.local.get(['projects', 'projectsLastFetch']);
                if (cached.projects && cached.projectsLastFetch) {
                    const cacheAge = now - cached.projectsLastFetch;
                    if (cacheAge < this.cacheTimeout * 2) { // Allow stale cache for up to 10 minutes
                        this.projects = cached.projects;
                        return this.projects;
                    }
                }
            } catch (cacheError) {
                console.error('Failed to load cached projects:', cacheError);
            }
            
            throw error;
        }
    }

    // Get project by ID
    getProjectById(projectId) {
        return this.projects.find(project => project.id === projectId);
    }

    // Get project name by ID
    getProjectName(projectId) {
        const project = this.getProjectById(projectId);
        return project ? project.name : 'Unknown Project';
    }

    // Populate project select dropdown
    populateProjectSelect(selectElement) {
        // Clear existing options
        selectElement.innerHTML = '<option value="">Select a project...</option>';
        
        if (this.projects.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No projects found';
            option.disabled = true;
            selectElement.appendChild(option);
            return;
        }

        // Add projects to select
        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            selectElement.appendChild(option);
        });
    }

    // Render projects list
    renderProjectsList(containerElement) {
        if (this.projects.length === 0) {
            containerElement.innerHTML = '<p class="no-data">No projects found</p>';
            return;
        }

        const projectsHtml = this.projects.map(project => `
            <div class="project-item">
                <div class="project-name">${this.escapeHtml(project.name)}</div>
                <div class="project-meta">
                    ${project.description ? this.escapeHtml(project.description) : 'No description'}
                    ${project.allocatedHours ? ` • ${project.allocatedHours}h allocated` : ''}
                    ${project.consumedHours ? ` • ${project.consumedHours}h used` : ''}
                </div>
            </div>
        `).join('');

        containerElement.innerHTML = projectsHtml;
    }

    // Create new project
    async createProject(projectData) {
        try {
            const response = await window.tailAIAPI.createProject(projectData);
            
            // Add to local projects array
            this.projects.push(response.project);
            this.lastFetch = Date.now();
            
            // Update cache
            await chrome.storage.local.set({ 
                projects: this.projects,
                projectsLastFetch: this.lastFetch
            });
            
            return { success: true, project: response.project };
        } catch (error) {
            console.error('Failed to create project:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to create project' 
            };
        }
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
        this.projects = [];
        this.lastFetch = null;
        await chrome.storage.local.remove(['projects', 'projectsLastFetch']);
    }
}

// Create global project manager instance
window.projectManager = new ProjectManager();
