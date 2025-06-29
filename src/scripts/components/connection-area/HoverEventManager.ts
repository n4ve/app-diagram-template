/**
 * CONNECTION-AREA COMPONENT: Hover Event Management Module
 * Used by: ConnectionArea component only
 * Purpose: Coordinates all hover interactions, event handling, and connection drawing
 */

import type { 
    HoverEventManager as IHoverEventManager,
    RelatedElements,
    CardRelationshipManager,
    CardAnimationManager,
    ConnectionManager,
    HttpMethod,
    DiagramController,
    ConnectionPair
} from '../../../types/index.js';
import { ConnectionType } from '../../../types/index.js';

// Extend HTMLElement interface to include custom methods
declare global {
    interface HTMLElement {
        resetAll?: () => void;
    }
    
    interface Window {
        diagramController?: DiagramController;
    }
}

export class HoverEventManager implements IHoverEventManager {
    private relationshipManager: CardRelationshipManager;
    private animationManager: CardAnimationManager;
    private connectionManager: ConnectionManager;
    private isResettingCards: boolean = false;
    private resetTimeout: number | null = null;
    private isProcessing: boolean = false;
    private isDragging: boolean = false;
    private currentViewMode: 'page' | 'group' = 'page';

    constructor(
        relationshipManager: CardRelationshipManager, 
        animationManager: CardAnimationManager, 
        connectionManager: ConnectionManager
    ) {
        this.relationshipManager = relationshipManager;
        this.animationManager = animationManager;
        this.connectionManager = connectionManager;
        this.isResettingCards = false;
        this.resetTimeout = null;
        this.isProcessing = false;
    }

    initialize(): boolean {
        try {
            this.setupPageCardHovers();
            this.setupGroupCardHovers();
            this.setupServerCardHovers();
            this.setupBackendCardHovers();
            this.setupGlobalMouseLeave();
            this.setupViewModeListener();
            return true;
        } catch (error) {
            console.error('Failed to initialize hover event manager:', error);
            return false;
        }
    }

    private setupPageCardHovers(): void {
        const pageCards = document.querySelectorAll('.page-card') as NodeListOf<HTMLElement>;
        
        pageCards.forEach(pageCard => {
            pageCard.addEventListener('mouseenter', (e) => {
                const target = e.target as HTMLElement;
                this.handleCardHover(target);
            });

            pageCard.addEventListener('mouseleave', (e) => {
                this.handleCardLeave(e as MouseEvent);
            });

            // Add reset method
            pageCard.resetAll = () => {
                this.resetAllCards();
            };
        });
    }

    private setupGroupCardHovers(): void {
        const groupCards = document.querySelectorAll('.group-card') as NodeListOf<HTMLElement>;
        
        groupCards.forEach(groupCard => {
            groupCard.addEventListener('mouseenter', (e) => {
                const target = e.target as HTMLElement;
                this.handleCardHover(target);
            });

            groupCard.addEventListener('mouseleave', (e) => {
                this.handleCardLeave(e as MouseEvent);
            });

            // Add reset method
            groupCard.resetAll = () => {
                this.resetAllCards();
            };
        });
    }

    private setupViewModeListener(): void {
        document.addEventListener('viewModeChanged', (e: Event) => {
            const customEvent = e as CustomEvent;
            this.currentViewMode = customEvent.detail.viewMode;
            // Reset all connections when view mode changes
            this.resetAllCards();
        });
    }

    private setupServerCardHovers(): void {
        const serverCards = document.querySelectorAll('.server-card') as NodeListOf<HTMLElement>;
        
        serverCards.forEach(serverCard => {
            serverCard.addEventListener('mouseenter', (e) => {
                const target = e.target as HTMLElement;
                this.handleCardHover(target);
            });

            serverCard.addEventListener('mouseleave', (e) => {
                this.handleCardLeave(e as MouseEvent);
            });

        });
    }

    private setupBackendCardHovers(): void {
        const backendCards = document.querySelectorAll('.backend-card') as NodeListOf<HTMLElement>;
        
        backendCards.forEach(backendCard => {
            backendCard.addEventListener('mouseenter', (e) => {
                const target = e.target as HTMLElement;
                this.handleCardHover(target);
            });

            backendCard.addEventListener('mouseleave', (e) => {
                this.handleCardLeave(e as MouseEvent);
            });

        });
    }

