# 🚀 Setup Guide

## 📋 Prerequisites

### System Requirements
- **Node.js** 18+ 
- **npm** or **yarn**
- **Modern browser** with ES Modules support

### Browser Compatibility
- Chrome 61+
- Firefox 60+
- Safari 10.1+
- Edge 79+

## ⚙️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd app-diagram
```

### 2. Install Dependencies
```bash
# ติดตั้ง dependencies
npm install

# Or with yarn
yarn install
```

### 3. Start Development Server
```bash
# เริ่ม development server
npm run dev

# Or with yarn
yarn dev
```

The application will be available at `http://localhost:4321`

## 🔧 Development Commands

### Basic Commands
```bash
# Development with hot reload
npm run dev

# Type checking
npm run astro check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Advanced Commands
```bash
# Build with detailed output
npm run build -- --verbose

# Check for unused dependencies
npm run astro check -- --watch

# Clear cache and restart
rm -rf .astro && npm run dev
```

## 📊 Configuration

### 1. Data Configuration

#### Configure Pages (`src/data/pages.json`)
```json
{
  "page-id": {
    "name": "Page Display Name",
    "description": "Page description",
    "apis": [
      "server-id:HTTP_METHOD /api/endpoint",
      "auth-server:POST /auth/login",
      "user-server:GET /user/profile"
    ]
  }
}
```

#### Configure Servers (`src/data/servers.json`)
```json
{
  "server-id": {
    "name": "Server Display Name",
    "description": "Server description", 
    "apis": [
      "HTTP_METHOD /api/endpoint",
      "POST /auth/login",
      "GET /user/profile"
    ]
  }
}
```

### 2. Environment Variables

Create `.env` file in project root:
```bash
# Development settings
PUBLIC_APP_NAME="Architecture Diagram"
PUBLIC_DEBUG_MODE=true

# Performance settings
PUBLIC_ANIMATION_DURATION=400
PUBLIC_HOVER_DELAY=100
```

### 3. Astro Configuration

The `astro.config.mjs` is pre-configured with:
- Tailwind CSS integration
- Component optimization
- ES module support

## 🎨 Styling Configuration

### Tailwind CSS
Customize styles in `tailwind.config.mjs`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        // Add custom colors
      },
      animation: {
        'slide-in': 'slideIn 0.4s ease-out',
        // Add custom animations
      }
    }
  }
}
```

### Custom CSS
Global styles in `src/styles/globals.css`:
```css
:root {
  --animation-duration: 0.4s;
  --hover-scale: 1.05;
  --border-radius: 8px;
}
```

## 🧪 Testing Setup

### Manual Testing Checklist
- [ ] Cards render correctly
- [ ] Hover interactions work
- [ ] Connections draw properly
- [ ] Zoom/pan functionality
- [ ] Mobile responsiveness
- [ ] Data loading from JSON

### Browser Testing
Test in multiple browsers:
```bash
# Chrome
open -a "Google Chrome" http://localhost:4321

# Firefox
open -a "Firefox" http://localhost:4321

# Safari
open -a "Safari" http://localhost:4321
```

## 🔍 Troubleshooting Setup

### Common Issues

#### Permission Errors (npm)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use node version manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
```

#### Module Loading Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check file permissions
ls -la public/scripts/
```

#### Port Already in Use
```bash
# Find process using port 4321
lsof -ti:4321

# Kill process
kill -9 $(lsof -ti:4321)

# Or use different port
npm run dev -- --port 3000
```

### Verification Steps

#### 1. Check Installation
```bash
# Verify Node.js version
node --version  # Should be 18+

# Verify npm version
npm --version

# Check project dependencies
npm list --depth=0
```

#### 2. Test Basic Functionality
```bash
# Start dev server
npm run dev

# In browser console:
console.log('Cards:', document.querySelectorAll('.page-card').length);
console.log('Controller:', window.diagramController);
```

#### 3. Validate Configuration
```javascript
// In browser console
fetch('/src/data/pages.json')
  .then(r => r.json())
  .then(data => console.log('Pages config:', data));

fetch('/src/data/servers.json')
  .then(r => r.json())
  .then(data => console.log('Servers config:', data));
```

## 📱 Mobile Setup

### Mobile Testing
```bash
# Get local IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# Access from mobile device
# http://YOUR_IP:4321
```

### Mobile-Specific Configuration
Add viewport meta tag (already included):
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## 🚀 Production Setup

### Build Process
```bash
# Build for production
npm run build

# Verify build output
ls -la dist/

# Test production build locally
npm run preview
```

### Deployment Preparation
```bash
# Check build size
du -sh dist/

# Verify all assets
find dist/ -name "*.js" -o -name "*.css" -o -name "*.html"

# Test production URLs
grep -r "localhost" dist/ # Should return nothing
```

### Server Configuration
For static hosting, ensure:
- Serve `dist/` directory
- Configure fallback to `index.html` for SPA routing
- Set proper MIME types for `.js` and `.css` files

## 🔧 IDE Setup

### VS Code Extensions
Recommended extensions:
- Astro
- Tailwind CSS IntelliSense
- ES6 Modules
- Auto Rename Tag
- Prettier

### VS Code Settings
```json
{
  "astro.format.enable": true,
  "editor.formatOnSave": true,
  "files.associations": {
    "*.astro": "astro"
  }
}
```

## 📚 Next Steps

After setup completion:
1. Read [Architecture Guide](./ARCHITECTURE.md) to understand the system
2. Follow [Development Guide](./DEVELOPMENT.md) for coding standards
3. Check [API Reference](./API_REFERENCE.md) for module documentation
4. Use [Troubleshooting Guide](./TROUBLESHOOTING.md) when issues arise

---

*Setup complete! You're ready to start developing with the Architecture Diagram application.*