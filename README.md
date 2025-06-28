# 📊 Application Architecture Diagram

## 🎯 Project Overview

This TypeScript-powered Astro application creates interactive architecture diagrams showing relationships between frontend pages and backend API servers. Features include advanced card interactions, zoom/pan capabilities, dynamic SVG connections, and real-time relationship visualization based on configurable API mappings.

## 🚀 Quick Start

```bash
# ติดตั้ง dependencies
npm install

# เริ่ม development server
npm run dev

# Build สำหรับ production
npm run build

# Preview production build
npm run preview
```

## 🌟 Key Features

- **📱 Interactive Cards** - Hover to see relationships and strategic card movement
- **🔗 Dynamic SVG Connections** - Visual API relationship lines with method-specific colors
- **🎯 Smart Positioning** - Cards move strategically while dimming unrelated elements
- **🔍 Zoom & Pan** - Mouse/touch controls with focal point preservation and keyboard shortcuts
- **📊 Configuration-Driven** - Relationships defined through JSON data files
- **🎨 Smooth Animations** - Hardware-accelerated CSS transforms and transitions
- **📱 Mobile Responsive** - Touch gestures and adaptive layouts
- **🎯 TypeScript** - Type-safe development with comprehensive interfaces
- **🧪 Tested** - Comprehensive test suite with Vitest

## 🏗️ Project Structure

```
app-diagram/
├── 📁 src/
│   ├── 📁 components/           # Astro components (ArchitectureDiagram, Cards, etc.)
│   ├── 📁 data/                # JSON configuration (pages.json, servers.json)
│   ├── 📁 layouts/             # Page layout templates
│   ├── 📁 pages/               # Astro route pages
│   ├── 📁 scripts/             # TypeScript modules (compiled to public/)
│   │   ├── 📁 components/       # Component-specific logic
│   │   └── 📁 shared/          # Shared utilities and managers
│   ├── 📁 styles/              # Modular CSS architecture
│   │   ├── base.css            # Global styles and Tailwind
│   │   ├── animations.css      # Animation definitions
│   │   ├── cards.css          # Card component styles
│   │   ├── components.css     # Reusable component styles
│   │   ├── connections.css    # SVG connection styles
│   │   └── layout.css         # Layout and responsive utilities
│   └── 📁 types/               # TypeScript type definitions
├── 📁 public/                   # Static assets and compiled scripts
├── 📁 tests/                   # Vitest test suite
├── 📁 docs/                    # Comprehensive documentation
└── 📄 Configuration files      # TypeScript, Astro, Tailwind configs
```

## 📚 Documentation