    private setupGlobalMouseLeave(): void {
        const diagramContainer = document.getElementById('diagram-container');
        if (diagramContainer) {
            diagramContainer.addEventListener('mouseleave', () => {
                this.scheduleReset();
            });
        }
        
        // Also reset when clicking outside any card
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.page-card') && !target.closest('.group-card') && !target.closest('.server-card') && !target.closest('.backend-card')) {
                this.scheduleReset();
            }
        });
    }

    handleCardHover(card: HTMLElement): void {
        if (this.isProcessing || this.isDragging) return;
        
        this.isProcessing = true;
        
        const cardId = card.id || card.dataset.server || card.className;
        const cardRect = card.getBoundingClientRect();
        
        console.log(`👍 Hover triggered on card: ${cardId}`, {
            position: { x: cardRect.left, y: cardRect.top },
            size: { width: cardRect.width, height: cardRect.height },
            timestamp: new Date().toISOString()
        });
        
        // Cancel any pending reset
        this.cancelReset();
        
        // Clear previous state
        this.connectionManager.clearConnections();
        
        // Find all related cards using JSON API mappings
        const relatedElements: RelatedElements = this.relationshipManager.findRelatedCards(card);
        
        // Set active classes
        this.relationshipManager.setActiveClasses(card, relatedElements);
        
        // Animate card positions
        console.log(`🎨 Starting card repositioning animation for: ${cardId}`);
        this.animationManager.repositionRelatedCards(card, relatedElements).then(() => {
            console.log(`✅ Card repositioning completed for: ${cardId}`);
            // Draw connections after repositioning
            setTimeout(() => {
                this.drawConnections(card, relatedElements);
                this.isProcessing = false;
            }, 50);
        }).catch(error => {
            console.error('Error during card repositioning:', error);
            this.isProcessing = false;
        });
    }

    private handleCardLeave(e: MouseEvent): void {
        const relatedTarget = e.relatedTarget as HTMLElement | null;
        
        // Only prevent reset if moving to another card, not just any diagram element
        if (relatedTarget && (
            relatedTarget.closest('.page-card') || 
            relatedTarget.closest('.server-card') ||
            relatedTarget.closest('.backend-card')
        )) {
            console.log('🚪 Not resetting - moving to another card');
            return;
        }
        
        console.log('🚪 Triggering reset due to card leave');
        this.scheduleReset();
    }

    private scheduleReset(): void {
        if (this.isResettingCards) return;
        
        this.cancelReset();
        
        // Add a longer delay before resetting to keep highlighting longer
        this.resetTimeout = window.setTimeout(() => {
            this.resetAllCards();
        }, 500); // 500ms delay before reset
    }

    private cancelReset(): void {
        if (this.resetTimeout) {
            clearTimeout(this.resetTimeout);
            this.resetTimeout = null;
        }
    }

    resetAllCards(): void {
        console.log(`🔄 Resetting all cards to original positions`);
        
        this.isResettingCards = true;
        this.isProcessing = false;
        
        // Cancel any pending reset to avoid double execution
        this.cancelReset();
        
        // Clear connections
        this.connectionManager.clearConnections();
        
        // Clear active classes first
        this.relationshipManager.clearActiveClasses();
        
        // Reset positions using animation manager
        this.animationManager.resetAllCards().then(() => {
            // Ensure all cards are fully reset
            const allCards = document.querySelectorAll('.page-card, .server-card, .backend-card') as NodeListOf<HTMLElement>;
            allCards.forEach(card => {
                // Force remove any lingering styles
                card.style.removeProperty('transform');
                card.style.removeProperty('opacity');
                card.style.removeProperty('z-index');
                card.style.removeProperty('pointer-events');
                
                // Ensure default visibility
                card.style.opacity = '1';
                card.style.pointerEvents = 'auto';
                card.style.transform = 'none';
            });
            
            this.isResettingCards = false;
        }).catch(() => {
            this.isResettingCards = false;
        });
        
        // Remove focus effect
        const diagramContainer = document.getElementById('diagram-container');
        if (diagramContainer) {
            diagramContainer.classList.remove('diagram-focused');
        }
    }

    private drawConnections(hoveredCard: HTMLElement, relatedElements: RelatedElements): void {
        // Get unique connection pairs using the new method
        const connectionPairs = this.relationshipManager.getUniqueRelationPairs(hoveredCard, relatedElements);
        
        console.log(`Drawing ${connectionPairs.length} unique connection pairs`);
        
        // Debug: Show summary of connections - only show non-zero counts
        const pageToServerCount = connectionPairs.filter(p => p.type === ConnectionType.PAGE_TO_SERVER).length;
        const serverToBackendCount = connectionPairs.filter(p => p.type === ConnectionType.SERVER_TO_BACKEND).length;
        const grouptoToServerCount = connectionPairs.filter(p => p.type === ConnectionType.GROUP_TO_SERVER).length;
        
        if (pageToServerCount > 0) {
            console.log(`  - ${pageToServerCount} page-to-server connections`);
        }
        if (serverToBackendCount > 0) {
            console.log(`  - ${serverToBackendCount} server-to-backend connections`);
        }
        if (grouptoToServerCount > 0) {
            console.log(`  - ${grouptoToServerCount} group-to-server connections`);
        }
        
        // Draw each connection individually
        connectionPairs.forEach((pair, index) => {
            console.log(`📐 Connection ${index + 1}/${connectionPairs.length}:`, {
                type: pair.type,
                method: pair.method || 'N/A',
                api: pair.api || 'N/A',
                from: {
                    element: pair.from.tagName,
                    class: pair.from.className,
                    text: pair.from.textContent?.trim() || 'N/A',
                    dataset: pair.from.dataset
                },
                to: {
                    element: pair.to.tagName,
                    class: pair.to.className,
                    text: pair.to.textContent?.trim() || 'N/A',
                    dataset: pair.to.dataset
                }
            });
            this.drawConnection(pair);
        });
    }

    drawConnection(connectionPair: ConnectionPair): void {
        let color: string;
        let method: string;
        
        if (connectionPair.type === ConnectionType.PAGE_TO_SERVER) {
            // For API connections, use the HTTP method for color and styling
            method = connectionPair.method || 'GET';
            color = '#6B7280'; // Default grey, will be overridden by CSS data-method rules
            
            // Highlight the API elements
            connectionPair.from.classList.add('highlighted');
            connectionPair.to.classList.add('highlighted');
        } else if (connectionPair.type === ConnectionType.GROUP_TO_SERVER) {
            // For group-to-server connections, use teal color for group connections
            method = 'GROUP';
            color = '#14b8a6'; // teal-500
            
            // Highlight the group and server elements
            connectionPair.from.classList.add('highlighted');
            connectionPair.to.classList.add('highlighted');
        } else if (connectionPair.type === ConnectionType.SERVER_TO_BACKEND) {
            // For server-to-backend connections, use purple for database connections
            method = 'DB';
            color = '#8b5cf6';
        } else {
            // Fallback for any unknown connection types
            method = 'UNKNOWN';
            color = '#888888';
        }
        
        // Create the connection line
        const line = this.connectionManager.createConnectionLine(
            connectionPair.from, connectionPair.to, color, method
        );
        
        if (line) {
            line.setAttribute('stroke-width', '4');
            line.setAttribute('opacity', '0.9');
            line.classList.add('highlighted');
            const svg = document.getElementById('connection-svg');
            if (svg) {
                svg.appendChild(line);
                console.log(`✅ Successfully created ${connectionPair.type} connection line`);
            }
        } else {
            console.warn(`Failed to create connection line for ${connectionPair.type} connection`, {
                from: connectionPair.from,
                to: connectionPair.to,
                fromRect: connectionPair.from.getBoundingClientRect(),
                toRect: connectionPair.to.getBoundingClientRect(),
                svg: !!document.getElementById('connection-svg')
            });
        }
    }

    // Drag state management methods
    setDragState(isDragging: boolean): void {
        this.isDragging = isDragging;
        
        // If starting to drag, reset any hover state immediately
        if (isDragging && !this.isResettingCards) {
            this.resetAllCards();
        }
    }

    getDragState(): boolean {
        return this.isDragging;
    }
}