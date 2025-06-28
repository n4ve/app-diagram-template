/**
 * CONNECTION-AREA COMPONENT: Hover Event Management Module
 * Used by: ConnectionArea component only
 * Purpose: Coordinates all hover interactions, event handling, and connection drawing
 */
export class HoverEventManager {
    constructor(relationshipManager, animationManager, connectionManager) {
        this.relationshipManager = relationshipManager;
        this.animationManager = animationManager;
        this.connectionManager = connectionManager;
        this.isResettingCards = false;
        this.resetTimeout = null;
    }

    initialize() {
        this.setupPageCardHovers();
        this.setupServerCardHovers();
        this.setupGlobalMouseLeave();
    }

    setupPageCardHovers() {
        this.relationshipManager.pageCards.forEach(pageCard => {
            pageCard.addEventListener('mouseenter', (e) => {
                this.handleCardHover(e.target);
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
        this.relationshipManager.serverCards.forEach(serverCard => {
            serverCard.addEventListener('mouseenter', (e) => {
                this.handleCardHover(e.target);
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
    }

    handleCardHover(card) {
        console.log('Card hover triggered:', card.className);
        
        // Cancel any pending reset
        this.cancelReset();
        
        // Clear previous state
        this.connectionManager.clearConnections();
        
        // Find all related cards using JSON API mappings
        const relatedElements = this.relationshipManager.findRelatedCards(card);
        console.log('Found related cards:', relatedElements.length);
        
        // Set active classes
        this.relationshipManager.setActiveClasses(card, relatedElements);
        
        // Animate card positions
        this.animationManager.repositionRelatedCards(card, relatedElements).then(() => {
            // Draw connections after repositioning
            setTimeout(() => {
                if (card.classList.contains('page-card')) {
                    card.drawConnections();
                } else {
                    card.drawServerConnections();
                }
            }, 50);
        });
    }

    handleCardLeave(e) {
        const relatedTarget = e.relatedTarget;
        
        // Don't reset if moving to another card or staying within the diagram
        if (relatedTarget && (
            relatedTarget.closest('.page-card') || 
            relatedTarget.closest('.server-card') ||
            relatedTarget.closest('#diagram-container')
        )) {
            return;
        }
        
        this.scheduleReset();
    }

    scheduleReset() {
        if (this.isResettingCards) return;
        
        this.cancelReset();
        this.resetTimeout = setTimeout(() => {
            this.resetAllCards();
        }, 200);
    }

    cancelReset() {
        if (this.resetTimeout) {
            clearTimeout(this.resetTimeout);
            this.resetTimeout = null;
        }
    }

    resetAllCards() {
        console.log('Resetting all cards');
        this.isResettingCards = true;
        
        // Clear connections
        this.connectionManager.clearConnections();
        
        // Clear active classes
        this.relationshipManager.clearActiveClasses();
        
        // Reset positions
        this.animationManager.positionManager.resetAllCardPositions();
        
        // Remove focus effect
        const diagramContainer = document.getElementById('diagram-container');
        if (diagramContainer) {
            diagramContainer.classList.remove('diagram-focused');
        }
        
        this.isResettingCards = false;
    }

    drawPageConnections(pageCard) {
        if (!this.connectionManager.connectionSvg) return;
        
        const pageApis = JSON.parse(pageCard.dataset.apis || '[]');
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
                const line = this.connectionManager.createConnectionLine(
                    pageApiElement, serverApiElement, color, method
                );
                if (line) {
                    line.setAttribute('stroke-width', '4');
                    line.setAttribute('opacity', '0.9');
                    this.connectionManager.connectionSvg.appendChild(line);
                }
            }
        });
    }

    drawServerConnections(serverCard) {
        // Implementation similar to drawPageConnections but from server perspective
        this.connectionManager.drawConnectionsForActiveCards();
    }
}