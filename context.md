# Project Context Summary

## Overview
**Application Architecture Diagram** - Interactive web application built with Astro 4.x that visualizes API architecture relationships between frontend pages, backend servers, and database services through dynamic SVG connections.

## Purpose
- Display relationships between frontend pages and backend API services
- Show dynamic SVG connections with HTTP method-specific styling (GET, POST, PUT, DELETE)
- Provide real-time interaction through card hover effects and animations
- Support zoom/pan functionality for navigating complex diagrams
- Demonstrate API dependencies and data flow visually
- **Visual API Usage Analytics** - Display most called APIs from frontend pages without hover interaction required

## Technical Stack
- **Astro 4.x** - Static site generator with component islands
- **TypeScript** - Full type safety with ES modules (TypeScript ONLY - no JavaScript files)
- **Tailwind CSS** - Utility-first styling with custom components
- **SVG Graphics** - Dynamic connection lines
- **Vitest** - Testing framework
- **JSON Configuration** - Data-driven relationships

## Architecture Flow
```
Frontend Pages → API Servers → Backend Services
     ↓              ↓              ↓
   PageCard   →   ServerCard   →  BackendCard
                     ↓
              ConnectionArea (Controller)
```

## Key Components

### Data Layer
- `pages.json` - Frontend pages (Login, Dashboard, Products, Orders) with API dependencies
- `servers.json` - Backend servers (Auth, User, Analytics) with endpoints and database connections  
- `backends.json` - Database/infrastructure services (MySQL, Redis, MongoDB, Elasticsearch, RabbitMQ)

### Astro Components
- `ArchitectureDiagram.astro` - Main container with zoom/pan controls
- `PageCard.astro` - Frontend page cards with API metadata
- `ServerCard.astro` - Backend server cards with endpoint information
- `BackendCard.astro` - Database/infrastructure service cards
- `ConnectionArea.astro` - Interaction controller and module loader

### TypeScript Modules (DiagramController Pattern)
- **ConnectionManager** - SVG line creation with HTTP method-specific colors/patterns
- **CardRelationshipManager** - API-based relationships using JSON mappings
- **CardPositionManager** - Card movement calculations and boundary constraints
- **CardAnimationManager** - Smooth CSS transform-based animations
- **HoverEventManager** - User interaction coordination
- **ApiFrequencyUtils** - Calculate API usage frequency from pages.json data

## Interactive Features
1. **Hover Effects** - Highlight related components, dim unrelated ones
2. **Dynamic Connections** - SVG lines with method-specific styling
3. **Card Animation** - Strategic positioning for readability
4. **Zoom & Pan** - Mouse, touch, keyboard navigation
5. **Progressive Movement** - Distance and relationship-based positioning
6. **API Usage Visualization** - Real-time display of most called APIs with visual indicators

## Visual Styling
- Color-coded connections by HTTP method (GET=green, POST=blue, PUT=yellow, DELETE=red)
- Dash patterns for connection types
- Scaling/highlighting for active elements
- Dimming effects during interactions

## Design Patterns
- **Facade** - DiagramController unified interface
- **Strategy** - HTTP method styling strategies
- **Observer** - Event-driven interactions
- **Factory** - Relationship logic per card type
- **Mediator** - HoverEventManager coordination

## Project Structure
```
src/
├── components/          # Astro UI components
├── data/               # JSON configuration files  
├── scripts/            # TypeScript modules
│   ├── components/     # Component-specific logic
│   └── shared/         # Shared utilities
├── styles/             # Modular CSS
├── types/              # TypeScript definitions
└── pages/              # Astro routes

tests/                  # Vitest test suite
docs/                   # Documentation
public/                 # Static assets/compiled scripts
```

## Testing Framework & Commands
- **Framework**: Vitest with jsdom for DOM testing
- **Run tests**: `npm test` (watch mode) or `npm run test:run` (single run)
- **Type checking**: `npm run type-check` (TypeScript validation)
- **Build scripts**: `npm run build-scripts` (compiles TypeScript modules)

## Testing Coverage
- Connection validation and API relationship mapping
- Component integration between managers
- Animation logic and movement calculations
- Relationship correctness from JSON data
- Individual connection drawing and type validation
- Three-component relationship testing
- Connection correctness and integration tests

## Development Workflow
1. **Development**: `npm run dev` (builds scripts + starts Astro dev server)
2. **Type checking**: `npm run type-check` (validates TypeScript)
3. **Testing**: `npm test` (runs Vitest in watch mode)
4. **Building**: `npm run build` (builds scripts + Astro check + production build)

## Key Strengths
- **TypeScript-only development** with comprehensive interfaces (no JavaScript files)
- Modular architecture with clean separation of concerns
- Performance-optimized animations and DOM operations
- Extensible design ready for future enhancements
- Configuration-driven relationships without code changes
- Responsive design across all devices
- Comprehensive testing with Vitest framework

## Recent Updates
- Fixed duplicate connection drawing between CardAnimationManager and HoverEventManager
- Consolidated connection logic to use only HoverEventManager.drawConnections()
- Added missing log line for successful connection creation
- Improved separation of concerns between animation and connection management
- **API Frequency Visualization Enhancement** - Added TypeScript-based API usage calculation
  - Created `utils/apiFrequency.ts` for calculating API call frequency from pages.json
  - Updated ServerCard to display most called APIs with visual indicators
  - Separated calculation logic (TypeScript) from display logic (Astro components)
  - APIs now sorted by frontend page usage with color-coded frequency badges
- **Connection Management Fixes** - Resolved multiple pages calling same API issue
  - Fixed CardRelationshipManager connection pair deduplication logic
  - Updated ConnectionManager connectionId to include element context for uniqueness
  - Ensures separate connection lines for each page-to-server relationship
  - Multiple pages can now properly connect to same API endpoint simultaneously

## Current State
The project has a complete implementation with interactive features, comprehensive testing, and is ready for production use. Recent work includes backend integration, connection validation improvements, and refactoring of connection management logic.