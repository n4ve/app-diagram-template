# 🏛️ Architecture Documentation

## 🎯 System Overview

The Application Architecture Diagram is a sophisticated interactive visualization system built with Astro, designed to show relationships between frontend pages and backend API servers through dynamic card interactions and connection visualization.

## 🔧 Technical Stack

### Core Technologies
- **⚡ Astro 4.x** - Static site generator with component islands
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **🔄 TypeScript** - Type-safe development with ES Modules
- **🖼️ SVG** - Vector graphics for connections
- **📊 JSON** - Configuration-driven data

### Browser Requirements
- **ES Modules support** (Chrome 61+, Firefox 60+, Safari 10.1+)
- **CSS Grid & Flexbox** support
- **SVG 2.0** features
- **TypeScript** and modern JavaScript features

## 🏗️ Architectural Patterns

### 🧩 Component-Based Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Astro Framework                          │
├─────────────────────────────────────────────────────────────┤
│  📄 Layout.astro (Base Template)                           │
│  ├── 🎯 ArchitectureDiagram.astro (Container + Zoom/Pan)    │
│  │   ├── 📱 PageCard.astro (Frontend Pages)               │
│  │   ├── 🖥️ ServerCard.astro (Backend Servers)            │
│  │   └── 🔗 ConnectionArea.astro (Interaction Controller)  │
│  └── 📊 Header.astro (Navigation)                          │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 Module System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                TypeScript Module Layer                      │
├─────────────────────────────────────────────────────────────┤
│  🎮 DiagramController (Main Orchestrator)                  │
│  ├── 🔗 ConnectionManager (SVG Lines)                      │
│  ├── 👥 CardRelationshipManager (API Mapping)             │
│  ├── 📐 CardPositionManager (Calculations)                │
│  ├── 🎬 CardAnimationManager (Movements)                  │
│  └── 🎯 HoverEventManager (Events)                        │
└─────────────────────────────────────────────────────────────┘
```

### 📊 Data Flow Architecture

```
JSON Config → Astro Build → DOM → TypeScript → User Interaction → Visual Updates

