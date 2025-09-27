// Gmail integration content script
class GmailIntegration {
    constructor() {
        this.init();
    }

    init() {
        // Check if we're on Gmail
        if (this.isGmail()) {
            this.addCreateTaskButton();
        }
    }

    isGmail() {
        return window.location.hostname.includes('mail.google.com') || 
               window.location.hostname.includes('gmail.com');
    }

    addCreateTaskButton() {
        // Wait for Gmail to load
        const checkGmail = setInterval(() => {
            const replyButton = document.querySelector('[data-tooltip*="Reply"]') || 
                               document.querySelector('[aria-label*="Reply"]') ||
                               document.querySelector('.ams.bk');
            
            if (replyButton && !document.getElementById('tail-ai-create-task-btn')) {
                this.createTaskButton(replyButton);
                clearInterval(checkGmail);
            }
        }, 1000);
    }

    createTaskButton(replyButton) {
        // Create the Create Task button
        const createTaskBtn = document.createElement('div');
        createTaskBtn.id = 'tail-ai-create-task-btn';
        createTaskBtn.innerHTML = `
            <div class="tail-ai-btn" style="
                display: inline-flex;
                align-items: center;
                padding: 8px 12px;
                margin-left: 8px;
                background: #3b82f6;
                color: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: background-color 0.2s;
            " onmouseover="this.style.backgroundColor='#2563eb'" onmouseout="this.style.backgroundColor='#3b82f6'">
                📋 Create Task
            </div>
        `;

        // Insert after reply button
        replyButton.parentNode.insertBefore(createTaskBtn, replyButton.nextSibling);

        // Add click handler
        createTaskBtn.addEventListener('click', () => {
            this.createTaskFromEmail();
        });
    }

    async createTaskFromEmail() {
        try {
            // Get email subject and body
            const subject = this.getEmailSubject();
            const body = this.getEmailBody();
            
            console.log('Extracted subject:', subject);
            console.log('Extracted body:', body);
            
            // Store data for popup to use
            await chrome.storage.local.set({
                gmailTaskData: {
                    title: subject,
                    description: body,
                    source: 'gmail'
                }
            });

            // Store a flag to indicate Gmail data is ready
            chrome.storage.local.set({ gmailDataReady: true });
            
            // Try to open the extension popup
            this.openExtensionPopup();
            
        } catch (error) {
            console.error('Failed to create task from email:', error);
            this.showNotification('Failed to extract email data', 'error');
        }
    }

    getEmailSubject() {
        console.log('Starting subject extraction...');
        
        // First, try to find the actual email thread subject
        const threadSubjectSelectors = [
            'h2[data-thread-perm-id]',
            '.thread-subject',
            '[data-thread-perm-id]',
            '.thread-subject h2',
            '.thread-subject span',
            '.thread-title',
            '.thread-subject-text',
            '.thread-title-text'
        ];

        for (const selector of threadSubjectSelectors) {
            const elements = document.querySelectorAll(selector);
            console.log(`Checking selector ${selector}, found ${elements.length} elements`);
            
            for (const element of elements) {
                if (element && element.textContent.trim()) {
                    let text = element.textContent.trim();
                    console.log(`Element text: "${text}"`);
                    
                    // Skip if it's the search box or other UI elements
                    if (text === 'Search' || text === 'Search mail' || text === 'Inbox' || text.length < 3) {
                        console.log('Skipping element - appears to be UI element');
                        continue;
                    }
                    
                    // Clean up the text
                    text = text.replace(/\s+/g, ' ');
                    text = text.replace(/Print allIn new window/gi, '');
                    text = text.replace(/Dave Simmons\s*<[^>]+>/gi, '');
                    
                    if (text && text.length > 3) {
                        console.log('Found valid subject:', text);
                        return text;
                    }
                }
            }
        }

        // Try to find subject in the main content area
        const mainArea = document.querySelector('[role="main"]');
        if (mainArea) {
            const h2Elements = mainArea.querySelectorAll('h2');
            console.log(`Found ${h2Elements.length} h2 elements in main area`);
            
            for (const h2 of h2Elements) {
                const text = h2.textContent.trim();
                console.log(`H2 text: "${text}"`);
                
                if (text && text !== 'Search' && text !== 'Inbox' && text.length > 3) {
                    console.log('Found subject in main area h2:', text);
                    return text;
                }
            }
        }

        // Fallback: try to get from page title
        const title = document.title;
        console.log('Page title:', title);
        if (title && title !== 'Gmail') {
            let cleanTitle = title.replace(/ - Gmail$/, '').replace(/^Gmail - /, '');
            if (cleanTitle && cleanTitle.length > 3) {
                console.log('Found subject from page title:', cleanTitle);
                return cleanTitle;
            }
        }

        console.log('No subject found, using fallback');
        return 'Email Task';
    }

