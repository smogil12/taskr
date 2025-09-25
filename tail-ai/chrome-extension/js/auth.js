// Authentication management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.isAuthenticated = false;
    }

    // Initialize authentication state from storage
    async init() {
        try {
            const result = await chrome.storage.local.get(['authToken', 'userData']);
            
            if (result.authToken && result.userData) {
                this.token = result.authToken;
                this.currentUser = result.userData;
                this.isAuthenticated = true;
                
                // Set token in API instance
                window.tailAIAPI.setToken(this.token);
                
                // Verify token is still valid
                try {
                    await window.tailAIAPI.getProfile();
                } catch (error) {
                    console.log('Token expired, clearing auth data');
                    await this.logout();
                }
            }
        } catch (error) {
            console.error('Failed to initialize auth:', error);
            await this.logout();
        }
    }

    // Sign in user
    async signIn(email, password) {
        try {
            const response = await window.tailAIAPI.signIn(email, password);
            
            if (response.token && response.user) {
                this.token = response.token;
                this.currentUser = response.user;
                this.isAuthenticated = true;
                
                // Set token in API instance
                window.tailAIAPI.setToken(this.token);
                
                // Save to storage
                await chrome.storage.local.set({
                    authToken: this.token,
                    userData: this.currentUser
                });
                
                return { success: true, user: this.currentUser };
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Sign in failed:', error);
            return { 
                success: false, 
                error: error.message || 'Sign in failed' 
            };
        }
    }

    // Logout user
    async logout() {
        this.token = null;
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Clear API token
        window.tailAIAPI.setToken(null);
        
        // Clear storage
        await chrome.storage.local.remove(['authToken', 'userData']);
        
        // Clear any cached data
        await chrome.storage.local.remove(['projects', 'tasks']);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if authenticated
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    // Get auth token
    getToken() {
        return this.token;
    }

    // Update user data
    async updateUserData(userData) {
        this.currentUser = userData;
        await chrome.storage.local.set({ userData: this.currentUser });
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();