1. pages.json/servers.json → Static data
2. Astro components → Server-side rendering  
3. Browser DOM → Client-side hydration
4. ES Modules → Dynamic behavior
5. User events → Interactive responses
6. CSS/SVG → Visual feedback
```

## 🔗 Component Relationships

### 🎯 ArchitectureDiagram.astro
**Role:** Main container and layout manager

**Responsibilities:**
- Zoom/pan functionality
- SVG overlay positioning
- Global layout structure
- Responsive grid system

**Dependencies:**
- `PageCard.astro` components
- `ServerCard.astro` components  
- `ConnectionArea.astro` controller
- CSS: `connection-area.css`

### 🔗 ConnectionArea.astro
**Role:** Interaction controller and JavaScript loader

**Responsibilities:**
- Load JavaScript modules
- Initialize diagram controller
- Provide error handling
- Coordinate all interactions

**Dependencies:**
- `DiagramController.ts` module
- All shared TypeScript modules
- DOM elements from other components

### 📱 PageCard.astro / 🖥️ ServerCard.astro
**Role:** Data presentation components

**Responsibilities:**
- Render card content from JSON
- Provide data attributes for JavaScript
- Display API information
- Handle responsive layout

**Dependencies:**
- `pages.json` / `servers.json` data
- CSS: `globals.css` styles
- Tailwind utility classes

## 🔧 JavaScript Module Architecture

### 🎮 DiagramController (Orchestrator Pattern)

```javascript
class DiagramController {
    constructor() {
        this.connectionManager = new ConnectionManager();
        this.relationshipManager = new CardRelationshipManager();
        this.positionManager = new CardPositionManager();
        this.animationManager = new CardAnimationManager(/*deps*/);
        this.hoverEventManager = new HoverEventManager(/*deps*/);
    }
}
```

**Pattern:** Facade + Coordinator
- **Facade:** Single entry point for external access
- **Coordinator:** Manages dependencies between modules
- **Lifecycle:** Controls initialization order

### 🔗 ConnectionManager (Strategy Pattern)

```javascript
class ConnectionManager {
    getMethodColor(method) { /* Strategy for colors */ }
    getMethodDashPattern(method) { /* Strategy for patterns */ }
    createConnectionLine() { /* Template method */ }
}
```

**Pattern:** Strategy + Template Method
- **Strategy:** Different styling per HTTP method
- **Template Method:** Consistent line creation process
- **State Management:** Tracks drawn connections

### 👥 CardRelationshipManager (Observer + Factory)

```javascript
class CardRelationshipManager {
    findRelatedCards(hoveredCard) {
        if (hoveredCard.classList.contains('page-card')) {
            return this._findRelatedCardsForPage(hoveredCard);
        } else if (hoveredCard.classList.contains('server-card')) {
            return this._findRelatedCardsForServer(hoveredCard);
        }
    }
}
```

**Pattern:** Factory Method + Chain of Responsibility
- **Factory:** Different logic per card type
- **Chain:** Cascading relationship discovery
- **Data Driven:** JSON configuration based

### 📐 CardPositionManager (Calculator + Validator)

```javascript
class CardPositionManager {
    calculateMovement() { /* Pure calculation */ }
    constrainToBounds() { /* Boundary validation */ }
    getProgressiveMoveRatio() { /* Scaling logic */ }
}
```

**Pattern:** Pure Functions + Validation
- **Pure Functions:** Predictable calculations
- **Validation:** Boundary constraint checking
- **Scaling:** Zoom-aware computations

### 🎬 CardAnimationManager (Command Pattern)

```javascript
class CardAnimationManager {
    repositionRelatedCards(hoveredCard, relatedElements) {
        // Commands for different card types
        if (card === hoveredCard) this._animateHoveredCard(card);
        else if (related) this._animateRelatedCard(card);
        else this._animateUnrelatedCard(card);
    }
}
```

**Pattern:** Command + State Machine
- **Command:** Discrete animation operations
- **State Machine:** Different states per card
- **Async:** Promise-based coordination

### 🎯 HoverEventManager (Mediator Pattern)

```javascript
class HoverEventManager {
    handleCardHover(card) {
        // Mediates between all systems
        const related = this.relationshipManager.findRelatedCards(card);
        this.animationManager.repositionRelatedCards(card, related);
        this.connectionManager.drawConnections();
    }
}
```

**Pattern:** Mediator + Event Handler
- **Mediator:** Coordinates between modules
- **Event Handler:** DOM event to system event mapping
- **Cleanup:** Resource management

## 📊 Data Architecture

### 🔄 Data Flow Patterns

#### Configuration Loading
```
pages.json → Astro.props → PageCard → data-apis attribute → JavaScript
servers.json → Astro.props → ServerCard → data-server attribute → JavaScript
```

#### Relationship Resolution
```
User Hover → CardRelationshipManager → JSON parsing → API matching → Related cards
```

#### Animation Pipeline
```
Related cards → CardPositionManager → Movement calculations → CardAnimationManager → CSS transforms
```

#### Connection Drawing
```
Active cards → ConnectionManager → SVG creation → DOM insertion → Visual lines
```

### 🗄️ State Management

#### Global State
- **Diagram Controller** - Master state holder
- **Window object** - Debug access (`window.diagramController`)
- **DOM attributes** - Persistent card state

#### Local State
- **Connection tracking** - Drawn line registry
- **Animation state** - Current transformation values
- **Event state** - Timeout and listener management

#### Derived State
- **Related cards** - Computed from JSON data
- **Movement vectors** - Calculated from positions
- **SVG coordinates** - Derived from DOM positions

## 🎨 CSS Architecture

### 🏗️ Styling Strategy

#### Utility-First (Tailwind)
```css
/* Component structure and layout */
.flex .flex-col .items-center .justify-center
.grid .grid-cols-1 .gap-4
.bg-white .shadow-lg .rounded-lg
```

#### Component-Specific (Custom CSS)
```css
/* Interactive behaviors and animations */
.page-card.active { /* State-based styling */ }
.connection-line { /* SVG-specific styles */ }
```

#### Responsive Design
```css
/* Mobile-first breakpoints */
@media (max-width: 768px) { /* Tablet */ }
@media (max-width: 480px) { /* Mobile */ }
```

### 🎭 Animation Strategy

#### CSS Transitions
```css
/* Smooth property changes */
transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

