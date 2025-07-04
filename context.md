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
- `pages.json` - Frontend pages (Login, Dashboard, Products, Orders) with API dependencies and screenshot configuration
- `servers.json` - Backend servers (Auth, User, Analytics) with endpoints and backend service connections (array-based)  
- `backends.json` - Database/infrastructure services (MySQL, Redis, MongoDB, Elasticsearch, RabbitMQ)

### Astro Components
- `ArchitectureDiagram.astro` - Main container with advanced zoom/pan controls, keyboard shortcuts, touch gestures
- `PageCard.astro` - Frontend page cards with API metadata, server color theming, and screenshot display (phone/web views)
- `ServerCard.astro` - Backend server cards with endpoint information and API frequency visualization
- `BackendCard.astro` - Database/infrastructure service cards with type classifications
- `ConnectionArea.astro` - Interaction controller and TypeScript module loader
- `Layout.astro` - Base layout template with Thai language support and Google Fonts integration
- `Header.astro` - Gradient header component with Thai text and emoji
- `LoadingScreen.astro` - Animated loading screen with progress bars and rotating Thai messages

### TypeScript Modules (DiagramController Pattern)
- **ConnectionManager** - SVG line creation with HTTP method-specific colors/patterns and connection deduplication
- **CardRelationshipManager** - API-based relationships using JSON mappings with bidirectional logic
- **CardPositionManager** - Card movement calculations, boundary constraints, and progressive positioning
- **CardAnimationManager** - Hardware-accelerated CSS transform animations with state management
- **HoverEventManager** - User interaction coordination and event delegation

### Utility Modules
- **ApiFrequencyUtils** (`utils/apiFrequency.ts`) - Calculate API usage frequency from pages.json data
  - API call frequency calculation based on frontend page usage
  - Server-specific API usage data and sorting algorithms
  - Most-used API identification and page connection counting
- **ServerColors** (`utils/serverColors.ts`) - Comprehensive color theming system
  - Color scheme mappings for all 7 servers with fallback support
  - Consistent visual identity across page and server cards
  - Helper functions for color and name retrieval

## Interactive Features
1. **Hover Effects** - Highlight related components, dim unrelated ones with diagram-dimmed mode
2. **Dynamic Connections** - SVG lines with HTTP method-specific styling and dash patterns
3. **Card Animation** - Strategic positioning for readability with hardware acceleration
4. **Advanced Zoom & Pan System** - Comprehensive navigation controls:
   - Mouse wheel zoom with cursor-focus preservation (0.3x to 3x range)
   - Touch gestures for mobile devices (pinch-to-zoom, pan)
   - Keyboard shortcuts (Ctrl+/-, Ctrl+0, Arrow keys for panning)
   - Boundary constraints and zoom limits with smooth transitions
5. **Progressive Movement** - Distance and relationship-based positioning with collision avoidance
6. **API Usage Visualization** - Real-time display of most called APIs with visual indicators
7. **Backend Highlighting** - Inline style application for emphasis during interactions
8. **Drag State Management** - Disables hover effects during zoom/pan interactions
9. **Screenshot Display** - Page cards show preview screenshots with phone/web frame options

## Visual Styling

### CSS Architecture
- **Modular CSS System** - Organized into specialized modules:
  - `base.css` - Tailwind integration, global styles, custom utilities, scrollbar styling
  - `components.css` - Reusable component classes, API item styling, button systems
  - `animations.css` - Custom animation keyframes and transitions
  - `cards.css` - Card-specific styling and responsive design
  - `connections.css` - SVG connection line styling and interaction states
  - `layout.css` - Layout-specific styles and responsive breakpoints

### Design System
- **Color-coded connections** by HTTP method (GET=green, POST=blue, PUT=yellow, DELETE=red, PATCH=purple)
- **Dash patterns** for connection types with method-specific styling
- **Server color theming** - Consistent color schemes across all components
- **Glass morphism effects** - Modern backdrop blur and transparency
- **Custom animations** - `pulse-glow` and `bounce-gentle` keyframes
- **Responsive design** - Mobile-first approach with breakpoint optimizations
- **Thai typography** - Inter font integration with proper language support

## Design Patterns
- **Facade** - DiagramController unified interface
- **Strategy** - HTTP method styling strategies
- **Observer** - Event-driven interactions
- **Factory** - Relationship logic per card type
- **Mediator** - HoverEventManager coordination

