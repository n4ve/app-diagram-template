/**
 * CONNECTION-AREA COMPONENT: Hover Event Management Module
 * Used by: ConnectionArea component only
 * Purpose: Coordinates all hover interactions, event handling, and connection drawing
 */
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
            // Add connection drawing method
            pageCard.drawConnections = () => {
                this.drawPageConnections(pageCard);
            };
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
            // Add connection drawing method
            serverCard.drawServerConnections = () => {
                this.drawServerConnections(serverCard);
            };
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
            if (!target.closest('.page-card') && !target.closest('.server-card')) {
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
                if (card.classList.contains('page-card')) {
                    card.drawConnections?.();
                }
                else if (card.classList.contains('server-card')) {
                    card.drawServerConnections?.();
                }
                this.isProcessing = false;
            }, 50);
        }).catch(error => {
            console.error('Error during card repositioning:', error);
            this.isProcessing = false;
        });
    }
    handleCardLeave(e) {
        const relatedTarget = e.relatedTarget;
        const sourceCard = e.target?.closest('.page-card, .server-card');
        // Only prevent reset if moving to another card, not just any diagram element
        if (relatedTarget && (relatedTarget.closest('.page-card') ||
            relatedTarget.closest('.server-card'))) {
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
        this.resetAllCards(); // Execute immediately, no timeout
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
            const allCards = document.querySelectorAll('.page-card, .server-card');
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
    drawPageConnections(pageCard) {
        const pageApisData = pageCard.dataset.apis;
        if (!pageApisData)
            return;
        const pageApis = JSON.parse(pageApisData);
        console.log('Drawing connections for APIs:', pageApis);
        pageApis.forEach(api => {
            const [serverId, apiPath] = api.split(':');
            const method = apiPath.trim().split(' ')[0];
            const fullApiPath = apiPath.trim();
            const color = this.connectionManager.getMethodColor(method);
            // Find page API element
            const pageApiElement = pageCard.querySelector(`[data-full-api="${api}"]`);
            // Find server API element
            const serverCard = document.querySelector(`[data-server="${serverId}"]`);
            let serverApiElement = null;
            if (serverCard) {
                const serverApiElements = serverCard.querySelectorAll('.api-item');
                serverApiElements.forEach(element => {
                    const serverApiText = element.dataset.apiText || element.textContent?.trim();
                    if (serverApiText === fullApiPath) {
                        serverApiElement = element;
                    }
                });
            }
            if (pageApiElement && serverApiElement) {
                // Highlight the API elements
                pageApiElement.classList.add('highlighted');
                serverApiElement.classList.add('highlighted');
                // Get element positions for logging
                const pageRect = pageApiElement.getBoundingClientRect();
                const serverRect = serverApiElement.getBoundingClientRect();
                const line = this.connectionManager.createConnectionLine(pageApiElement, serverApiElement, color, method);
                if (line) {
                    line.setAttribute('stroke-width', '4');
                    line.setAttribute('opacity', '0.9');
                    line.classList.add('highlighted');
                    const svg = document.getElementById('connection-svg');
                    if (svg) {
                        svg.appendChild(line);
                    }
                    else {
                    }
                }
                else {
                    console.log(`   ❌ Failed to create hover line`);
                }
            }
            else {
                console.log(`   ❌ Missing hover elements - pageApiElement: ${!!pageApiElement}, serverApiElement: ${!!serverApiElement}`);
            }
        });
    }
    drawServerConnections(serverCard) {
        const hoveredServerId = serverCard.dataset.server;
        if (!hoveredServerId)
            return;
        // Find all pages that connect to this server
        const pageCards = document.querySelectorAll('.page-card');
        pageCards.forEach(pageCard => {
            const pageApisData = pageCard.dataset.apis;
            if (!pageApisData)
                return;
            const pageApis = JSON.parse(pageApisData);
            // Draw connections for APIs that connect to this server
            pageApis.forEach(api => {
                const [serverId, apiPath] = api.split(':');
                if (serverId !== hoveredServerId)
                    return; // Only connect to this server
                const method = apiPath.trim().split(' ')[0];
                const fullApiPath = apiPath.trim();
                const color = this.connectionManager.getMethodColor(method);
                // Find page API element
                const pageApiElement = pageCard.querySelector(`[data-full-api="${api}"]`);
                // Find server API element
                let serverApiElement = null;
                const serverApiElements = serverCard.querySelectorAll('.api-item');
                serverApiElements.forEach(element => {
                    const serverApiText = element.dataset.apiText || element.textContent?.trim();
                    if (serverApiText === fullApiPath) {
                        serverApiElement = element;
                    }
                });
                if (pageApiElement && serverApiElement) {
                    // Highlight the API elements
                    pageApiElement.classList.add('highlighted');
                    serverApiElement.classList.add('highlighted');
                    const line = this.connectionManager.createConnectionLine(pageApiElement, serverApiElement, color, method);
                    if (line) {
                        line.setAttribute('stroke-width', '4');
                        line.setAttribute('opacity', '0.9');
                        line.classList.add('highlighted');
                        const svg = document.getElementById('connection-svg');
                        if (svg) {
                            svg.appendChild(line);
                        }
                    }
                }
            });
        });
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
