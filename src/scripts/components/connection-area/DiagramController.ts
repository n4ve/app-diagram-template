// ConnectionArea Component - Main Diagram Controller
import { ConnectionManager } from '../../shared/ConnectionManager.js';
import { CardRelationshipManager } from '../../shared/CardRelationshipManager.js';
import { CardPositionManager } from '../../shared/CardPositionManager.js';
import { GroupFilterManager } from '../../shared/GroupFilterManager.js';
import { CardAnimationManager } from './CardAnimationManager.js';
import { HoverEventManager } from './HoverEventManager.js';

import type { 
    DiagramController as IDiagramController,
    ConnectionManager as IConnectionManager,
    CardRelationshipManager as ICardRelationshipManager,
    CardPositionManager as ICardPositionManager,
    GroupFilterManager as IGroupFilterManager,
    CardAnimationManager as ICardAnimationManager,
    HoverEventManager as IHoverEventManager
} from '../../../types/index.js';

export class DiagramController implements IDiagramController {
    private connectionManager: IConnectionManager;
    private relationshipManager: ICardRelationshipManager;
    private positionManager: ICardPositionManager;
    private groupFilterManager: IGroupFilterManager;
    private animationManager: ICardAnimationManager;
    private hoverEventManager: IHoverEventManager;
    
    // View mode management
    private currentViewMode: 'page' | 'group' = 'page';
    
    // Zoom and pan management
    private currentZoom: number = 1;
    private currentPanX: number = 0;
    private currentPanY: number = 0;
    private readonly minZoom: number = 0.1;
    private readonly maxZoom: number = 3;
    private readonly zoomStep: number = 0.75;
    private isPanning: boolean = false;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    
    // View toggle elements
    private viewToggleButtons: NodeListOf<HTMLElement> | null = null;
    private pageView: HTMLElement | null = null;
    private groupView: HTMLElement | null = null;
    private columnTitle: HTMLElement | null = null;
    
    // Zoom and pan elements
    private diagramContainer: HTMLElement | null = null;
    private diagramContent: HTMLElement | null = null;
    private zoomInBtn: HTMLElement | null = null;
    private zoomOutBtn: HTMLElement | null = null;
    private zoomResetBtn: HTMLElement | null = null;
    private zoomLevel: HTMLElement | null = null;

    constructor() {
        this.connectionManager = new ConnectionManager();
        this.relationshipManager = new CardRelationshipManager();
        this.positionManager = new CardPositionManager();
        this.groupFilterManager = new GroupFilterManager();
        this.animationManager = new CardAnimationManager(this.positionManager, this.connectionManager);
        this.hoverEventManager = new HoverEventManager(
            this.relationshipManager, 
            this.animationManager, 
            this.connectionManager
        );
    }

    async initialize(): Promise<boolean> {
        try {
            // Initialize view toggle functionality FIRST to ensure elements are found
            this.initializeViewToggle();
            
            // Wait for DOM to be ready
            await this.waitForElements();
            
            // Initialize all managers in order
            if (!this.connectionManager.initialize()) {
                console.error('Failed to initialize ConnectionManager');
                return false;
            }
            
            if (!this.relationshipManager.initialize()) {
                console.error('Failed to initialize CardRelationshipManager');
                return false;
            }

            if (!this.positionManager.initialize()) {
                console.error('Failed to initialize CardPositionManager');
                return false;
            }

            if (!this.groupFilterManager.initialize()) {
                console.error('Failed to initialize GroupFilterManager');
                return false;
            }

            if (!this.animationManager.initialize()) {
                console.error('Failed to initialize CardAnimationManager');
                return false;
            }
            
            // Initialize event handling
            if (!this.hoverEventManager.initialize()) {
                console.error('Failed to initialize HoverEventManager');
                return false;
            }
            
            // Initialize zoom and pan functionality
            this.initializeZoomAndPan();
            
            // Initialize card visibility
            this.initializeCardVisibility();
            
            return true;
        } catch (error) {
            console.error('Error during diagram controller initialization:', error);
            return false;
        }
    }

    private waitForElements(): Promise<void> {
        return new Promise((resolve) => {
            const checkElements = () => {
                // Check for either page cards or group cards depending on current view
                const pageCards = document.querySelectorAll('.page-card');
                const groupCards = document.querySelectorAll('.group-card');
                const serverCards = document.querySelectorAll('.server-card');
                const connectionSvg = document.getElementById('connection-svg');
                
                const hasCards = (this.currentViewMode === 'page' ? pageCards.length > 0 : groupCards.length > 0) || pageCards.length > 0;
                
                if (hasCards && serverCards.length > 0 && connectionSvg) {
                    resolve();
                } else {
                    setTimeout(checkElements, 100);
                }
            };
            checkElements();
        });
    }