#### Transform-Based Movement
```css
/* Hardware-accelerated animations */
transform: translate(100px, 50px) scale(1.05);
```

#### State-Based Styling
```css
/* Different styles per interaction state */
.page-card { /* Default */ }
.page-card.active { /* Hovered */ }
.page-card.highlighted { /* Related */ }
```

## 🔧 Integration Patterns

### 🌉 Astro-JavaScript Bridge

#### Data Passing
```astro
---
// Server-side data preparation
const pageData = pages[pageId];
const apiData = JSON.stringify(pageData.apis);
---

<!-- Client-side data consumption -->
<div data-apis={apiData}>
  <!-- JavaScript reads from data-apis -->
</div>
```

#### Module Loading
```astro
<script type="module">
  // Dynamic ES module loading
  const { DiagramController } = await import('/scripts/components/connection-area/DiagramController.js');
</script>
```

### 🔗 Cross-Module Communication

#### Dependency Injection
```javascript
// Constructor injection for loose coupling
class CardAnimationManager {
    constructor(positionManager, connectionManager) {
        this.positionManager = positionManager;
        this.connectionManager = connectionManager;
    }
}
```

#### Event-Based Communication
```javascript
// Promise-based coordination
repositionRelatedCards().then(() => {
    // Redraw connections after movement
    this.connectionManager.drawConnections();
});
```

#### Shared State Access
```javascript
// Controller provides access to all managers
const controller = window.diagramController;
const relationshipManager = controller.getRelationshipManager();
```

## 🚀 Performance Architecture

### ⚡ Optimization Strategies

#### Lazy Loading
```javascript
// Dynamic module imports only when needed
async function loadDiagramModules() {
    const { DiagramController } = await import('/scripts/components/connection-area/DiagramController.js');
}
```

#### DOM Query Caching
```javascript
// Cache expensive DOM queries
this.pageCards = document.querySelectorAll('.page-card');
this.serverCards = document.querySelectorAll('.server-card');
```

#### Animation Optimization
```javascript
// Use transforms instead of layout changes
card.style.transform = 'translateX(100px)'; // ✅ Composite layer
card.style.left = '100px'; // ❌ Layout recalculation
```

#### Memory Management
```javascript
// Clean up resources
clearConnections() {
    this.connectionSvg.innerHTML = '';
    this.drawnConnections.clear();
}
```

### 📊 Performance Metrics

#### Target Metrics
- **Module load time:** < 100ms
- **Hover response time:** < 16ms (60fps)
- **Animation frame rate:** 60fps
- **Memory growth:** Zero leaks

#### Monitoring Points
- **Network:** Module loading times
- **Runtime:** Animation performance
- **Memory:** Heap snapshots
- **User Experience:** Interaction latency

## 🔮 Extensibility Design

### 🧩 Plugin Architecture (Future)

```javascript
// Extensible diagram system
class DiagramController {
    registerPlugin(plugin) {
        plugin.initialize(this);
        this.plugins.push(plugin);
    }
}

// Example plugin
class ExportPlugin {
    initialize(controller) {
        this.controller = controller;
    }
    
    exportAsPNG() {
        // Export functionality
    }
}
```

### 🔌 Hook System (Future)

```javascript
// Event hooks for customization
class HoverEventManager {
    handleCardHover(card) {
        this.emit('before-hover', card);
        // Main logic
        this.emit('after-hover', card);
    }
}
```

### 📦 Module Versioning

```javascript
// Semantic versioning for modules
export const version = '1.2.0';
export class ConnectionManager {
    static get version() { return '1.2.0'; }
}
```

---

*This architecture documentation reflects the current system design. Update when making structural changes to maintain accuracy.*