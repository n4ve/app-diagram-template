/**
 * CONNECTION-AREA COMPONENT: Hover Event Management Module
 * Used by: ConnectionArea component only
 * Purpose: Coordinates all hover interactions, event handling, and connection drawing
 */
import { ConnectionType } from '../../../types/index.js';
export class HoverEventManager {
    relationshipManager;
    animationManager;
    connectionManager;
    isResettingCards = false;
    resetTimeout = null;
    isProcessing = false;
    isDragging = false;
    constructor(relationshipManager, animationManager, connectionManager) {
        this.relationshipManager = relationshipManager;
        this.animationManager = animationManager;
        this.connectionManager = connectionManager;
        this.isResettingCards = false;
        this.resetTimeout = null;
        this.isProcessing = false;
    }
    initialize() {
        try {
            this.setupPageCardHovers();
            this.setupServerCardHovers();
            this.setupBackendCardHovers();
            this.setupGlobalMouseLeave();
            return true;
        }
        catch (error) {
            console.error('Failed to initialize hover event manager:', error);
            return false;
        }
    }
    setupPageCardHovers() {
        const pageCards = document.querySelectorAll('.page-card');
        pageCards.forEach(pageCard => {
            pageCard.addEventListener('mouseenter', (e) => {
                const target = e.target;
                this.handleCardHover(target);
            });
            pageCard.addEventListener('mouseleave', (e) => {
                this.handleCardLeave(e);
            });
            // Add reset method
            pageCard.resetAll = () => {
                this.resetAllCards();
            };
        });
    }
    setupServerCardHovers() {
        const serverCards = document.querySelectorAll('.server-card');
        serverCards.forEach(serverCard => {
            serverCard.addEventListener('mouseenter', (e) => {
                const target = e.target;
                this.handleCardHover(target);
            });
            serverCard.addEventListener('mouseleave', (e) => {
                this.handleCardLeave(e);
            });
        });
    }
    setupBackendCardHovers() {
        const backendCards = document.querySelectorAll('.backend-card');
        backendCards.forEach(backendCard => {
            backendCard.addEventListener('mouseenter', (e) => {
                const target = e.target;
                this.handleCardHover(target);
            });
            backendCard.addEventListener('mouseleave', (e) => {
                this.handleCardLeave(e);
            });
        });
    }
    setupGlobalMouseLeave() {
        const diagramContainer = document.getElementById('diagram-container');
        if (diagramContainer) {
            diagramContainer.addEventListener('mouseleave', () => {
                this.scheduleReset();
            });
        }
        // Also reset when clicking outside any card
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (!target.closest('.page-card') && !target.closest('.server-card') && !target.closest('.backend-card')) {
                this.scheduleReset();
            }
        });
    }
    handleCardHover(card) {
        if (this.isProcessing || this.isDragging)
            return;
        this.isProcessing = true;
        // Cancel any pending reset
        this.cancelReset();
        // Clear previous state
        this.connectionManager.clearConnections();
        // Find all related cards using JSON API mappings
        const relatedElements = this.relationshipManager.findRelatedCards(card);
        // Set active classes
        this.relationshipManager.setActiveClasses(card, relatedElements);
        // Animate card positions
        this.animationManager.repositionRelatedCards(card, relatedElements).then(() => {
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
    handleCardLeave(e) {
        const relatedTarget = e.relatedTarget;
        // Only prevent reset if moving to another card, not just any diagram element
        if (relatedTarget && (relatedTarget.closest('.page-card') ||
            relatedTarget.closest('.server-card') ||
            relatedTarget.closest('.backend-card'))) {
            console.log('🚪 Not resetting - moving to another card');
            return;
        }
        console.log('🚪 Triggering reset due to card leave');
        this.scheduleReset();
    }
    scheduleReset() {
        if (this.isResettingCards)
            return;
        this.cancelReset();
        // Add a longer delay before resetting to keep highlighting longer
        this.resetTimeout = window.setTimeout(() => {
            this.resetAllCards();
        }, 500); // 500ms delay before reset
    }
    cancelReset() {
        if (this.resetTimeout) {
            clearTimeout(this.resetTimeout);
            this.resetTimeout = null;
        }
    }
    resetAllCards() {
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
            const allCards = document.querySelectorAll('.page-card, .server-card, .backend-card');
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
    drawConnections(hoveredCard, relatedElements) {
        // Get unique connection pairs using the new method
        const connectionPairs = this.relationshipManager.getUniqueRelationPairs(hoveredCard, relatedElements);
        console.log(`Drawing ${connectionPairs.length} unique connection pairs`);
        // Debug: Show summary of connections
        const pageToServerCount = connectionPairs.filter(p => p.type === ConnectionType.PAGE_TO_SERVER).length;
        const serverToBackendCount = connectionPairs.filter(p => p.type === ConnectionType.SERVER_TO_BACKEND).length;
        console.log(`  - ${pageToServerCount} page-to-server connections`);
        console.log(`  - ${serverToBackendCount} server-to-backend connections`);
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
    drawConnection(connectionPair) {
        let color;
        let method;
        if (connectionPair.type === ConnectionType.PAGE_TO_SERVER) {
            // For API connections, use the HTTP method for color and styling
            method = connectionPair.method || 'GET';
            color = this.connectionManager.getMethodColor(method);
            // Highlight the API elements
            connectionPair.from.classList.add('highlighted');
            connectionPair.to.classList.add('highlighted');
        }
        else if (connectionPair.type === ConnectionType.SERVER_TO_BACKEND) {
            // For server-to-backend connections, use purple for database connections
            method = 'DB';
            color = '#8b5cf6';
        }
        else {
            // Fallback for any unknown connection types
            method = 'UNKNOWN';
            color = '#888888';
        }
        // Create the connection line
        const line = this.connectionManager.createConnectionLine(connectionPair.from, connectionPair.to, color, method);
        if (line) {
            line.setAttribute('stroke-width', '4');
            line.setAttribute('opacity', '0.9');
            line.classList.add('highlighted');
            const svg = document.getElementById('connection-svg');
            if (svg) {
                svg.appendChild(line);
                console.log(`✅ Successfully created ${connectionPair.type} connection line`);
            }
        }
        else {
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
    setDragState(isDragging) {
        this.isDragging = isDragging;
        // If starting to drag, reset any hover state immediately
        if (isDragging && !this.isResettingCards) {
            this.resetAllCards();
        }
    }
    getDragState() {
        return this.isDragging;
    }
}