### 📖 Complete Guides
- **🚀 [Setup Guide](./docs/SETUP.md)** - Installation, configuration, and development setup
- **🏛️ [Architecture](./docs/ARCHITECTURE.md)** - Technical architecture and design patterns
- **🔧 [API Reference](./docs/API_REFERENCE.md)** - TypeScript modules and API documentation
- **🛠️ [Development](./docs/DEVELOPMENT.md)** - Development workflow and best practices
- **🔧 [Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and debugging guide

### 🎯 Quick Navigation
- **New to the project?** Start with [Setup Guide](./docs/SETUP.md)
- **Need to debug?** Check [Troubleshooting](./docs/TROUBLESHOOTING.md)
- **Understanding the code?** Read [Architecture](./docs/ARCHITECTURE.md)
- **Building features?** Follow [Development](./docs/DEVELOPMENT.md)
- **API integration?** Use [API Reference](./docs/API_REFERENCE.md)

## 🔧 Technical Stack

- **⚡ Astro 4.x** - Modern static site generator with component islands
- **🔄 TypeScript** - Full type safety with comprehensive interfaces and ES Modules
- **🎨 Tailwind CSS** - Utility-first CSS framework with modular architecture
- **📱 Responsive Design** - Mobile-first with touch gesture support
- **🎯 SVG Graphics** - Vector-based connection lines and interactive elements
- **🧪 Vitest** - Modern testing framework with comprehensive coverage
- **📊 JSON Configuration** - Data-driven relationships and content

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the [Development Guide](./docs/DEVELOPMENT.md)
4. Test thoroughly
5. Update documentation if needed
6. Submit Pull Request

## 🔍 Deep Function Logic Documentation

### 🏗️ Architecture Overview

The application follows a modular TypeScript architecture with six core managers working together through dependency injection and event coordination.

#### 🎯 Core Manager Classes

##### 1. **ConnectionManager** - SVG Creation and Styling Engine

###### `createConnectionLine()` - Advanced SVG Line Creation Algorithm
```typescript
createConnectionLine(fromElement, toElement, color, method): SVGElement | null
```

**Algorithm Steps:**
1. **Duplicate Prevention**: Uses `Set<string>` to track drawn connections with unique IDs
2. **Position Calculation**: Converts DOM element positions to SVG coordinate system
   ```typescript
   centerX = rect.left + rect.width/2 - svgRect.left
   centerY = rect.top + rect.height/2 - svgRect.top
   ```
3. **Smart Connection Points**: 
   - Page→Server: Right edge to left edge connections
   - Server→Backend: Right edge to left edge connections
   - Fallback: Center-to-center for other cases
4. **SVG Element Creation**: Creates `<line>` elements with method-specific styling

**Key Logic**: Uses card type detection to determine optimal connection endpoints for visual clarity.

###### `getMethodColor()` & `getMethodDashPattern()` - HTTP Method Styling
- **GET**: `#10b981` (green), solid line
- **POST**: `#3b82f6` (blue), `5,5` dash pattern
- **PUT**: `#f59e0b` (orange), `10,5` dash pattern  
- **DELETE**: `#ef4444` (red), `15,10,5,10` complex pattern
- **PATCH**: `#8b5cf6` (purple), `8,3,3,3` dot-dash pattern

**Mathematical Logic**: Dash patterns use pixel values for `stroke-dasharray` to create visual differentiation.

##### 2. **CardRelationshipManager** - Relationship Detection Engine

###### `findRelatedCards()` - Master Relationship Detection
Uses **Strategy Pattern** with card-type-specific logic:

**Page-Centric Logic** (`_findRelatedCardsForPage()`):
```typescript
// Extract server IDs from API strings (format: "serverId:apiPath")
pageApis.forEach(api => {
    const [serverId] = api.split(':');
    relatedServerIds.add(serverId);
});
```

**Algorithm**: 
1. Parse JSON API data from `dataset.apis`
2. Extract server IDs using string splitting
3. Find matching server cards by `dataset.server` attributes
4. Discover backends via `dataset.backend` associations
5. Match specific API items using text content comparison

**Key Design Decision**: Does NOT include other pages to prevent cascading relationships.

**Server-Centric Logic** (`_findRelatedCardsForServer()`):
```typescript
// Reverse lookup: find pages that reference this server
const usesThisServer = pageApis.some(api => {
    const [serverId] = api.split(':');
    return serverId === hoveredServerId;
});
```

**Algorithm**: Works backward from server to find dependent pages, plus associated backend.

**Backend-Centric Logic** (`_findRelatedCardsForBackend()`):
**Multi-hop Algorithm**:
1. Find servers using this backend: `serverBackend === hoveredBackendId`
2. Find pages connecting to those servers (transitive relationship)
3. Creates 2-hop relationships: Backend → Servers → Pages

###### `getUniqueRelationPairs()` - Connection Pair Generation
**Deduplication Strategy**: Uses `Set<string>` with unique pair keys to prevent duplicate lines.

**Complex Logic for Page Connections**:
```typescript
// 1. API-Level Connections: Page API items to Server API items
pageApis.forEach(api => {
    const [serverId, apiPath] = api.split(':');
    const method = apiPath.trim().split(' ')[0] as HttpMethod;
    // Find matching page and server API elements...
});

// 2. Server-Backend Connections: One per unique server
uniqueServerIds.forEach(serverId => {
    // Create server-to-backend connection...
});
```

**Innovation**: Handles both granular API-level connections AND card-level backend connections in one algorithm.

##### 3. **CardAnimationManager** - Strategic Animation Engine

###### `repositionRelatedCards()` - Master Animation Orchestration
**Complex Algorithm**:
1. **Card Categorization**: Separates related and unrelated cards
2. **Strategic Positioning**: Calls `_calculateReplacementPositions()` for optimal placement
3. **Animation Application**: Different effects for hovered, related, and unrelated cards
4. **Connection Redrawing**: 50ms delay ensures DOM updates complete before SVG drawing

###### `_calculateReplacementPositions()` - Business Logic Integration
**Sophisticated Algorithm**:
```typescript
// Priority sorting with business logic
const relatedCards = [...relatedElements.servers].sort((a, b) => {
    const aId = a.dataset.server || '';
    const bId = b.dataset.server || '';
    
    if (aId === 'auth-server') return -1;  // Highest priority
    if (bId === 'auth-server') return 1;
    if (aId === 'payment-server') return -1;  // Second priority
    return 0;
});
```

**Strategic Targeting**: Uses domain knowledge for optimal UX:
```typescript
if (relatedCardId === 'auth-server') {
    // Auth-server targets user-server (conceptually related)
    targetUnrelated = unrelatedCards.find(card => 
        card.dataset.server === 'user-server') || fallback;
}
```

**Mathematical Positioning**: Calculates target positions using geometric center points relative to container coordinates.

###### `_animateRelatedCardToReplacement()` - Transform Mathematics
**Precise Animation Steps**:
1. **Current Position**: `currentX = cardRect.left + cardRect.width/2 - containerRect.left`
2. **Movement Vector**: `moveX = targetPosition.x - currentX`
3. **CSS Transform**: `transform: translate(${moveX}px, ${moveY}px) scale(1.05)`
4. **Forced Reflow**: `card.offsetHeight` triggers layout before transition

**Performance Technique**: Remove transition → Apply transform → Force reflow → Add transition back.

##### 4. **HoverEventManager** - Event Coordination Engine

###### `handleCardHover()` - State Management Algorithm
**Processing Prevention**: Uses `isProcessing` flag to prevent concurrent operations.

**Coordination Flow**:
1. Cancel pending resets
2. Clear existing connections  
3. Find relationships
4. Set visual classes
5. Coordinate animations with Promises
6. Draw new connections after animation

**Async Coordination**:
```typescript
this.animationManager.repositionRelatedCards(card, relatedElements).then(() => {
    setTimeout(() => {
        this.drawConnections(card, relatedElements);
        this.isProcessing = false;
    }, 50);
});
```

###### `handleCardLeave()` - Smart Leave Detection
**Mouse Tracking Logic**:
```typescript
const relatedTarget = e.relatedTarget as HTMLElement | null;

if (relatedTarget && (
    relatedTarget.closest('.page-card') || 
    relatedTarget.closest('.server-card') ||
    relatedTarget.closest('.backend-card')
)) {
    return; // Don't reset if moving to another card
}
```

**UX Optimization**: Only triggers reset when truly leaving the card system, preventing flicker.

##### 5. **CardPositionManager** - Mathematical Positioning Engine

###### `calculateDistance()` - Euclidean Distance Algorithm
**Mathematical Formula**:
```typescript
return Math.sqrt(
    Math.pow(centerX1 - centerX2, 2) + 
    Math.pow(centerY1 - centerY2, 2)
);
```

**Coordinate System**: Calculates relative to diagram container using geometric centers.

###### `getProgressiveMoveRatio()` - Dynamic Movement Scaling
**Zoom-Aware Algorithm**:
```typescript
const scaledDistance = distance * zoom;

if (isTargetingUnrelated) {
    if (scaledDistance > 400) return 0.9;  // Large movement for far cards
    if (scaledDistance > 250) return 0.8;
    if (scaledDistance > 150) return 0.7;
    return 0.6;  // Minimum movement
}
```

**UX Logic**: Larger movements for unrelated cards, subtler for related cards. Compensates for zoom level.

###### `constrainToBounds()` - Boundary Mathematics
**Boundary Calculation**:
```typescript
const minX = cardWidth / 2 + padding;
const maxX = containerRect.width - cardWidth / 2 - padding;
const minY = cardHeight / 2 + padding;
const maxY = containerRect.height - cardHeight / 2 - padding;
```

**Design**: Uses card center points with 20px padding buffer around container edges.

##### 6. **DiagramController** - Orchestration Pattern

###### `initialize()` - Staged Initialization
**Sequential Algorithm**:
1. **DOM Readiness**: `waitForElements()` polls for required elements
2. **Manager Initialization**: Initializes in dependency order
3. **Error Handling**: Returns false if any manager fails
4. **State Setup**: Prepares initial card visibility

###### `waitForElements()` - DOM Polling Logic
**Recursive Algorithm**:
```typescript
const checkElements = () => {
    const pageCards = document.querySelectorAll('.page-card');
    const serverCards = document.querySelectorAll('.server-card');
    const connectionSvg = document.getElementById('connection-svg');
    
    if (pageCards.length > 0 && serverCards.length > 0 && connectionSvg) {
        resolve();
    } else {
        setTimeout(checkElements, 100);
    }
};
```

**Pattern**: 100ms interval polling until all critical DOM elements exist.

### 🎯 Key Architectural Patterns

1. **Manager Pattern**: Each class has single responsibility with clean interfaces
2. **Strategy Pattern**: Card-type-specific relationship logic
3. **Dependency Injection**: Shared manager references prevent tight coupling
4. **Promise-Based Async**: Coordinates animations and state changes
5. **Event-Driven Architecture**: Loose coupling through DOM events
6. **Mathematical Precision**: Extensive geometric calculations for positioning
7. **Performance Optimization**: Uses Sets for O(1) lookups, caching for expensive calculations
8. **Defensive Programming**: Multiple error handling and null safety layers

### 🔧 Performance Considerations

- **DOM Query Caching**: Managers cache DOM queries in constructors
- **Set-Based Deduplication**: O(1) lookup for connection uniqueness
- **Hardware Acceleration**: CSS transforms use GPU acceleration
- **Debounced Operations**: Timeouts prevent excessive state changes
- **Zoom Awareness**: All calculations account for current zoom level
- **Forced Reflows**: Strategic DOM reflow management for smooth animations

### 🧠 Business Logic Integration

The system incorporates domain knowledge for better UX:
- **Auth Server Priority**: Authentication components get highest movement priority
- **Payment Server Targeting**: Payment flows target related business components
- **API Method Semantics**: Visual styling reflects HTTP method semantics (GET=safe/green, DELETE=dangerous/red)
- **Connection Directionality**: Page→Server→Backend flow reflects real architecture patterns

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

### Getting Help
1. Check the [troubleshooting guide](./docs/TROUBLESHOOTING.md)
2. Review the [API reference](./docs/API_REFERENCE.md)  
3. Use browser dev tools for debugging
4. Examine function logic documentation above for deep understanding

---

*Built with ❤️ using Astro, TypeScript, and modern web technologies.*