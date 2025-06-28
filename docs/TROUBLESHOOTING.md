# 🔧 Troubleshooting Guide

## ❌ Common Issues & Solutions

### 🚫 Module Loading Issues

#### Issue: `404 Not Found` for JavaScript modules
```
GET http://localhost:4321/scripts/moduleName.js net::ERR_ABORTED 404
```

**Causes & Solutions:**
1. **File path mismatch**
   ```javascript
   // ❌ Wrong path
   import { Module } from './moduleName.js';
   
   // ✅ Correct absolute path
   import { Module } from '/scripts/shared/ModuleName.js';
   ```

2. **File doesn't exist**
   ```bash
   # Check file exists
   ls -la public/scripts/shared/
   
   # Verify case-sensitive filename
   # ModuleName.js vs modulename.js
   ```

3. **Cached old paths**
   ```
   ✅ Hard refresh browser (Ctrl+F5 / Cmd+Shift+R)
   ✅ Clear browser cache
   ✅ Restart development server
   ```

#### Issue: `Uncaught SyntaxError` in modules
```
Uncaught SyntaxError: Unexpected token 'export'
```

**Solutions:**
1. **Check script type**
   ```html
   <!-- ✅ Correct -->
   <script type="module">
   
   <!-- ❌ Wrong -->
   <script>
   ```

2. **Validate JavaScript syntax**
   ```javascript
   // Check for missing brackets, semicolons, etc.
   // Use ESLint or browser dev tools
   ```

3. **Check export/import syntax**
   ```javascript
   // ✅ Correct export
   export class MyClass { }
   
   // ✅ Correct import
   import { MyClass } from '/path/to/module.js';
   ```

---

### 🎯 Interaction Issues

#### Issue: Cards not responding to hover
```
No movement or highlighting when hovering over cards
```

**Debugging Steps:**
1. **Check console for errors**
   ```javascript
   // Open browser dev tools > Console
   // Look for JavaScript errors
   ```

2. **Verify DOM elements exist**
   ```javascript
   // In browser console
   console.log(document.querySelectorAll('.page-card'));
   console.log(document.querySelectorAll('.server-card'));
   
   // Should show card elements, not empty array
   ```

3. **Check event listeners**
   ```javascript
   // In browser console
   window.diagramController
   
   // Should show initialized controller
   // If undefined, initialization failed
   ```

4. **Verify data attributes**
   ```javascript
   // Check page cards have data-apis
   const pageCard = document.querySelector('.page-card');
   console.log(pageCard.dataset.apis);
   
   // Should show JSON string, not undefined
   ```

#### Issue: Cards move off-screen
```
Cards disappear or move outside visible area
```

**Solutions:**
1. **Check zoom factor**
   ```javascript
   // In browser console
   const controller = window.diagramController;
   const zoom = controller.getPositionManager().getCurrentZoom();
   console.log('Current zoom:', zoom);
   
   // Should be reasonable value (0.1 - 5.0)
   ```

2. **Verify container dimensions**
   ```javascript
   const container = document.getElementById('diagram-container');
   console.log(container.getBoundingClientRect());
   
   // Should show valid width/height
   ```

3. **Check boundary constraints**
   ```javascript
   // In CardPositionManager.js
   // Increase padding value if cards go off-screen
   const padding = 50; // Increase from 20
   ```

---

### 🔗 Connection Issues

#### Issue: Lines not appearing
```
Hover works but no SVG lines are drawn
```

**Debugging Steps:**
1. **Check SVG element**
   ```javascript
   const svg = document.getElementById('connection-svg');
   console.log(svg); // Should exist
   console.log(svg.getBoundingClientRect()); // Should have dimensions
   ```

2. **Verify API data matching**
   ```javascript
   // Check if page APIs match server APIs
   const pageCard = document.querySelector('.page-card');
   const pageApis = JSON.parse(pageCard.dataset.apis);
   console.log('Page APIs:', pageApis);
   
   const serverCard = document.querySelector('.server-card');
   // Check if server has matching endpoints
   ```

3. **Check line creation**
   ```javascript
   // In browser console after hover
   const lines = document.querySelectorAll('.connection-line');
   console.log('Lines created:', lines.length);
   
   // Should be > 0 if connections exist
   ```