## Architecture Guidelines
- **No CSS in Astro Components** - All styling should be in separate CSS files in `src/styles/`
- **No JavaScript Logic in Astro** - All interactive logic must be in TypeScript modules in `src/scripts/`
- **Astro Components for Markup Only** - Components should only contain HTML structure and data binding
- **TypeScript Module Pattern** - All functionality implemented through manager classes and utility modules
- **Separation of Concerns** - Clear boundaries between presentation (Astro), styling (CSS), and behavior (TypeScript)
- **TypeScript Only - NO JavaScript Files** - Never create .js files. All code must be TypeScript (.ts) files
- **No Manual JS Files in Public Folder** - The public folder should only contain compiled output from TypeScript build process
- **Import TypeScript Modules Directly** - Astro components should import TypeScript modules from `src/scripts/` directly, not from public folder
- **Build Process Creates JS Files** - The `npm run build-scripts` command compiles TypeScript to JavaScript in public folder - this is automatic and expected
- **Never Edit Public Folder JS Files** - Only edit TypeScript source files in `src/scripts/`, never modify the compiled .js files
- **Import Pattern in Astro** - Use `import('/src/scripts/path/to/module.ts')` in script tags - Astro/Vite handles TypeScript compilation
- **Module Type Scripts** - Always use `<script type="module">` in Astro components when importing TypeScript modules

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

### Build Process
1. **Development**: `npm run dev` (builds scripts + starts Astro dev server)
2. **Script compilation**: `npm run build-scripts` (compiles TypeScript modules to public/ directory)  
3. **Type checking**: `npm run type-check` (validates TypeScript across dual configuration)
4. **Testing**: `npm test` (runs Vitest in watch mode) / `npm run test:run` (single run)
5. **Building**: `npm run build` (builds scripts + Astro check + production build)

### Dual TypeScript Configuration
- **tsconfig.json** - Main configuration for Astro components and application code
- **tsconfig.scripts.json** - Separate configuration for TypeScript modules compilation
  - Different output directory (`public/` vs `dist/`)
  - Independent compilation targets and module systems
  - Separate include/exclude patterns for optimal build performance

### Testing Infrastructure
- **Vitest Configuration** - Coverage thresholds (80% minimum), JSDOM environment
- **Test Setup** (`tests/setup.ts`) - Comprehensive DOM mocking and SVG namespace handling
- **Debug Tools** - Connection verification scripts, orders testing, validation demos
- **Coverage Requirements** - 80% minimum for branches, functions, lines, statements

## Key Strengths
- **TypeScript-only development** with comprehensive interfaces (no JavaScript files)
- **Modular architecture** with clean separation of concerns and DiagramController pattern
- **Performance-optimized** animations with hardware acceleration and DOM operations
- **Extensible design** ready for future enhancements with plugin architecture
- **Configuration-driven** relationships without code changes through JSON data files
- **Responsive design** across all devices with mobile-first approach
- **Comprehensive testing** with Vitest framework and 95.8% test success rate
- **Internationalization** support with Thai language integration
- **Advanced interaction** system with zoom/pan, touch gestures, and keyboard shortcuts
- **Debug and validation** tools for development workflow optimization
- **Comprehensive documentation** suite with technical architecture guides

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
- **TypeScript Migration** - Converted all JavaScript files to TypeScript
  - Converted 6 debug/testing .js files to .ts with proper type annotations
  - Added comprehensive interfaces for debugging tools and connection validation
  - Ensured 95.8% test success rate (113/118 tests passing)
  - Maintained ES module exports and proper DOM element typing
- **Group-Based Page Organization** - Implemented nested JSON structure and view toggle functionality
  - Restructured `pages.json` to nest pages under application groups (User Portal, Order Application, Product Management)
  - Created `GroupCard.astro` component for group-level visualization showing constituent pages
  - Implemented `ViewToggle.astro` component with enhanced UI for switching between page and group views
  - Added keyboard shortcut (Alt+V) and visual feedback for view mode changes
  - Updated API frequency calculations to work with nested data structure
- **Architecture Refactoring** - Enforced separation of concerns following project guidelines
  - **No CSS in Astro Components** - Moved all styles to dedicated CSS files in `src/styles/`
  - **No JavaScript in Astro** - Extracted all logic to TypeScript modules in `src/scripts/`
  - Created `ViewToggleManager.ts` for view mode switching logic
  - Created `DiagramViewManager.ts` for handling view transitions in the main diagram
  - Created `DiagramZoomManager.ts` for zoom/pan functionality
  - Added `view-toggle.css` and `architecture-diagram.css` for component-specific styling
  - Maintained clean Astro components with only HTML structure and data binding

