# 🛠️ Development Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Modern code editor (VS Code recommended)
- Git for version control

### Initial Setup
```bash
# Clone and install
git clone <repository-url>
cd app-diagram
npm install

# Start development
npm run dev
```

## 🏗️ Development Workflow

### 1. Project Structure Understanding

```
app-diagram/
├── src/                    # Astro source files
│   ├── components/         # Reusable Astro components
│   ├── data/              # JSON configuration files
│   ├── layouts/           # Page layout templates
│   ├── pages/             # Route pages
│   ├── scripts/           # Client-side TypeScript modules
│   ├── styles/            # Global CSS files
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
├── tests/                 # Test files
└── docs/                  # Documentation
```

### 2. Development Commands

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run astro check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Lint and format (if configured)
npm run lint
npm run format
```

## 📝 Coding Standards

### TypeScript Guidelines

#### Module Structure
```typescript
// File: /src/scripts/shared/ExampleManager.ts

import type { 
    ManagerInitialization, 
    ExampleOptions 
} from '../../types/index.js';

/**
 * Brief description of the module's purpose
 */
export class ExampleManager implements ManagerInitialization {
    private dependency: any;
    private initialized: boolean = false;

    constructor(dependencies: any) {
        this.dependency = dependencies;
        this.initialized = false;
    }

    /**
     * Initialize the manager
     * @returns Success status
     */
    initialize(): boolean {
        // Implementation
        this.initialized = true;
        return true;
    }

    /**
     * Public method with clear documentation
     * @param element - Target element
     * @param options - Configuration options
     */
    async processElement(element: HTMLElement, options: ExampleOptions = {}): Promise<void> {
        if (!this.initialized) {
            throw new Error('Manager not initialized');
        }
        // Implementation
    }

    /**
     * Private method
     */
    private internalHelper(): void {
        // Implementation
    }
}
```

#### Variable Naming
```javascript
// ✅ Good naming
const diagramContainer = document.getElementById('diagram-container');
const relatedCards = findRelatedCards(hoveredCard);
const isAnimationComplete = checkAnimationStatus();

// ❌ Poor naming
const dc = document.getElementById('diagram-container');
const cards = findRelatedCards(hoveredCard);
const flag = checkAnimationStatus();
```

#### Function Documentation
```javascript
/**
 * Calculates movement ratio based on distance and relationship
 * @param {number} distance - Distance in pixels between elements
 * @param {boolean} isTargetingUnrelated - Whether target is unrelated
 * @returns {number} Movement ratio between 0.0 and 1.0
 * @example
 * const ratio = getProgressiveMoveRatio(250, false);
 * // Returns: 0.7
 */
getProgressiveMoveRatio(distance, isTargetingUnrelated = false) {
    // Implementation
}
```

### Astro Component Guidelines

#### Component Structure
```astro
---
// Component script (server-side)
interface Props {
    data: any;
    className?: string;
}

const { data, className = '' } = Astro.props;
---

<!-- Component template -->
<div class={`base-class ${className}`} data-component="example">
    <h2>{data.title}</h2>
    <p>{data.description}</p>
</div>

<!-- Component styles (scoped) -->
<style>
    .base-class {
        /* Styles here are scoped to this component */
    }
</style>

<!-- Component script (client-side) -->
<script>
    // Client-side functionality if needed
    console.log('Component loaded');
</script>
```

#### Data Passing
```astro
---
// Pass data from server to client via data attributes
const apiData = JSON.stringify(pageData.apis);
---

<div 
    class="page-card"
    data-apis={apiData}
    data-page-id={pageData.id}
>
    <!-- Card content -->
</div>
```

### CSS/Styling Guidelines

#### Tailwind + Custom CSS Pattern
```css
/* src/styles/globals.css */

/* Custom properties for consistency */
:root {
    --animation-duration: 0.4s;
    --hover-scale: 1.05;
    --border-radius: 8px;
}