    getEmailBody() {
        // Try to find the actual email content area - optimized selectors
        const contentSelectors = [
            // Gmail-specific selectors for email body content only
            '.thread-message-content .ii',
            '.thread-message-content .adn',
            '.thread-message-content .hP',
            '.thread-message-content .a3s',
            '.thread-message-content .yW',
            '.thread-message-content div[dir="ltr"]',
            '.thread-message-content .message-body',
            '.thread-message-content .email-body',
            '.thread-message-content .message-content',
            '.thread-message-content .email-content',
            // Broader Gmail selectors
            '.thread-message-content',
            '.message-body-content', 
            '.email-body',
            '.message-content',
            '[role="main"] .message-body',
            // Fallback selectors
            '[role="main"] div[dir="ltr"]',
            '[role="main"] .ii',
            '[role="main"] .adn'
        ];

        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                console.log('Found email content with selector:', selector);
                return this.extractCleanContent(element);
            }
        }

        // Last resort: try to find any content within the main thread area
        const threadArea = document.querySelector('[role="main"] .thread-content') || 
                          document.querySelector('[role="main"] .thread-message-content') ||
                          document.querySelector('[role="main"]');
        if (threadArea) {
            console.log('Using fallback thread area');
            return this.extractCleanContent(threadArea);
        }

        console.log('No email content found');
        return 'Email content';
    }

    extractCleanContent(element) {
        if (!element) return '';

        // Clone the element to avoid modifying the original
        const clone = element.cloneNode(true);
        
        // Remove unwanted elements including Google quick response suggestions
        const unwantedSelectors = [
            // Header and metadata elements
            '.thread-subject',
            '.sender-info',
            '.timestamp',
            '.reply-info',
            '.thread-header',
            '.message-header',
            '.thread-controls',
            '.message-controls',
            '[data-tooltip*="Reply"]',
            '[data-tooltip*="Forward"]',
            '.thread-actions',
            '.message-actions',
            // Google quick response buttons and suggestions
            '.quick-reply-suggestion',
            '.suggestion-button',
            '.smart-reply-button',
            '[data-tooltip*="suggestion"]',
            '[data-tooltip*="reply"]',
            '.gmail-smart-reply',
            'button[aria-label*="reply"]',
            'button[aria-label*="suggestion"]',
            '.suggestion',
            '.quick-reply',
            // Any buttons that might be quick responses
            'button',
            // Signature and footer elements
            '.gmail_quote',
            '.gmail_signature',
            '.signature',
            '[data-smartmail="gmail_signature"]',
            '.thread-message-footer',
            '.message-footer'
        ];

        unwantedSelectors.forEach(selector => {
            const unwanted = clone.querySelectorAll(selector);
            unwanted.forEach(el => el.remove());
        });

        // Preserve line breaks by converting <br> tags to newlines and handling block elements
        const brElements = clone.querySelectorAll('br');
        brElements.forEach(br => {
            br.replaceWith('\n');
        });

        // Convert block elements to have line breaks
        const blockElements = clone.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li');
        blockElements.forEach(el => {
            // Add newline after block elements
            if (el.nextSibling) {
                el.appendChild(document.createTextNode('\n'));
            }
            // Add bullet points for list items
            if (el.tagName === 'LI') {
                el.insertBefore(document.createTextNode('• '), el.firstChild);
            }
        });

        // Convert bullet points and list items
        const listItems = clone.querySelectorAll('li');
        listItems.forEach(li => {
            if (!li.textContent.startsWith('•')) {
                li.insertBefore(document.createTextNode('• '), li.firstChild);
            }
        });

        // Get the text content while preserving structure
        let text = clone.textContent || clone.innerText || '';
        
        // Ensure proper spacing around bullet points
        text = text.replace(/•\s*/g, '\n• ');
        text = text.replace(/\n\s*\n/g, '\n\n'); // Preserve double line breaks
        
        // Clean up the text while preserving formatting
        text = this.cleanEmailText(text);
        
        return text;
    }

    cleanEmailText(text) {
        if (!text) return '';

        // Remove Gmail JavaScript code
        text = text.replace(/\(function\(\)\{[^}]*\}\(\);/g, '');
        text = text.replace(/var [^=]*=function[^;]*;/g, '');
        text = text.replace(/\/\*[^*]*\*\/|\/\/.*$/gm, '');

        // Remove common email metadata patterns
        text = text.replace(/Print allIn new window/gi, '');
        text = text.replace(/Design Change Request/gi, '');
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
        // DON'T replace all whitespace with single spaces - preserve line breaks
        
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

    async openExtensionPopup() {
        try {
            console.log('Sending message to open extension window...');
            
            // Open extension as a popup window instead of using the extension popup
            const response = await chrome.runtime.sendMessage({ 
                action: 'openExtensionWindow',
                data: {
                    title: 'Tail AI Task Manager',
                    width: 400,
                    height: 600
                }
            });
            
            console.log('Response from background script:', response);
            
            if (response && response.success) {
                this.showNotification('📋 Tail AI Task Manager opened!', 'success');
            } else {
                throw new Error(response?.error || 'Unknown error');
            }
            
        } catch (error) {
            console.error('Failed to open extension window:', error);
            // Fallback: show instruction notification
            this.showNotification('📋 TASK DATA READY! Click the Tail AI extension icon in your toolbar now!', 'success');
        }
    }

    showNotification(message, type) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize Gmail integration
new GmailIntegration();
