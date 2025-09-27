# Tail AI Chrome Extension

A Chrome extension for quick task management and logging with your Tail AI application.

## 🚀 Features

- **Quick Task Creation** - Create tasks directly from your browser
- **Project Management** - View and select from your existing projects
- **Task Overview** - See recent tasks with status updates
- **Secure Authentication** - Connects to your Tail AI production backend
- **Context Menu Integration** - Create tasks from selected text or current page
- **Offline Caching** - Works with cached data when offline

## 📁 Project Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── background.js         # Background service worker
├── styles/
│   └── popup.css        # Popup styling
├── js/
│   ├── api.js           # API communication
│   ├── auth.js          # Authentication management
│   ├── tasks.js         # Task management
│   ├── projects.js      # Project management
│   └── popup.js         # Main popup logic
├── icons/               # Extension icons
└── README.md           # This file
```

## 🔧 Setup Instructions

### 1. Configure Backend URL

Edit `js/api.js` and update the `baseURL` to point to your production DigitalOcean server:

```javascript
this.baseURL = 'https://your-production-domain.com/api';
```

Replace `your-production-domain.com` with your actual DigitalOcean server domain.

### 2. Add Extension Icons

You need to add icon files to the `icons/` directory:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels) 
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use any image editing tool to create these icons, or use the Tail AI logo.

### 3. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension should now appear in your extensions list

### 4. Test the Extension

1. Click the Tail AI extension icon in your browser toolbar
2. Sign in with your Tail AI credentials
3. Try creating a task and viewing your projects

## 🔐 Authentication

The extension uses your existing Tail AI authentication system:
- JWT tokens are stored securely in Chrome's local storage
- Tokens are automatically refreshed when needed
- All API calls include proper authentication headers

## 📡 API Integration

The extension connects to these Tail AI API endpoints:

- `POST /api/auth/signin` - User authentication
- `GET /api/auth/profile` - User profile
- `GET /api/projects` - Fetch user projects
- `GET /api/tasks` - Fetch user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🎯 Usage

### Creating Tasks

1. Click the Tail AI extension icon
2. Select a project from the dropdown
3. Enter task title and description
4. Set priority and due date (optional)
5. Click "Create Task"

### Managing Tasks

- View recent tasks in the popup
- Filter tasks by status (All, To Do, In Progress, Completed)
- Mark tasks as complete or in progress
- Delete tasks with confirmation

### Context Menu

Right-click on any webpage to:
- Create a task from selected text
- Start time tracking (future feature)

## 🔧 Development

### Making Changes

1. Edit the relevant files in the `chrome-extension/` directory
2. Go to `chrome://extensions/`
3. Click the refresh icon on your Tail AI extension
4. Test your changes

### Debugging

- Open Chrome DevTools (F12) while the popup is open
- Check the Console tab for any errors
- Use the Network tab to monitor API calls

## 📦 Building for Production

To create a production-ready extension:

1. Ensure all files are properly configured
2. Add your production backend URL
3. Add proper icon files
4. Test thoroughly
5. Zip the entire `chrome-extension` folder
6. Upload to Chrome Web Store (if publishing publicly)

## 🔒 Security Notes

- All API communication uses HTTPS in production
- JWT tokens are stored securely in Chrome's local storage
- No sensitive data is stored in plain text
- CORS is handled by your backend configuration

## 🐛 Troubleshooting

### Extension Won't Load
- Check that all required files are present
- Verify `manifest.json` syntax is correct
- Look for errors in Chrome's extension console

### Authentication Issues
- Verify your backend URL is correct
- Check that your backend is accessible
- Ensure CORS is properly configured on your backend

### API Errors
- Check Chrome DevTools Network tab
- Verify your backend is running and accessible
- Check backend logs for any errors

## 📝 Future Enhancements

Potential features for future versions:
- Time tracking integration
- Browser notifications for task reminders
- Auto-detection of project context from websites
- Bulk task operations
- Task templates
- Integration with other productivity tools

## 🤝 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Chrome DevTools console for errors
3. Verify your backend configuration
4. Test API endpoints directly

---

**Built for Tail AI** - Modern time management for modern teams 🚀