/* Component base styles */
.page-card {
    /* Use Tailwind utilities for layout */
    @apply bg-white shadow-lg rounded-lg p-4 cursor-pointer;
    
    /* Custom properties for animations */
    transition: all var(--animation-duration) ease;
}

/* State-based styles */
.page-card.active {
    @apply shadow-xl;
    transform: scale(var(--hover-scale));
    z-index: 100;
}

.page-card.highlighted {
    @apply ring-2 ring-blue-500;
    z-index: 50;
}

.page-card.dimmed {
    opacity: 0.3;
    z-index: 1;
}
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

#### Core Functionality
- [ ] Cards render with correct data
- [ ] Hover triggers card movement
- [ ] Related cards move to strategic positions
- [ ] Unrelated cards dim and move away
- [ ] SVG connections draw correctly
- [ ] Reset works properly on mouse leave

#### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Responsive Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

#### Performance Testing
- [ ] Smooth animations (60fps)
- [ ] No memory leaks
- [ ] Fast module loading
- [ ] Efficient DOM queries

### Testing Tools

#### Browser Console Testing
```javascript
// Test card relationships
const pageCard = document.querySelector('.page-card');
const related = window.diagramController
    .getRelationshipManager()
    .findRelatedCards(pageCard);
console.log('Related elements:', related);

// Test animations
const animationManager = window.diagramController.getAnimationManager();
await animationManager.repositionRelatedCards(pageCard, related);

// Test position calculations
const positionManager = window.diagramController.getPositionManager();
const distance = positionManager.calculateDistance(card1, card2);
console.log('Distance:', distance);
```

#### Performance Monitoring
```javascript
// Monitor frame rate
const fpsMeter = {
    startTime: performance.now(),
    frameCount: 0,
    
    tick() {
        this.frameCount++;
        const elapsed = performance.now() - this.startTime;
        if (elapsed >= 1000) {
            console.log('FPS:', Math.round(this.frameCount * 1000 / elapsed));
            this.frameCount = 0;
            this.startTime = performance.now();
        }
        requestAnimationFrame(() => this.tick());
    }
};

fpsMeter.tick();
```

## 🔧 Adding New Features

### 1. Planning Phase

#### Feature Assessment
- Define the feature requirements
- Identify affected components
- Plan data structure changes
- Consider performance impact

#### Architecture Review
- Review [Architecture Documentation](./ARCHITECTURE.md)
- Identify integration points
- Plan module interactions
- Consider extensibility

### 2. Implementation Phase

#### Module Creation
```typescript
// 1. Create new module in appropriate directory
// /src/scripts/shared/NewFeatureManager.ts

export class NewFeatureManager {
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.initialized = false;
    }

    initialize() {
        // Setup logic
        return true;
    }

    // Feature methods
}
```

#### Integration
```typescript
// 2. Integrate with DiagramController
// /src/scripts/components/connection-area/DiagramController.ts

import { NewFeatureManager } from '../../shared/NewFeatureManager.js';

class DiagramController {
    constructor() {
        // ... existing managers
        this.newFeatureManager = new NewFeatureManager(this.dependencies);
    }

    async initialize() {
        // ... existing initialization
        const newFeatureSuccess = this.newFeatureManager.initialize();
        return /* ... */ && newFeatureSuccess;
    }

    // Getter for external access
    getNewFeatureManager() {
        return this.newFeatureManager;
    }
}
```

#### Component Updates
```astro
<!-- 3. Update relevant Astro components if needed -->
<!-- src/components/ExampleCard.astro -->

---
const { data, newFeatureData } = Astro.props;
---

<div 
    class="example-card"
    data-feature={JSON.stringify(newFeatureData)}
>
    <!-- Component content -->
</div>
```

### 3. Testing Phase

#### Unit Testing
```javascript
// Test the new feature in isolation
const manager = new NewFeatureManager({});
const success = manager.initialize();
console.assert(success, 'Manager should initialize successfully');
```

#### Integration Testing
```javascript
// Test with existing system
const controller = window.diagramController;
const newManager = controller.getNewFeatureManager();
// Test feature interactions
```