    private initializeCardVisibility(): void {
        const allCards = document.querySelectorAll('.page-card, .server-card, .group-card') as NodeListOf<HTMLElement>;
        allCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translate(0px, 0px) scale(1)';
            card.style.pointerEvents = 'auto';
            card.style.transition = 'all 0.3s ease';
            card.style.zIndex = '';
            card.style.position = '';
        });
    }

    // Public API methods
    resetDiagram(): void {
        this.hoverEventManager.resetAllCards();
    }

    getConnectionManager(): IConnectionManager {
        return this.connectionManager;
    }

    getRelationshipManager(): ICardRelationshipManager {
        return this.relationshipManager;
    }

    getPositionManager(): ICardPositionManager {
        return this.positionManager;
    }

    getAnimationManager(): ICardAnimationManager {
        return this.animationManager;
    }

    getHoverEventManager(): IHoverEventManager {
        return this.hoverEventManager;
    }
    
    // View toggle functionality
    private initializeViewToggle(): void {
        console.log('DiagramController: Initializing view toggle');
        this.viewToggleButtons = document.querySelectorAll('.view-toggle-button');
        this.pageView = document.getElementById('page-view');
        this.groupView = document.getElementById('group-view');
        this.columnTitle = document.getElementById('pages-column-title');
        
        console.log('DiagramController: Found', this.viewToggleButtons.length, 'toggle buttons');
        console.log('DiagramController: pageView:', this.pageView);
        console.log('DiagramController: groupView:', this.groupView);
        console.log('DiagramController: columnTitle:', this.columnTitle);
        
        if (this.viewToggleButtons) {
            this.viewToggleButtons.forEach(button => {
                console.log('DiagramController: Adding click handler to button with data-view:', button.dataset.view);
                button.addEventListener('click', (e) => this.handleViewToggle(e));
            });
        }
        
    }
    
    private handleViewToggle(event: Event): void {
        console.log('DiagramController: handleViewToggle called');
        const button = event.currentTarget as HTMLElement;
        const targetView = button.dataset.view as 'page' | 'group';
        
        console.log('DiagramController: Target view:', targetView, 'Current view:', this.currentViewMode);
        
        if (targetView && targetView !== this.currentViewMode) {
            this.setViewMode(targetView);
        }
    }
    
    
    private setViewMode(mode: 'page' | 'group'): void {
        console.log('DiagramController: Setting view mode to', mode);
        this.currentViewMode = mode;
        
        // Update UI elements
        this.updateViewToggleButtons();
        this.updateViewDisplay();
        this.updateColumnTitle();
        
        // Notify GroupFilterManager of view mode change
        this.groupFilterManager.setViewMode(mode);
        
        // Reset diagram state
        this.resetDiagram();
        
        // Reinitialize connections for new view
        setTimeout(() => {
            console.log('DiagramController: Reinitializing connections for', mode, 'view');
            
            // Clear existing connections first
            this.connectionManager.clearConnections();
            
            // Wait for DOM to update
            setTimeout(() => {
                // Reinitialize managers with new view
                this.connectionManager.initialize();
                this.relationshipManager.initialize();
                this.positionManager.initialize();
                this.animationManager.initialize();
                this.hoverEventManager.initialize();
                
                // Reinitialize card visibility for new view
                this.initializeCardVisibility();
                
                console.log('DiagramController: Reinitialization complete for', mode, 'view');
            }, 200);
        }, 100);
    }
    
    private updateViewToggleButtons(): void {
        if (!this.viewToggleButtons) return;
        
        // Update button states
        this.viewToggleButtons.forEach(button => {
            const buttonView = button.dataset.view;
            if (buttonView === this.currentViewMode) {
                button.classList.add('active');
                button.classList.add('text-white');
                button.classList.remove('text-gray-700', 'hover:text-gray-900');
            } else {
                button.classList.remove('active');
                button.classList.remove('text-white');
                button.classList.add('text-gray-700', 'hover:text-gray-900');
            }
        });
        
        // Update slider position
        const slider = document.getElementById('toggle-slider');
        if (slider) {
            if (this.currentViewMode === 'group') {
                // Move slider to second button position
                const buttons = document.querySelectorAll('.view-toggle-button');
                if (buttons.length > 1) {
                    const secondButton = buttons[1] as HTMLElement;
                    const firstButton = buttons[0] as HTMLElement;
                    const offset = secondButton.offsetLeft - firstButton.offsetLeft;
                    // If offset is 0 (test environment), use 50% for consistency
                    if (offset === 0) {
                        slider.style.left = '50%';
                    } else {
                        slider.style.left = `calc(0.5rem + ${offset}px)`;
                    }
                } else {
                    slider.style.left = '50%';
                }
            } else {
                slider.style.left = '0.5rem'; // Default left position
            }
        }
        
        // Update description
        const viewTitle = document.getElementById('view-title');
        const viewDescription = document.getElementById('view-description');
        if (viewTitle && viewDescription) {
            if (this.currentViewMode === 'page') {
                viewTitle.textContent = 'Individual Page View';
                viewDescription.textContent = 'Show individual pages and their specific API connections';
            } else {
                viewTitle.textContent = 'Application Group View';
                viewDescription.textContent = 'Show application groups with merged API connections';
            }
        }
    }
    
    private updateViewDisplay(): void {
        console.log('DiagramController: Updating view display for', this.currentViewMode);
        console.log('DiagramController: pageView element:', this.pageView);
        console.log('DiagramController: groupView element:', this.groupView);
        
        if (this.pageView && this.groupView) {
            // Log current state
            console.log('DiagramController: pageView classes before:', this.pageView.className);
            console.log('DiagramController: groupView classes before:', this.groupView.className);
            
            if (this.currentViewMode === 'page') {
                console.log('DiagramController: Showing page view, hiding group view');
                // Remove hidden from page view
                this.pageView.classList.remove('hidden');
                this.pageView.style.display = '';
                // Add hidden to group view
                this.groupView.classList.add('hidden');
                this.groupView.style.display = 'none';
            } else {
                console.log('DiagramController: Showing group view, hiding page view');
                // Add hidden to page view
                this.pageView.classList.add('hidden');
                this.pageView.style.display = 'none';
                // Remove hidden from group view
                this.groupView.classList.remove('hidden');
                this.groupView.style.display = '';
            }
            
            // Force reflow
            void this.pageView.offsetHeight;
            void this.groupView.offsetHeight;
            
            // Log after state
            console.log('DiagramController: pageView classes after:', this.pageView.className);
            console.log('DiagramController: groupView classes after:', this.groupView.className);
            
            // Check computed styles
            const pageViewStyle = window.getComputedStyle(this.pageView);
            const groupViewStyle = window.getComputedStyle(this.groupView);
            console.log('DiagramController: pageView display:', pageViewStyle.display);
            console.log('DiagramController: groupView display:', groupViewStyle.display);
        } else {
            console.error('DiagramController: Could not find page/group view elements');
        }
    }
    
    private updateColumnTitle(): void {
        if (this.columnTitle) {
            const icon = this.currentViewMode === 'page' ? '📱' : '📂';
            const text = this.currentViewMode === 'page' ? 'Frontend Pages' : 'Application Groups';
            this.columnTitle.textContent = `${icon} ${text}`;
        }
    }
    
    // Public methods for view mode
    getCurrentViewMode(): 'page' | 'group' {
        return this.currentViewMode;
    }
    
    switchToPageView(): void {
        this.setViewMode('page');
    }
    
    switchToGroupView(): void {
        this.setViewMode('group');
    }
    
    // Zoom and pan functionality
    private initializeZoomAndPan(): void {
        this.diagramContainer = document.getElementById('diagram-container');
        this.diagramContent = document.getElementById('diagram-content');
        this.zoomInBtn = document.getElementById('zoom-in');
        this.zoomOutBtn = document.getElementById('zoom-out');
        this.zoomResetBtn = document.getElementById('zoom-reset');
        this.zoomLevel = document.getElementById('zoom-level');
        
        if (this.zoomInBtn) {
            this.zoomInBtn.addEventListener('click', () => this.handleZoomIn());
        }
        
        if (this.zoomOutBtn) {
            this.zoomOutBtn.addEventListener('click', () => this.handleZoomOut());
        }
        
        if (this.zoomResetBtn) {
            this.zoomResetBtn.addEventListener('click', () => this.handleZoomReset());
        }
        
        // Initialize pan and zoom interactions
        this.initializePanAndZoomInteractions();
        
        // Initialize keyboard shortcuts
        this.initializeKeyboardShortcuts();
        
        // Initialize display
        this.updateTransform();
    }
    
    private initializePanAndZoomInteractions(): void {
        if (!this.diagramContainer) return;
        
        // Mouse events for panning
        this.diagramContainer.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.diagramContainer.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.diagramContainer.addEventListener('mouseup', () => this.handleMouseUp());
        this.diagramContainer.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.diagramContainer.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Touch events
        this.diagramContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.diagramContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.diagramContainer.addEventListener('touchend', () => this.handleTouchEnd());
    }
    
    private initializeKeyboardShortcuts(): void {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    private updateTransform(): void {
        if (this.diagramContent) {
            this.diagramContent.classList.add('no-transition');
            this.diagramContent.style.transform = `translate(${this.currentPanX}px, ${this.currentPanY}px) scale(${this.currentZoom})`;
            this.diagramContent.style.transformOrigin = '0 0';
            
            requestAnimationFrame(() => {
                if (this.diagramContent) {
                    this.diagramContent.classList.remove('no-transition');
                }
            });
        }
        
        if (this.zoomLevel) {
            this.zoomLevel.textContent = `${Math.round(this.currentZoom * 100)}%`;
        }
        
        this.updateZoomButtonStates();
    }
    
    private updateZoomButtonStates(): void {
        if (this.zoomInBtn) {
            this.zoomInBtn.classList.toggle('opacity-50', this.currentZoom >= this.maxZoom);
        }
        
        if (this.zoomOutBtn) {
            this.zoomOutBtn.classList.toggle('opacity-50', this.currentZoom <= this.minZoom);
        }
    }
    
    private zoomAtPoint(deltaZoom: number, clientX: number, clientY: number): void {
        if (!this.diagramContainer) return;
        
        const rect = this.diagramContainer.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        const contentX = (x - this.currentPanX) / this.currentZoom;
        const contentY = (y - this.currentPanY) / this.currentZoom;
        
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.currentZoom + deltaZoom));
        
        this.currentPanX = x - contentX * newZoom;
        this.currentPanY = y - contentY * newZoom;
        this.currentZoom = newZoom;
        
        this.updateTransform();
    }
    
    private handleZoomIn(): void {
        if (!this.diagramContainer) return;
        const rect = this.diagramContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        this.zoomAtPoint(this.zoomStep * 2, centerX, centerY);
    }
    
    private handleZoomOut(): void {
        if (!this.diagramContainer) return;
        const rect = this.diagramContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        this.zoomAtPoint(-this.zoomStep * 2, centerX, centerY);
    }
    
    private handleZoomReset(): void {
        this.currentZoom = 1;
        this.currentPanX = 0;
        this.currentPanY = 0;
        this.updateTransform();
    }
    
    private handleMouseDown(e: MouseEvent): void {
        if (e.target && (e.target as Element).closest('.api-item, button, .view-toggle-button')) {
            return;
        }
        
        this.isPanning = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        if (this.diagramContainer) {
            this.diagramContainer.style.cursor = 'grabbing';
        }
        
        this.hoverEventManager.setDragState?.(true);
        e.preventDefault();
    }
    
    private handleMouseMove(e: MouseEvent): void {
        if (!this.isPanning) return;
        
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        this.currentPanX += deltaX;
        this.currentPanY += deltaY;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        this.updateTransform();
    }
    
    private handleMouseUp(): void {
        if (this.isPanning) {
            this.isPanning = false;
            if (this.diagramContainer) {
                this.diagramContainer.style.cursor = 'grab';
            }
            this.hoverEventManager.setDragState?.(false);
        }
    }
    
    private handleMouseLeave(): void {
        this.handleMouseUp();
    }
    
    private handleWheel(e: WheelEvent): void {
        e.preventDefault();
        const scrollSensitivity = 0.01;
        const deltaZoom = e.deltaY * -scrollSensitivity;
        this.zoomAtPoint(deltaZoom, e.clientX, e.clientY);
    }
    
    private handleTouchStart(e: TouchEvent): void {
        if (e.touches.length === 1) {
            this.isPanning = true;
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
            this.hoverEventManager.setDragState?.(true);
        }
        e.preventDefault();
    }
    
    private handleTouchMove(e: TouchEvent): void {
        if (e.touches.length === 1 && this.isPanning) {
            const deltaX = e.touches[0].clientX - this.lastMouseX;
            const deltaY = e.touches[0].clientY - this.lastMouseY;
            
            this.currentPanX += deltaX;
            this.currentPanY += deltaY;
            
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
            
            this.updateTransform();
        }
        e.preventDefault();
    }
    
    private handleTouchEnd(): void {
        if (this.isPanning) {
            this.isPanning = false;
            this.hoverEventManager.setDragState?.(false);
        }
    }
    
    private handleKeyDown(e: KeyboardEvent): void {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '=':
                case '+':
                    e.preventDefault();
                    this.handleZoomIn();
                    break;
                case '-':
                    e.preventDefault();
                    this.handleZoomOut();
                    break;
                case '0':
                    e.preventDefault();
                    this.handleZoomReset();
                    break;
            }
        } else {
            const panSpeed = 30;
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.currentPanY += panSpeed;
                    this.updateTransform();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.currentPanY -= panSpeed;
                    this.updateTransform();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.currentPanX += panSpeed;
                    this.updateTransform();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.currentPanX -= panSpeed;
                    this.updateTransform();
                    break;
            }
        }
    }
}