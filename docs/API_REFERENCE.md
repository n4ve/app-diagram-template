# 🔧 API Reference Documentation

## 📖 Overview

This document provides comprehensive API documentation for all JavaScript modules in the Application Architecture Diagram system. All modules use ES6+ syntax and are designed for modern browser environments.

## 🎮 DiagramController

**Location:** `/public/scripts/components/connection-area/DiagramController.js`

**Purpose:** Main orchestrator that coordinates all diagram functionality.

### Constructor

```javascript
const controller = new DiagramController();
```

### Methods

#### `async initialize()`
Initializes all managers and sets up the diagram system.

**Returns:** `Promise<boolean>` - Success status

**Example:**
```javascript
const controller = new DiagramController();
const success = await controller.initialize();
if (success) {
    console.log('Diagram ready');
}
```

#### `getConnectionManager()`
**Returns:** `ConnectionManager` instance

#### `getRelationshipManager()`
**Returns:** `CardRelationshipManager` instance

#### `getPositionManager()`
**Returns:** `CardPositionManager` instance

#### `getAnimationManager()`
**Returns:** `CardAnimationManager` instance

#### `getHoverEventManager()`
**Returns:** `HoverEventManager` instance

### Global Access

```javascript
// Available after initialization
window.diagramController
```

---

## 🔗 ConnectionManager

**Location:** `/public/scripts/shared/ConnectionManager.js`

**Purpose:** Manages SVG line creation and connection visualization.

### Constructor

```javascript
const connectionManager = new ConnectionManager();
```

### Methods

#### `initialize()`
Sets up SVG container and initializes connection tracking.

**Returns:** `boolean` - Success status

#### `getMethodColor(method)`
Returns color for HTTP method.

**Parameters:**
- `method` (string) - HTTP method (GET, POST, PUT, DELETE, etc.)

**Returns:** `string` - Hex color code

**Example:**
```javascript
const color = connectionManager.getMethodColor('POST');
// Returns: '#22c55e'
```

#### `getMethodDashPattern(method)`
Returns SVG dash pattern for HTTP method.

**Parameters:**
- `method` (string) - HTTP method

**Returns:** `string` - SVG stroke-dasharray value

**Example:**
```javascript
const pattern = connectionManager.getMethodDashPattern('DELETE');
// Returns: '10,5'
```

#### `createConnectionLine(fromElement, toElement, color, method)`
Creates SVG line between two DOM elements.

**Parameters:**
- `fromElement` (HTMLElement) - Source element
- `toElement` (HTMLElement) - Target element
- `color` (string) - Line color (optional, auto-detected from method)
- `method` (string) - HTTP method for styling (optional)

**Returns:** `SVGElement` - Created line element

**Example:**
```javascript
const pageCard = document.querySelector('.page-card');
const serverCard = document.querySelector('.server-card');
const line = connectionManager.createConnectionLine(pageCard, serverCard, '#3b82f6', 'GET');
```

#### `clearConnections()`
Removes all drawn connection lines.

**Example:**
```javascript
connectionManager.clearConnections();
```

#### `drawConnectionsForCurrentState()`
Draws connections based on currently active cards.

### Properties

#### `connectionSvg`
**Type:** `SVGElement`
**Description:** Main SVG container for all connections

#### `drawnConnections`
**Type:** `Set<string>`
**Description:** Set of drawn connection identifiers to prevent duplicates

---

## 👥 CardRelationshipManager

**Location:** `/public/scripts/shared/CardRelationshipManager.js`

**Purpose:** Determines relationships between cards based on API configurations.

### Constructor

```javascript
const relationshipManager = new CardRelationshipManager();
```

### Methods

#### `initialize()`
Sets up card caching and relationship mapping.

**Returns:** `boolean` - Success status

#### `findRelatedCards(hoveredCard)`
Finds all cards related to the hovered card.

**Parameters:**
- `hoveredCard` (HTMLElement) - The card being hovered

**Returns:** `Object` - Related elements structure

**Example:**
```javascript
const pageCard = document.querySelector('.page-card');
const related = relationshipManager.findRelatedCards(pageCard);

// Returns:
{
    pages: [HTMLElement, ...],      // Related page cards
    servers: [HTMLElement, ...],    // Related server cards
    apiItems: [HTMLElement, ...]    // Specific API items
}
```

