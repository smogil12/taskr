# Tail AI Chrome Extension - Quick Setup Guide

## 🎯 Quick Start (5 minutes)

### Step 1: Update Backend URL
Edit `js/api.js` line 6:
```javascript
this.baseURL = 'https://YOUR_DIGITALOCEAN_DOMAIN.com/api';
```

### Step 2: Add Icons
Create these icon files in the `icons/` folder:
- `icon16.png` (16x16)
- `icon32.png` (32x32) 
- `icon48.png` (48x48)
- `icon128.png` (128x128)

**Quick icon creation:**
1. Take any 128x128 image
2. Resize to each required size
3. Save as PNG files with exact names above

### Step 3: Load Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. Done! 🎉

## 🧪 Test It
1. Click the Tail AI icon in Chrome toolbar
2. Sign in with your Tail AI account
3. Create a test task
4. View your projects

## 🔧 Production Deployment
When ready to update your existing Chrome extension:
1. Zip the entire `chrome-extension` folder
2. Upload to Chrome Web Store as an update
3. The extension ID will remain the same

## 📋 Checklist
- [ ] Backend URL updated
- [ ] Icons added (16, 32, 48, 128px)
- [ ] Extension loads without errors
- [ ] Can sign in successfully
- [ ] Can create tasks
- [ ] Can view projects

## 🚨 Common Issues
- **Extension won't load**: Check manifest.json syntax
- **Can't sign in**: Verify backend URL and CORS settings
- **No projects show**: Check API permissions and authentication