#### Issue: Lines in wrong positions
```
Lines appear but don't connect cards properly
```

**Solutions:**
1. **Check SVG coordinate system**
   ```javascript
   // Verify SVG overlay covers diagram area
   const svg = document.getElementById('connection-svg');
   const container = document.getElementById('diagram-container');
   
   console.log('SVG rect:', svg.getBoundingClientRect());
   console.log('Container rect:', container.getBoundingClientRect());
   // Should match or SVG should cover container
   ```

2. **Verify zoom calculations**
   ```javascript
   // Check if zoom affects line positioning
   // Try at different zoom levels
   ```

3. **Check element positioning timing**
   ```javascript
   // Lines might be drawn before cards finish moving
   // Increase delay in ConnectionArea.astro
   setTimeout(() => {
       clearConnections();
       drawConnectionsForCurrentState();
   }, 100); // Increase from 50
   ```

---

### 🎨 Styling Issues

#### Issue: Cards not animating smoothly
```
Jerky or laggy animations
```

**Solutions:**
1. **Check CSS transitions**
   ```css
   /* Ensure cards have proper transitions */
   .page-card, .server-card {
       transition: all 0.3s ease;
   }
   ```

2. **Optimize animations**
   ```javascript
   // Use transform instead of changing layout properties
   card.style.transform = 'translateX(100px)'; // ✅
   card.style.left = '100px'; // ❌ Triggers layout
   ```

3. **Check performance**
   ```javascript
   // Monitor frame rate in dev tools
   // Performance tab > Record during interaction
   ```

#### Issue: Z-index conflicts
```
Cards appearing in wrong layers
```

**Solutions:**
1. **Check CSS specificity**
   ```css
   /* Remove !important declarations where possible */
   .page-card.active {
       z-index: 20; /* Instead of z-index: 20 !important; */
   }
   ```

2. **Verify z-index hierarchy**
   ```javascript
   // In globals.css, ensure logical z-index values
   // Hovered: 100, Related: 50, Normal: 10, Hidden: 1
   ```

---

### 📱 Mobile Issues

#### Issue: Touch interactions not working
```
Hover effects don't work on mobile devices
```

**Solutions:**
1. **Add touch event support**
   ```javascript
   // In HoverEventManager.js
   pageCard.addEventListener('touchstart', (e) => {
       this.handleCardHover(e.target);
   });
   
   pageCard.addEventListener('touchend', (e) => {
       // Delay reset for touch
       setTimeout(() => this.resetAllCards(), 1000);
   });
   ```

2. **Adjust mobile layout**
   ```css
   @media (max-width: 768px) {
       .pages-grid, .servers-grid {
           gap: 1rem; /* Reduce gap for smaller screens */
       }
   }
   ```

#### Issue: Cards too small on mobile
```
Text unreadable or cards hard to interact with
```

**Solutions:**
1. **Adjust minimum sizes**
   ```css
   @media (max-width: 480px) {
       .page-card, .server-card {
           min-width: 280px;
           font-size: 0.9rem;
       }
   }
   ```

2. **Improve touch targets**
   ```css
   .page-card, .server-card {
       min-height: 44px; /* iOS recommended touch target */
   }
   ```

---

### ⚡ Performance Issues

#### Issue: Slow hover response
```
Lag between hover and card movement
```

**Solutions:**
1. **Optimize calculations**
   ```javascript
   // Cache expensive calculations
   const containerRect = diagramContainer.getBoundingClientRect();
   // Store and reuse instead of recalculating
   ```

2. **Reduce DOM queries**
   ```javascript
   // Cache selectors
   this.allCards = document.querySelectorAll('.page-card, .server-card');
   // Use cached version instead of querying each time
   ```

3. **Throttle events**
   ```javascript
   let isAnimating = false;
   
   function handleHover() {
       if (isAnimating) return;
       isAnimating = true;
       
       // Animation logic
       
       setTimeout(() => {
           isAnimating = false;
       }, 300);
   }
   ```

#### Issue: Memory leaks
```
Browser becomes slower over time
```

**Solutions:**
1. **Clean up event listeners**
   ```javascript
   // When component unmounts
   cards.forEach(card => {
       card.removeEventListener('mouseenter', handler);
       card.removeEventListener('mouseleave', handler);
   });
   ```