## Project Structure
```
src/
├── components/          # Astro UI components (8 components)
│   ├── ArchitectureDiagram.astro    # Main diagram with zoom/pan
│   ├── PageCard.astro               # Frontend page cards
│   ├── ServerCard.astro             # API server cards
│   ├── BackendCard.astro            # Database/service cards
│   ├── ConnectionArea.astro         # Interaction controller
│   ├── Layout.astro                 # Base layout template
│   ├── Header.astro                 # Gradient header
│   └── LoadingScreen.astro          # Animated loading screen
├── data/               # JSON configuration files  
│   ├── pages.json      # Frontend pages with API dependencies
│   ├── servers.json    # Backend servers with endpoints
│   └── backends.json   # Database/infrastructure services
├── scripts/            # TypeScript modules (DiagramController pattern)
│   ├── components/     # Component-specific logic
│   │   └── connection-area/   # Connection and interaction managers
│   └── shared/         # Shared utilities and managers
├── utils/              # Utility functions
│   ├── apiFrequency.ts # API usage frequency calculation
│   └── serverColors.ts # Server color theming system
├── styles/             # Modular CSS architecture
│   ├── base.css        # Tailwind integration and global styles
│   ├── components.css  # Reusable component classes
│   ├── animations.css  # Custom keyframe animations
│   ├── cards.css       # Card-specific styling
│   ├── connections.css # SVG connection styling
│   └── layout.css      # Layout and responsive design
├── types/              # TypeScript definitions
└── pages/              # Astro routes

tests/                  # Vitest test suite (15 test files, 118 tests)
docs/                   # Comprehensive documentation
├── ARCHITECTURE.md     # Technical architecture guide
├── API_REFERENCE.md    # API documentation  
├── DEVELOPMENT.md      # Development guidelines
├── SETUP.md           # Setup instructions
└── TROUBLESHOOTING.md # Common issues and solutions

debug-tools/           # TypeScript debugging and validation scripts
├── connection-verification.ts      # Connection logic verification
├── orders-connection-test.ts       # Orders page specific testing
├── debug-orders-connection.ts      # Detailed orders debugging
├── final-connection-test.ts        # Comprehensive connection tests
├── connection-validation-demo.ts   # Connection validation demo
└── connection-correctness-demo.ts  # Connection correctness testing

public/                # Static assets and compiled TypeScript modules
```

## Development Guidelines
- **Context Documentation** - Always update context.md whenever making changes, having insights, or understanding new aspects of the project
  - Document all architectural decisions and rationale
  - Record implementation details and patterns discovered
  - Update Recent Updates section with all modifications
  - Maintain comprehensive project state documentation

## Current State
The project has a complete implementation with advanced interactive features, comprehensive testing (100% success rate - 130/130 tests passing), and is ready for production use. Recent work includes TypeScript migration, API frequency visualization, connection management fixes, and comprehensive documentation updates. The application supports Thai internationalization, advanced zoom/pan interactions, real-time API usage analytics, and maintains a fully TypeScript-only codebase with extensive debugging and validation tools.

Position card hover logging is fully implemented with comprehensive tracking:
- **HoverEventManager.ts:174-178** - Logs hover trigger with position and size details (👍 emoji)
- **CardAnimationManager.ts:142-147** - Logs hovered card animation specifics (🎆 emoji)
- **CardAnimationManager.ts:242-248** - Logs detailed position movement for related cards (🎯 emoji)
- **CardAnimationManager.ts:269** - Logs hiding of unrelated cards with position and transform details (🔍 emoji)
- **CardRelationshipManager.ts:50** - Logs related card finding process (🎯 emoji)
- **HoverEventManager.ts:300** - Logs each connection being drawn with type and coordinates (📐 emoji)
- **HoverEventManager.ts:355** - Logs successful connection creation (✅ emoji)

The logging system provides complete visibility into:
- Initial hover trigger with timestamp and card dimensions
- Related card identification and repositioning calculations
- Card position movements with distance calculations
- Unrelated card hiding with transform details
- Connection drawing process with type-specific handling
- Successful completion confirmations for all operations