### 4. Documentation Phase

#### Update Documentation
- Add feature to README.md
- Update API_REFERENCE.md with new methods
- Add troubleshooting entries if needed
- Update ARCHITECTURE.md if patterns change

## 🔄 Best Practices

### Performance Optimization

#### DOM Queries
```javascript
// ❌ Poor - Query every time
function processCards() {
    const cards = document.querySelectorAll('.page-card');
    // Process cards
}

// ✅ Good - Cache queries
class CardManager {
    initialize() {
        this.cards = document.querySelectorAll('.page-card');
    }
    
    processCards() {
        // Use this.cards
    }
}
```

#### Animation Optimization
```javascript
// ❌ Poor - Layout-triggering properties
card.style.left = '100px';
card.style.top = '50px';

// ✅ Good - Transform properties
card.style.transform = 'translate(100px, 50px)';
```

#### Event Handling
```javascript
// ❌ Poor - Individual listeners
cards.forEach(card => {
    card.addEventListener('click', handleClick);
});

// ✅ Good - Event delegation
container.addEventListener('click', (e) => {
    if (e.target.classList.contains('card')) {
        handleClick(e);
    }
});
```

### Error Handling

#### Graceful Degradation
```javascript
class FeatureManager {
    initialize() {
        try {
            this.setupFeature();
            return true;
        } catch (error) {
            console.warn('Feature initialization failed:', error);
            this.fallbackMode = true;
            return false;
        }
    }

    processAction() {
        if (this.fallbackMode) {
            return this.basicFallback();
        }
        return this.fullFeature();
    }
}
```

#### User-Friendly Errors
```javascript
// ❌ Poor - Technical error
throw new Error('Cannot read property "apis" of undefined');

// ✅ Good - User-friendly error
if (!cardData || !cardData.apis) {
    console.error('Card data missing or invalid format. Please check JSON configuration.');
    return null;
}
```

### Code Organization

#### File Naming
```
// ✅ Good naming conventions
ConnectionManager.js          // PascalCase for classes
card-utils.js                // kebab-case for utilities
API_REFERENCE.md             // UPPER_CASE for documentation
```

#### Import Organization
```typescript
// 1. External imports first (if any)
// import { external } from 'external-lib';

// 2. Type imports
import type { ManagerConfig } from '../types/index.js';

// 3. Internal imports
import { ConnectionManager } from '../shared/ConnectionManager.js';
import { CardUtils } from '../utils/card-utils.js';

// 3. Blank line before main code
export class ExampleManager {
    // Implementation
}
```

## 🚀 Deployment

### Build Process

#### Production Build
```bash
# Clean previous build
rm -rf dist/

# Build for production
npm run build

# Verify build
ls -la dist/
du -sh dist/
```

#### Build Verification
```bash
# Check for common issues
grep -r "localhost" dist/ # Should be empty
grep -r "console.log" dist/ # Check for debug logs
find dist/ -name "*.map" # Source maps (should be excluded)
```

### Performance Optimization

#### Asset Optimization
- Minified JavaScript and CSS
- Optimized images
- Proper caching headers
- Gzip compression

#### Runtime Performance
- Lazy loading modules
- Efficient DOM queries
- Optimized animations
- Memory leak prevention

## 📚 Resources

### Internal Documentation
- [Setup Guide](./SETUP.md) - Initial setup and configuration
- [Architecture](./ARCHITECTURE.md) - System design and patterns
- [API Reference](./API_REFERENCE.md) - Module APIs and methods
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

### External Resources
- [Astro Documentation](https://docs.astro.build/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [ES Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

### Development Tools
- **VS Code Extensions:** Astro, Tailwind CSS IntelliSense
- **Browser Tools:** Dev Tools, Performance tab, Memory tab
- **Debugging:** Console commands, Performance monitoring

---

*This development guide provides the foundation for contributing to the project. Follow these guidelines to maintain code quality and consistency.*