2. **Clear inline styles**
   ```javascript
   // Use removeProperty instead of setting defaults
   card.style.removeProperty('transform');
   card.style.removeProperty('opacity');
   ```

3. **Monitor memory usage**
   ```javascript
   // In dev tools > Memory tab
   // Take heap snapshots to identify leaks
   ```

---

## 🔍 Debugging Tools

### 🛠️ Browser Console Commands

```javascript
// Check diagram state
window.diagramController

// Test card relationships
const pageCard = document.querySelector('.page-card');
const related = window.diagramController
    .getRelationshipManager()
    .findRelatedCards(pageCard);
console.log('Related cards:', related);

// Check zoom level
const zoom = window.diagramController
    .getPositionManager()
    .getCurrentZoom();
console.log('Current zoom:', zoom);

// Test connection creation
const conn = window.diagramController.getConnectionManager();
const color = conn.getMethodColor('POST');
console.log('POST color:', color);

// Check card positions
document.querySelectorAll('.page-card').forEach((card, i) => {
    const rect = card.getBoundingClientRect();
    console.log(`Card ${i}:`, {x: rect.x, y: rect.y});
});
```

### 📊 Performance Monitoring

```javascript
// Monitor animation performance
performance.mark('hover-start');
// ... hover interaction ...
performance.mark('hover-end');
performance.measure('hover-duration', 'hover-start', 'hover-end');

// Check module loading times
performance.getEntriesByType('resource')
    .filter(entry => entry.name.includes('/scripts/'))
    .forEach(entry => {
        console.log(entry.name, `${entry.duration.toFixed(2)}ms`);
    });

// Memory usage
console.log('Memory:', performance.memory);
```

### 🧪 Manual Testing

```javascript
// Test specific scenarios
function testScenario(name, testFn) {
    console.group(`Testing: ${name}`);
    try {
        testFn();
        console.log('✅ Passed');
    } catch (error) {
        console.error('❌ Failed:', error);
    }
    console.groupEnd();
}

// Example tests
testScenario('Cards exist', () => {
    const pageCards = document.querySelectorAll('.page-card');
    const serverCards = document.querySelectorAll('.server-card');
    if (pageCards.length === 0) throw new Error('No page cards found');
    if (serverCards.length === 0) throw new Error('No server cards found');
});

testScenario('SVG overlay exists', () => {
    const svg = document.getElementById('connection-svg');
    if (!svg) throw new Error('SVG element not found');
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        throw new Error('SVG has no dimensions');
    }
});
```

---

## 🆘 Getting Help

### 📋 Information to Include

When reporting issues, include:

1. **Environment**
   - Browser version
   - Operating system
   - Screen resolution
   - Mobile/desktop

2. **Error details**
   - Console error messages
   - Steps to reproduce
   - Expected vs actual behavior

3. **Context**
   - What you were trying to do
   - Recent changes made
   - Data configuration used

### 🔧 Quick Fixes

**First things to try:**
1. Hard refresh browser (Ctrl+F5)
2. Clear browser cache
3. Restart development server
4. Check browser console for errors
5. Verify file paths and imports

**If still not working:**
1. Test in different browser
2. Check with minimal data configuration
3. Disable browser extensions
4. Test on different device/screen size

### 📞 Advanced Debugging

#### Network Issues
```javascript
// Check if all resources loaded
performance.getEntriesByType('resource')
    .filter(entry => entry.transferSize === 0)
    .forEach(entry => console.log('Failed to load:', entry.name));
```

#### DOM Issues
```javascript
// Check element visibility
function isVisible(element) {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

// Test all cards
document.querySelectorAll('.page-card, .server-card').forEach(card => {
    console.log('Card visible:', isVisible(card));
});
```

#### Event Issues
```javascript
// Check event listeners
function getEventListeners(element) {
    // Use Chrome DevTools Console
    // getEventListeners(element) - Chrome only
}

// Test event propagation
document.addEventListener('click', (e) => {
    console.log('Event target:', e.target);
    console.log('Event current target:', e.currentTarget);
});
```

---

*This troubleshooting guide covers the most common issues. For complex problems, use the debugging tools and browser dev tools for deeper investigation.*