**Movement Optimization Fix** - Resolved excessive card movement during hover:
- Fixed auth-server moving 795px on User Portal hover by implementing progressive movement
- Modified CardAnimationManager.ts:238-262 to use CardPositionManager.getProgressiveMoveRatio()
- Now applies progressive movement ratios (15-30%) instead of full replacement positioning
- Enhanced logging to show both full distance and actual movement with ratio percentage
- Maintains visual grouping while preventing jarring card jumps

**Test Suite Optimization** - Achieved 100% test success rate:
- Fixed CardAnimationManager undefined positionManager error in connection-logic.test.ts
- Replaced circular `new CardAnimationManager().positionManager` with proper `new CardPositionManager()`
- Fixed ViewToggle test slider positioning issue in DiagramController.ts:280-285
- Added fallback logic for test environments where button offset is 0
- All 17 test files now pass with 130/130 tests successful

**Group-Level Filtering Feature** - Added comprehensive filtering system for group-focused view:
- Created `GroupFilter.astro` component with dropdown interface for selecting application groups
- Implemented `GroupFilterManager.ts` to handle filtering logic and card visibility management
- Added "All Groups" option and individual group selection (User Portal, Order Application, Product Management)
- Filtering completely hides unrelated components using `display: none` instead of dimming
- Hidden cards receive `filtered-hidden` class with full opacity removal and scale transform
- Dropdown interface replaces button layout for space efficiency - moved inline with ViewToggle
- Enhanced with proper dropdown interactions, click outside closing, and keyboard accessibility
- Connected servers and backends are identified and shown/hidden based on group relationships
- Added comprehensive test coverage with 157 tests passing (100% success rate)
- Removed Alt+V keyboard shortcut functionality as requested by user
- Space-optimized layout fitting within existing view mode toggle area

**Group View Connection Line Fix** - Resolved connection line positioning issues in group view mode:
- **Root Cause**: CardRelationshipManager was detecting group view correctly but using wrong connection types
- **View Mode Detection Fix**: Replaced flawed element count detection with proper visibility checking in `_isGroupViewMode()`
- **Connection Type Enhancement**: Added missing `GROUP_TO_SERVER` connection type to enum in `types/index.ts`
- **Connection Manager Update**: Enhanced ConnectionManager with proper edge-to-edge positioning for group cards:
  - Added group-to-server: group right edge → server left edge
  - Added server-to-group: server left edge → group right edge  
  - Added group-to-backend: group right edge → backend left edge
  - Added backend-to-group: backend left edge → group right edge
- **Fixed Connection Pair Generation**: Updated `_getGroupConnectionPairs()` to use `ConnectionType.GROUP_TO_SERVER` instead of `PAGE_TO_SERVER`
- **Result**: Server/backend hover in group view now correctly draws connection lines to group cards with proper edge positioning
- **Debug Logging**: Added comprehensive debug logging for view mode detection and connection type identification

