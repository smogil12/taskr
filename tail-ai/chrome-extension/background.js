// Background service worker for Chrome extension
class BackgroundService {
    constructor() {
        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        // Extension installation
        chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));
        
        // Extension startup
        chrome.runtime.onStartup.addListener(this.handleStartup.bind(this));
        
        // Tab updates (for future features like auto-project detection)
        chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
        
        // Context menu (for future features) - temporarily disabled
        // chrome.contextMenus.onClicked.addListener(this.handleContextMenuClick.bind(this));
        
        // Message handling from content scripts
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    }

    // Handle extension installation
    async handleInstall(details) {
        console.log('Tail AI Extension installed:', details);
        
        // Create context menu items - temporarily disabled
        // this.createContextMenuItems();
        
        // Initialize storage
        await this.initializeStorage();
    }

    // Handle extension startup
    async handleStartup() {
        console.log('Tail AI Extension started');
        
        // Check authentication status
        await this.checkAuthStatus();
    }

    // Create context menu items
    createContextMenuItems() {
        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                id: 'createTask',
                title: 'Create Tail AI Task',
                contexts: ['selection', 'page']
            });
            
            chrome.contextMenus.create({
                id: 'startTimer',
                title: 'Start Time Tracking',
                contexts: ['page']
            });
        });
    }

    // Handle context menu clicks
    async handleContextMenuClick(info, tab) {
        switch (info.menuItemId) {
            case 'createTask':
                await this.handleCreateTaskFromContext(info, tab);
                break;
            case 'startTimer':
                await this.handleStartTimerFromContext(info, tab);
                break;
        }
    }

    // Handle create task from context menu
    async handleCreateTaskFromContext(info, tab) {
        try {
            const { authToken } = await chrome.storage.local.get(['authToken']);
            
            if (!authToken) {
                this.showNotification('Please sign in to Tail AI first', 'error');
                return;
            }

            const selectedText = info.selectionText || '';
            const pageTitle = tab.title || '';
            const url = tab.url || '';
            
            // Open popup with pre-filled task data
            chrome.action.openPopup();
            
            // Store context data for popup to use
            await chrome.storage.local.set({
                contextTaskData: {
                    title: selectedText || pageTitle,
                    description: `Created from: ${url}`,
                    source: 'context_menu'
                }
            });
            
        } catch (error) {
            console.error('Failed to create task from context:', error);
            this.showNotification('Failed to create task', 'error');
        }
    }

    // Handle start timer from context menu
    async handleStartTimerFromContext(info, tab) {
        try {
            const { authToken } = await chrome.storage.local.get(['authToken']);
            
            if (!authToken) {
                this.showNotification('Please sign in to Tail AI first', 'error');
                return;
            }

            // This would integrate with time tracking features
            this.showNotification('Time tracking feature coming soon!', 'info');
            
        } catch (error) {
            console.error('Failed to start timer from context:', error);
            this.showNotification('Failed to start timer', 'error');
        }
    }

    // Handle tab updates
    async handleTabUpdate(tabId, changeInfo, tab) {
        // Only process when tab is fully loaded
        if (changeInfo.status !== 'complete' || !tab.url) return;
        
        try {
            // Check if user is authenticated
            const { authToken } = await chrome.storage.local.get(['authToken']);
            if (!authToken) return;
            
            // Update extension icon based on current website
            await this.updateIconForWebsite(tab.url);
            
        } catch (error) {
            console.error('Failed to handle tab update:', error);
        }
    }

    // Update icon based on website
    async updateIconForWebsite(url) {
        try {
            // This could be used to show different icons or states
            // based on the current website (e.g., different colors for different project types)
            const domain = new URL(url).hostname;
            
            // Example: Different icons for different domains
            let iconPath = 'icons/icon16.png';
            
            // You could customize this based on your projects
            if (domain.includes('github.com')) {
                iconPath = 'icons/icon16-dev.png';
            } else if (domain.includes('gmail.com') || domain.includes('outlook.com')) {
                iconPath = 'icons/icon16-email.png';
            }
            
            chrome.action.setIcon({
                path: {
                    16: iconPath,
                    32: 'icons/icon32.png',
                    48: 'icons/icon48.png',
                    128: 'icons/icon128.png'
                }
            });
            
        } catch (error) {
            console.error('Failed to update icon:', error);
        }
    }

    // Initialize storage
    async initializeStorage() {
        try {
            const defaultSettings = {
                autoDetectProjects: true,
                showNotifications: true,
                defaultProject: null
            };
            
            const { settings } = await chrome.storage.local.get(['settings']);
            if (!settings) {
                await chrome.storage.local.set({ settings: defaultSettings });
            }
            
        } catch (error) {
            console.error('Failed to initialize storage:', error);
        }
    }

    // Check authentication status
    async checkAuthStatus() {
        try {
            const { authToken, userData } = await chrome.storage.local.get(['authToken', 'userData']);
            
            if (authToken && userData) {
                console.log('User authenticated:', userData.email);
                
                // Set up periodic sync (every 5 minutes)
                this.setupPeriodicSync();
            } else {
                console.log('User not authenticated');
            }
            
        } catch (error) {
            console.error('Failed to check auth status:', error);
        }
    }

    // Setup periodic sync
    setupPeriodicSync() {
        // Clear any existing alarm
        chrome.alarms.clear('periodicSync');
        
        // Set up new alarm for every 5 minutes
        chrome.alarms.create('periodicSync', {
            periodInMinutes: 5
        });
        
        // Listen for alarm
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'periodicSync') {
                this.performPeriodicSync();
            }
        });
    }

    // Perform periodic sync
    async performPeriodicSync() {
        try {
            const { authToken } = await chrome.storage.local.get(['authToken']);
            if (!authToken) return;
            
            // Sync tasks and projects in background
            console.log('Performing periodic sync...');
            
            // This would trigger background updates of cached data
            // Implementation depends on your specific needs
            
        } catch (error) {
            console.error('Failed to perform periodic sync:', error);
        }
    }

    // Handle messages from content scripts
    async handleMessage(request, sender, sendResponse) {
        if (request.action === 'openPopup' || request.action === 'focusExtension') {
            try {
                // Get the current active tab
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tabs[0]) {
                    // Try to focus the extension (this may not work due to Chrome restrictions)
                    try {
                        chrome.action.openPopup();
                    } catch (popupError) {
                        console.log('Cannot programmatically open popup:', popupError);
                    }
                    
                    // Send response back
                    sendResponse({ success: true });
                }
            } catch (error) {
                console.error('Failed to handle message:', error);
                sendResponse({ success: false, error: error.message });
            }
        } else if (request.action === 'flashExtension') {
            try {
                // Set a badge to make the extension icon more noticeable
                await chrome.action.setBadgeText({ text: request.text || 'NEW!' });
                await chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Green color
                
                // Clear the badge after 5 seconds
                setTimeout(() => {
                    chrome.action.setBadgeText({ text: '' });
                }, 5000);
                
                sendResponse({ success: true });
            } catch (error) {
                console.error('Failed to flash extension:', error);
                sendResponse({ success: false, error: error.message });
            }
        } else if (request.action === 'openExtensionWindow') {
            try {
                console.log('Attempting to open extension window...');
                
                // Get current window to use as reference for screen dimensions
                const currentWindows = await chrome.windows.getAll();
                const primaryWindow = currentWindows.find(w => w.type === 'normal') || currentWindows[0];
                
                const windowWidth = request.data?.width || 400;
                const windowHeight = request.data?.height || 600;
                
                console.log('Primary window info:', primaryWindow);
                
                // Calculate position for right side of screen
                // Use a reasonable assumption for screen width if we can't get exact dimensions
                const estimatedScreenWidth = primaryWindow ? (primaryWindow.left + primaryWindow.width) : 1920;
                const estimatedScreenHeight = primaryWindow ? (primaryWindow.top + primaryWindow.height) : 1080;
                
                const leftPosition = estimatedScreenWidth - windowWidth;
                const topPosition = Math.max(0, (estimatedScreenHeight - windowHeight) / 2);
                
                console.log('Estimated screen dimensions:', { estimatedScreenWidth, estimatedScreenHeight });
                console.log('Calculated position:', { leftPosition, topPosition });
                
                // Create window with positioning
                const windowOptions = {
                    url: chrome.runtime.getURL('popup.html'),
                    type: 'popup',
                    width: windowWidth,
                    height: windowHeight,
                    left: leftPosition,
                    top: topPosition,
                    focused: true
                };
                
                console.log('Window options:', windowOptions);
                
                const window = await chrome.windows.create(windowOptions);
                console.log('Successfully opened extension window:', window);
                
                sendResponse({ success: true, windowId: window.id });
            } catch (error) {
                console.error('Failed to open extension window:', error);
                
                // Try fallback with minimal options
                try {
                    console.log('Trying fallback window creation...');
                    const fallbackWindow = await chrome.windows.create({
                        url: chrome.runtime.getURL('popup.html'),
                        width: 400,
                        height: 600,
                        focused: true
                    });
                    console.log('Fallback window created:', fallbackWindow);
                    sendResponse({ success: true, windowId: fallbackWindow.id });
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                    sendResponse({ success: false, error: fallbackError.message });
                }
            }
        }
        return true;
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notificationOptions = {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Tail AI',
            message: message
        };
        
        switch (type) {
            case 'error':
                notificationOptions.type = 'basic';
                break;
            case 'success':
                notificationOptions.type = 'basic';
                break;
            default:
                notificationOptions.type = 'basic';
        }
        
        chrome.notifications.create(notificationOptions);
    }
}

// Initialize background service
const backgroundService = new BackgroundService();