#### `_findRelatedCardsForPage(pageCard)`
**Internal method** - Finds servers and APIs related to a page card.

#### `_findRelatedCardsForServer(serverCard)`
**Internal method** - Finds pages and APIs related to a server card.

#### `_parseCardApis(card)`
Extracts API list from card's data attributes.

**Parameters:**
- `card` (HTMLElement) - Card element with data-apis attribute

**Returns:** `Array<string>` - List of API endpoints

**Example:**
```javascript
const apis = relationshipManager._parseCardApis(pageCard);
// Returns: ['auth-server:POST /auth/login', 'user-server:GET /user/profile']
```

### Properties

#### `pageCards`
**Type:** `NodeList`
**Description:** Cached page card elements

#### `serverCards`
**Type:** `NodeList`
**Description:** Cached server card elements

---

## 📐 CardPositionManager

**Location:** `/public/scripts/shared/CardPositionManager.js`

**Purpose:** Handles position calculations and movement logic with zoom awareness.

### Constructor

```javascript
const positionManager = new CardPositionManager();
```

### Methods

#### `initialize()`
Sets up container references and zoom detection.

**Returns:** `boolean` - Success status

#### `getCurrentZoom()`
Extracts current zoom level from diagram container.

**Returns:** `number` - Current zoom factor (e.g., 1.0, 0.5, 2.0)

**Example:**
```javascript
const zoom = positionManager.getCurrentZoom();
console.log('Current zoom:', zoom); // 1.5
```

#### `calculateDistance(element1, element2)`
Calculates distance between two elements.

**Parameters:**
- `element1` (HTMLElement) - First element
- `element2` (HTMLElement) - Second element

**Returns:** `number` - Distance in pixels

**Example:**
```javascript
const distance = positionManager.calculateDistance(card1, card2);
console.log('Distance:', distance); // 250.5
```

#### `getProgressiveMoveRatio(distance, isTargetingUnrelated)`
Calculates movement ratio based on distance and card relationship.

**Parameters:**
- `distance` (number) - Distance between cards
- `isTargetingUnrelated` (boolean) - Whether targeting unrelated cards

**Returns:** `number` - Movement ratio (0.0 to 1.0)

**Example:**
```javascript
const ratio = positionManager.getProgressiveMoveRatio(300, false);
console.log('Move ratio:', ratio); // 0.7
```

#### `constrainToBounds(x, y, element)`
Ensures position stays within container bounds.

**Parameters:**
- `x` (number) - Target X position
- `y` (number) - Target Y position
- `element` (HTMLElement) - Element to constrain

**Returns:** `Object` - Constrained coordinates

**Example:**
```javascript
const constrained = positionManager.constrainToBounds(1500, -100, card);
// Returns: { x: 1200, y: 20 }
```

#### `calculateMovementToward(movingCard, targetCard, ratio)`
Calculates movement vector toward target position.

**Parameters:**
- `movingCard` (HTMLElement) - Card to move
- `targetCard` (HTMLElement) - Target position
- `ratio` (number) - Movement ratio (0.0 to 1.0)

**Returns:** `Object` - Movement coordinates

**Example:**
```javascript
const movement = positionManager.calculateMovementToward(card1, card2, 0.6);
// Returns: { x: 150, y: 75 }
```

### Properties

#### `diagramContainer`
**Type:** `HTMLElement`
**Description:** Main diagram container element

---

## 🎬 CardAnimationManager

**Location:** `/public/scripts/components/connection-area/CardAnimationManager.js`

**Purpose:** Handles card animations and visual state management.

### Constructor

```javascript
const animationManager = new CardAnimationManager(positionManager, connectionManager);
```

**Parameters:**
- `positionManager` (CardPositionManager) - Position calculation manager
- `connectionManager` (ConnectionManager) - Connection drawing manager

### Methods

#### `initialize()`
Sets up animation system and caches card elements.

**Returns:** `boolean` - Success status

#### `repositionRelatedCards(hoveredCard, relatedElements)`
Animates cards to strategic positions based on relationships.

**Parameters:**
- `hoveredCard` (HTMLElement) - The card being hovered
- `relatedElements` (Object) - Related cards from RelationshipManager

**Returns:** `Promise<void>` - Resolves when animations complete

**Example:**
```javascript
const related = relationshipManager.findRelatedCards(hoveredCard);
await animationManager.repositionRelatedCards(hoveredCard, related);
```