**Server/Backend Hover in Group Mode Fix** - Resolved missing connection lines when hovering servers/backends in group view:
- **Root Cause**: `_getServerConnectionPairs()` and `_getBackendConnectionPairs()` methods only handled page cards, not group cards
- **HoverEventManager Enhancement**: Added `GROUP_TO_SERVER` connection type handling in `drawConnection()` method:
  - Added teal color (#14b8a6) styling for group-to-server connections
  - Added proper element highlighting for group and server cards
  - Updated HoverEventManager.ts:333-340 with new connection type case
- **CardRelationshipManager Updates**: Enhanced both connection pair methods to support group view mode:
  - **_getServerConnectionPairs()** (lines 396-466): Added group view mode detection and GROUP_TO_SERVER connection creation
  - **_getBackendConnectionPairs()** (lines 506-585): Added group view mode detection and GROUP_TO_SERVER connection creation
  - Both methods now check `_isGroupViewMode()` and handle group cards appropriately
  - Group connections use simplified group-to-server logic without individual API elements
- **Test Updates**: Updated `connection-type-enum.test.ts` to expect the new `GROUP_TO_SERVER` enum value
- **Result**: Hovering on servers or backends in group view now properly displays teal connection lines back to related group cards
- **Test Coverage**: All 156 tests passing with complete TypeScript compilation success

**WEBSOCKET HTTP Method Addition** - Added new WEBSOCKET connection type support:
- **HttpMethod Type Extension**: Added `WEBSOCKET` to the HttpMethod union type in `types/index.ts`
- **Visual Styling**: Implemented grey color (#6b7280) for WEBSOCKET connections (matches tag styling)
- **Connection Pattern**: Added unique dash pattern (20,5,5,5) for visual distinction from other HTTP methods
- **ConnectionManager Updates**: Enhanced both `getMethodColor()` and `getMethodDashPattern()` methods to handle WEBSOCKET
- **Test Integration**: Updated `connection-type-enum.test.ts` to include WEBSOCKET in valid HTTP method expectations
- **Comprehensive Testing**: Created `websocket-method.test.ts` with 6 tests covering color, pattern, type safety, and visual distinction
- **Backward Compatibility**: All existing HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS) remain unchanged
- **Result**: WEBSOCKET connections now display with grey color and distinctive long dash patterns for real-time communication visualization
- **Test Coverage**: All 162 tests passing (6 new WEBSOCKET tests) with complete TypeScript compilation success

**Dashboard WEBSOCKET Integration** - Added real-time websocket connection to dashboard page:
- **Data Configuration**: Added `notification-server:WEBSOCKET /notifications/live` API to dashboard page in `pages.json`
- **Server Enhancement**: Added `WEBSOCKET /notifications/live` endpoint to notification-server in `servers.json`
- **Real-time Dashboard**: Dashboard now connects to notification server via both GET (recent notifications) and WEBSOCKET (live notifications)
- **Visual Distinction**: WEBSOCKET connections display with grey color (#6b7280) and unique long dash pattern (20,5,5,5)
- **Multi-Protocol Support**: Dashboard demonstrates mixed HTTP/WEBSOCKET architecture with 4 total connections:
  - `user-server:GET /user/profile` (green solid line)
  - `analytics-server:GET /analytics/summary` (green solid line)  
  - `notification-server:GET /notifications/recent` (green solid line)
  - `notification-server:WEBSOCKET /notifications/live` (grey long dash line)
- **Comprehensive Testing**: Created `dashboard-websocket.test.ts` with 7 tests validating WEBSOCKET integration and multi-server connections
- **Backend Integration**: WEBSOCKET connection properly routes through RabbitMQ backend for real-time message handling
- **Test Coverage**: All 169 tests passing (7 new dashboard WEBSOCKET tests) with complete integration verification

**Double Reset Issue Fix** - Resolved duplicate hover event handling causing double reset triggers:
- **Root Cause**: index.astro contained duplicate hover event listeners that conflicted with HoverEventManager
- **Architecture Violation**: index.astro had JavaScript logic violating "No JavaScript Logic in Astro" guideline
- **Conflicting Behavior**: Both index.astro and HoverEventManager were handling mouseleave events simultaneously
- **Double Reset Logs**: `🚪 Triggering reset due to card leave` appeared twice for each hover end
- **Solution**: Removed all hover logic from index.astro, maintaining single source of truth in HoverEventManager
- **Compliance**: Now follows separation of concerns - Astro for HTML structure, TypeScript modules for behavior
- **Result**: Clean single reset per hover interaction, no more conflicting event handlers or flickering

**Group View Console Logging Fix** - Cleaned up connection summary logging for group view mode:
- **Issue**: In group view, page-to-server connections don't exist (pages are aggregated into groups)
- **Problem**: Console showed `- 0 page-to-server connections` line unnecessarily in group mode
- **Expected**: Only 2 summary lines for group view (server-to-backend + group-to-server)
- **Actual**: 3 summary lines including irrelevant 0 page-to-server line
- **Solution**: Modified HoverEventManager.ts:292-305 to only log non-zero connection counts
- **Result**: Group view now shows clean 2-line summary without irrelevant zero counts

**Group View Connection Simplification** - Simplified group hover to show only direct group relationships:
- **Issue**: Group hover was showing both group-to-server AND server-to-backend connections
- **Problem**: Too much visual complexity when hovering groups - should focus on group's direct relationships
- **Expected**: Only 1 summary line for group view (group-to-server connections only)
- **Previous**: 2 summary lines (group-to-server + server-to-backend)
- **Solution**: Removed server-to-backend connection creation from `_getGroupConnectionPairs()` method
- **Rationale**: Group view should emphasize group-to-server relationships, not internal infrastructure
- **Result**: Group hover now shows only `- X group-to-server connections` line, cleaner visual focus

**Group Filter API Hiding** - Hide unrelated APIs when filtering by group:
- **Issue**: When filtering by group in group view mode, all APIs in server cards were still visible
- **Problem**: API count badge showed total APIs, not just APIs used by the selected group
- **Solution**: 
  - Added `filterServerApiItems()` method to hide/show API items based on selected group
  - Added `updateVisibleApiCounts()` method to update API count badges dynamically
  - Added `data-api-count` attribute to API count badge in ServerCard.astro
- **Implementation**:
  - When a group is selected, only APIs used by that group's pages are shown
  - API count badge updates to show "X APIs" where X is the visible API count
  - When "All Groups" is selected, all APIs are shown again
- **Result**: Clean filtering where only relevant APIs are visible with accurate counts

**Backend Connection Filtering Fix** - Fixed incorrect connection lines when hovering backends in filtered view:
- **Issue**: When hovering on elasticsearch backend in filtered group view, connections showed to hidden servers
- **Problem**: CardRelationshipManager didn't check if cards were filtered/hidden before creating connections
- **Root Cause**: All relationship finding methods iterated through cards without checking visibility state
- **Solution**: Added visibility checks to all relationship methods:
  - `_findServersRelatedToBackend()` - Skip hidden/filtered servers
  - `_findPagesRelatedToServer()` - Skip hidden/filtered pages  
  - `_findPagesRelatedToServers()` - Skip hidden/filtered pages
  - `_findServersRelatedToPage()` - Skip hidden/filtered servers
  - `_findBackendsRelatedToServers()` - Skip hidden/filtered backends
- **Implementation**: Check for `display: none` or `filtered-hidden` class before including in relationships
- **Result**: Connection lines now only show to visible/unfiltered cards, fixing elasticsearch hover issue

**Full API Display** - Removed 4-API limit to show all server APIs:
- **Issue**: ServerCard component was limiting API display to only 4 APIs using `.slice(0, 4)`
- **Problem**: Servers with more than 4 APIs (auth-server has 6, product-server has 5) were truncated
- **Solution**: Removed `.slice(0, 4)` from line 51 in ServerCard.astro to show all APIs
- **Also Removed**: The "+X more APIs" message (lines 108-112) since all APIs are now displayed
- **Result**: All server APIs are now visible without any limitation, providing complete API visibility

**API Status Tags** - Added support for API status tags to highlight new APIs:
- **Type System Enhancement**: 
  - Added `ApiStatus` type with values: 'new' | 'stable' | 'deprecated'
  - Created `ApiDefinition` interface with `endpoint` and optional `status` fields
  - Updated `ServerData` interface to accept `apis: (string | ApiDefinition)[]`
- **servers.json Updates**: Added status tags to new APIs:
  - auth-server: "POST /auth/forgot-password" and "POST /auth/reset-password" marked as "new"
  - notification-server: "POST /notifications/send" and "WEBSOCKET /notifications/live" marked as "new"
  - product-server: "GET /products/categories" marked as "new"
- **ServerCard.astro Changes**:
  - Handles both string and object API formats transparently
  - Extracts `apiEndpoint` and `apiStatus` from API data
  - Displays green "NEW" badge with pulse animation for new APIs
- **apiFrequency.ts Updates**:
  - Updated `sortApisByFrequency` to handle mixed string/object API arrays
  - Maintains backward compatibility with existing string-only APIs
- **Visual Design**: New APIs show animated green "NEW" badge next to HTTP method tag
- **Result**: Clear visual indication of newly added APIs without breaking existing functionality

**Protocol Buffer API Support** - Added protobuf flag to identify APIs using Protocol Buffers:
- **Type Enhancement**: Added optional `protobuf?: boolean` field to `ApiDefinition` interface
- **servers.json Updates**: Added protobuf flags to several APIs:
  - analytics-server: "GET /analytics/summary" and "GET /analytics/reports" use protobuf
  - order-server: "GET /orders/list" uses protobuf, "POST /orders/create" is both new and protobuf
- **ServerCard.astro Implementation**:
  - Extracts `isProtobuf` flag from API object
  - Displays purple "Proto" badge for protobuf APIs
  - Badge appears between endpoint path and other tags
- **Visual Design**: 
  - Purple background (#9333ea / bg-purple-600) with white text
  - Rectangular badge style (not rounded-full like NEW tag)
  - Title attribute shows "Protocol Buffer" on hover
  - Can combine with other tags (NEW, MOST USED)
- **Example**: Order server's "POST /orders/create" shows both "Proto" and "NEW" badges
- **Result**: Clear identification of APIs using Protocol Buffers for efficient binary serialization

**Backend Implementation Distinction & External Service Relay** - Added clear visual distinction between internal vs external backends:
- **Type System Enhancement**:
  - Added `BackendType` with values: 'implemented' | 'external'
  - Updated `BackendData` interface with required `type` field and optional `externalServices?: string[]`
  - Added `BackendsConfig` interface for backend configuration
- **backends.json Classification**: Categorized all backends by implementation status:
  - **Internal/Implemented**: mysql-db, redis-cache, mongodb (backends you control/implement)
  - **External**: elasticsearch, rabbitmq (third-party services you don't implement)
  - External services can still have their own external dependencies
- **BackendCard.astro Visual Distinction**:
  - **Card Background**: 
    - Internal: Green gradient (from-green-50 to-emerald-100) with green border
    - External: Blue gradient (from-blue-50 to-sky-100) with blue border
  - **Header Elements**:
    - Color-coded status indicator dot (green for internal, blue for external)
    - "Internal" or "External" badge with matching color scheme
    - Status icon: checkmark for internal, link icon for external
- **External Services Display** (unchanged from previous):
  - **Header Indicator**: Orange external link icon for backends with external services
  - **Dedicated Section**: Prominent orange-themed section
  - **Service List**: Arrow icons and semibold text in orange container
- **Visual Hierarchy**:
  - **Green Theme**: Internal backends (you implement) - suggests control and ownership
  - **Blue Theme**: External backends (third-party) - suggests external dependency
  - **Orange Theme**: External service relays - highlights third-party integrations
- **Result**: Clear, immediate visual distinction between backends you implement vs external services, with prominent external service dependency indicators

**Page Screenshot Feature** - Added configurable screenshot display for page cards:
- **Type System Enhancement**:
  - Added `screenshot?: string` field to PageData interface for image path
  - Added `screenshotType?: 'phone' | 'web'` to control display format
- **Display Modes**:
  - **Phone Mode**: Shows screenshot in realistic phone frame with notch and home indicator
  - **Web Mode**: Shows screenshot in browser window with traffic lights and URL bar
- **Visual Design**:
  - Phone frame: 96x192px (1:2 ratio) with black bezels
  - Web frame: Full width x 160px with browser chrome
  - Object-contain scaling prevents image cropping
  - "No file" placeholder when screenshot not configured
- **Configuration**: Set in pages.json with screenshot path and optional type
- **File Organization**: Screenshots stored in `/public/screenshots/` directory
- **Result**: Enhanced visual preview of pages with support for both mobile and web interfaces

**Backend Array Structure** - Updated servers.json to use array-based backend connections:
- **Type System Enhancement**:
  - Updated `ServerData` interface to include `backends?: string[]` property
  - Changed from single `backend` string to `backends` array for multiple backend support
- **Data Structure Update**:
  - Modified all servers in servers.json to use `backends: ["backend-id"]` format
  - Analytics server now demonstrates multiple backends: `["mongodb", "elasticsearch"]`
- **Enhanced Flexibility**:
  - Servers can now connect to multiple backend services
  - Better reflects real-world microservice architectures
  - Maintains backward compatibility with single backend servers
- **Documentation Updates**: Updated API_REFERENCE.md with new array-based structure examples
- **Result**: More accurate representation of server-to-backend relationships with multi-backend support

**App Filtering in Page Mode** - Extended group filtering to work in both page and group view modes:
- **GroupFilterManager Updates**:
  - Modified `setViewMode()` to always show filter dropdown in both page and group modes
  - Updated `applyGroupFilter()` to work in both view modes with different filtering logic
  - Enhanced `filterCards()` to filter page cards by their parent group in page mode
  - Modified `updateFilterDescription()` to provide appropriate descriptions for both modes
- **Page Mode Filtering**:
  - In page mode: Shows only pages from selected app/group
  - Page cards filtered based on their `data-group` attribute
  - APIs collected from visible page cards only
  - Filter description: "Showing only pages from [GroupName] and connected components"
- **DiagramController & ViewToggle Updates**:
  - Updated view description to indicate "Show individual pages with app filtering support"
  - Filter remains visible and functional when switching between view modes
- **Result**: Consistent filtering experience across both views with appropriate component hiding

**Page Card Group Display** - Modified page cards to show group name as primary title:
- **Visual Hierarchy Change**:
  - Group name now displayed as main title (larger, bold text)
  - Page name shown as subtitle (medium weight, smaller text)
  - Replaced group badge with subtle color indicator bar
- **Implementation**:
  - Updated PageCard.astro title section (lines 116-118)
  - Changed from `{page.name}` to `{group?.name || 'Unknown Group'}`
  - Added page name as secondary text with gray styling
- **Result**: Better context in Page Level view emphasizing app grouping

**Filter Initial State Fix** - Resolved filter not showing on page load:
- **Issue**: Filter only appeared when switching between view modes
- **Root Cause**: Filter was hidden during initialization and only shown on `setViewMode()` call
- **Solution**: Modified GroupFilterManager initialization to show filter immediately
- **Implementation**: Moved filter display logic from `setViewMode()` to `initialize()` method
- **Result**: Filter dropdown now visible immediately on page load

**CardAnimationManager Hardcoded Logic Removal** - Removed all hardcoded server priorities and mappings:
- **Removed Hardcoded Elements**:
  - Server sorting priorities (auth-server, payment-server)
  - Strategic target mappings (auth → user/analytics, payment → notification/product)
- **Simplified Implementation**:
  - Uses natural order from relatedElements without sorting
  - Always uses nearest unrelated card logic for all servers equally
  - Pure proximity-based positioning without preferences
- **Result**: Animation behavior now completely data-driven from JSON

**PageCard Server Colors from JSON** - Removed hardcoded server colors and names:
- **servers.json Enhancement**: Added color property to all servers
  - auth-server: #3B82F6 (blue)
  - payment-server: #10B981 (green)
  - user-server: #8B5CF6 (purple)
  - analytics-server: #F97316 (orange)
  - notification-server: #EC4899 (pink)
  - product-server: #6366F1 (indigo)
  - order-server: #EF4444 (red)
- **PageCard.astro Updates**:
  - Removed hardcoded `serverColors` and `serverNames` objects
  - Added `servers` prop to receive server data
  - Uses `servers[serverId]?.color` and `servers[serverId]?.name` dynamically
  - Fallback to gray (#6B7280) if server not found
- **ArchitectureDiagram Update**: Now passes servers data to PageCard component
- **Result**: Complete data-driven server theming without any hardcoded values

**Card Size Standardization** - Set maximum width of 600px for all card types:
- **Universal Max Width**: Applied `max-width: 600px` to all card types (page, server, backend, group)
- **Grid System Updates**: Modified all grid layouts to respect 600px maximum:
  - Pages grid: `grid-auto-columns: minmax(350px, 600px)`
  - Groups grid: `grid-auto-columns: minmax(350px, 600px)`
  - Servers grid: `grid-template-columns: repeat(auto-fit, minmax(350px, 600px))`
- **Responsive Consistency**: Updated all breakpoints to maintain 600px max across screen sizes
- **Visual Uniformity**: Prevents cards from becoming too wide on large screens
- **Layout Control**: Provides consistent card sizing regardless of content length
- **Result**: Uniform card appearance with controlled maximum width across all components

**Extended Space for 100+ Cards** - Redesigned layout to support large-scale card collections without overlap:
- **Grid Capacity Expansion**:
  - Limited to exactly 4 rows per column (maximum 4 cards vertically)
  - Changed from fixed width to `width: max-content` with `min-width: 100%`
  - Maintained `grid-auto-flow: column` for vertical stacking first
- **Container Width Enhancement**:
  - Expanded diagram content from 300% to 1000% width
  - Removed flex width constraints (`max-width: none`) on large screens
  - Changed to `justify-content: flex-start` for natural expansion
- **Responsive Grid Capacity**:
  - **All screen sizes**: 4 rows × unlimited columns = 100+ cards
  - **Large screens (1400px+)**: 4 cards per column with 400-600px width
  - **Medium screens (768-1399px)**: 4 cards per column with 350-600px width
  - **Small screens (≤767px)**: 4 cards per column with 280-600px width
  - **Very small screens (<480px)**: 4 cards per column with 250-600px width
- **Backend Grid Support**: Added dedicated `.backends-grid` styling with same expansion capabilities
- **Performance Optimizations**: Added `contain: layout style paint` and `will-change: transform` for smooth scrolling
- **Layout Flow**: Cards fill vertically first (4 per column), then create new columns horizontally
- **Scrolling Behavior**: Smooth horizontal scrolling with `scroll-behavior: smooth`
- **Result**: Supports 100+ cards in each section (Pages, Servers, Backends) without overlap, with unlimited horizontal scaling
- **Layout Rule**: Maximum 4 cards from top to bottom in each column for all components (pages, servers, backends, groups)