#### `resetAllCards()`
Returns all cards to their original positions and states.

**Returns:** `Promise<void>` - Resolves when reset complete

**Example:**
```javascript
await animationManager.resetAllCards();
```

#### `_animateHoveredCard(card)`
**Internal method** - Applies hover state to the active card.

#### `_animateRelatedCard(card, hoveredCard, relatedElements)`
**Internal method** - Positions related cards strategically.

#### `_animateUnrelatedCard(card, relatedElements)`
**Internal method** - Dims and repositions unrelated cards.

### Properties

#### `allCards`
**Type:** `NodeList`
**Description:** All page and server cards

#### `originalPositions`
**Type:** `Map<HTMLElement, Object>`
**Description:** Stores original card positions for reset

---

## 🎯 HoverEventManager

**Location:** `/public/scripts/components/connection-area/HoverEventManager.js`

**Purpose:** Manages hover events and coordinates system responses.

### Constructor

```javascript
const hoverEventManager = new HoverEventManager(relationshipManager, animationManager, connectionManager);
```

**Parameters:**
- `relationshipManager` (CardRelationshipManager) - Relationship detection
- `animationManager` (CardAnimationManager) - Animation coordination
- `connectionManager` (ConnectionManager) - Connection drawing

### Methods

#### `initialize()`
Sets up event listeners on all interactive cards.

**Returns:** `boolean` - Success status

#### `handleCardHover(card)`
Main hover handler that coordinates all system responses.

**Parameters:**
- `card` (HTMLElement) - Card being hovered

**Example:**
```javascript
// Automatically called by event listeners
// Can be called manually for testing:
hoverEventManager.handleCardHover(pageCard);
```

#### `resetAllCards()`
Handles mouse leave events and system reset.

**Example:**
```javascript
hoverEventManager.resetAllCards();
```

### Properties

#### `hoverTimeout`
**Type:** `number`
**Description:** Timeout ID for delayed reset

#### `isProcessing`
**Type:** `boolean`
**Description:** Prevents overlapping hover events

---

## 🔍 Debugging API

### Global Debug Functions

Available in browser console when `window.diagramController` exists:

```javascript
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

// Test connection colors
const connectionManager = window.diagramController.getConnectionManager();
console.log('POST color:', connectionManager.getMethodColor('POST'));
console.log('GET pattern:', connectionManager.getMethodDashPattern('GET'));

// Test card positions
document.querySelectorAll('.page-card').forEach((card, i) => {
    const rect = card.getBoundingClientRect();
    console.log(`Card ${i}:`, {x: rect.x, y: rect.y});
});

// Test animations
const animationManager = window.diagramController.getAnimationManager();
animationManager.resetAllCards();

// Clear all connections
window.diagramController.getConnectionManager().clearConnections();
```

### Performance Monitoring

```javascript
// Monitor module loading times
performance.getEntriesByType('resource')
    .filter(entry => entry.name.includes('/scripts/'))
    .forEach(entry => {
        console.log(entry.name, `${entry.duration.toFixed(2)}ms`);
    });

// Monitor animation performance
performance.mark('hover-start');
// ... trigger hover interaction ...
performance.mark('hover-end');
performance.measure('hover-duration', 'hover-start', 'hover-end');
```

## 📋 Error Handling

### Common Error Patterns

```javascript
// Module initialization errors
try {
    const success = await controller.initialize();
    if (!success) {
        console.error('Failed to initialize diagram controller');
    }
} catch (error) {
    console.error('Error during initialization:', error);
}

// Missing DOM elements
const svg = document.getElementById('connection-svg');
if (!svg) {
    throw new Error('SVG element not found');
}

// Invalid API data
try {
    const apis = JSON.parse(card.dataset.apis);
} catch (error) {
    console.error('Invalid API data on card:', card, error);
}
```

### Error Recovery

```javascript
// Reinitialize system after errors
window.diagramController = new DiagramController();
await window.diagramController.initialize();

// Clear stuck animations
document.querySelectorAll('.page-card, .server-card').forEach(card => {
    card.style.removeProperty('transform');
    card.classList.remove('active', 'highlighted', 'dimmed');
});

// Reset SVG connections
document.getElementById('connection-svg').innerHTML = '';
```

---

*This API reference covers all public interfaces and common usage patterns. For implementation details, refer to the source code and architecture documentation.*