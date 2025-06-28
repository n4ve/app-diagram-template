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
    HttpMethod
} from '../../../types/index.js';

// Extend HTMLElement interface to include custom methods
declare global {
    interface HTMLElement {
        drawConnections?: () => void;
        drawServerConnections?: () => void;
        resetAll?: () => void;
    }
}

export class HoverEventManager implements IHoverEventManager {
    private relationshipManager: CardRelationshipManager;
    private animationManager: CardAnimationManager;
    private connectionManager: ConnectionManager;
    private isResettingCards: boolean = false;
    private resetTimeout: number | null = null;
    private isProcessing: boolean = false;

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
            this.setupServerCardHovers();
            this.setupGlobalMouseLeave();
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

            // Add connection drawing method
            serverCard.drawServerConnections = () => {
                this.drawServerConnections(serverCard);
            };
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
            if (!target.closest('.page-card') && !target.closest('.server-card')) {
                this.scheduleReset();
            }
        });
    }

    handleCardHover(card: HTMLElement): void {
        if (this.isProcessing) return;
        
        console.log('Card hover triggered:', card.className);
        
        this.isProcessing = true;
        
        // Cancel any pending reset
        this.cancelReset();
        
        // Clear previous state
        this.connectionManager.clearConnections();
        
        // Find all related cards using JSON API mappings
        const relatedElements: RelatedElements = this.relationshipManager.findRelatedCards(card);
        console.log('Found related elements:', {
            pages: relatedElements.pages.length,
            servers: relatedElements.servers.length,
            apiItems: relatedElements.apiItems.length
        });
        
        // Set active classes
        this.relationshipManager.setActiveClasses(card, relatedElements);
        
        // Animate card positions
        this.animationManager.repositionRelatedCards(card, relatedElements).then(() => {
            // Draw connections after repositioning
            setTimeout(() => {
                if (card.classList.contains('page-card')) {
                    card.drawConnections?.();
                } else if (card.classList.contains('server-card')) {
                    card.drawServerConnections?.();
                }
                this.isProcessing = false;
            }, 50);
        }).catch(error => {
            console.error('Error during card repositioning:', error);
            this.isProcessing = false;
        });
    }

    private handleCardLeave(e: MouseEvent): void {
        const relatedTarget = e.relatedTarget as HTMLElement | null;
        const sourceCard = (e.target as HTMLElement)?.closest('.page-card, .server-card');
        
        console.log(`🚪 Card leave event - from: ${sourceCard?.className}, to: ${relatedTarget?.className}`);
        
        // Only prevent reset if moving to another card, not just any diagram element
        if (relatedTarget && (
            relatedTarget.closest('.page-card') || 
            relatedTarget.closest('.server-card')
        )) {
            console.log('🚪 Not resetting - moving to another card');
            return;
        }
        
        console.log('🚪 Triggering reset due to card leave');
        this.scheduleReset();
    }

    private scheduleReset(): void {
        if (this.isResettingCards) return;
        
        console.log('🔄 Reset triggered immediately - no delay');
        this.cancelReset();
        this.resetAllCards(); // Execute immediately, no timeout
    }

    private cancelReset(): void {
        if (this.resetTimeout) {
            clearTimeout(this.resetTimeout);
            this.resetTimeout = null;
        }
    }

    resetAllCards(): void {
        console.log('Resetting all cards');
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
            const allCards = document.querySelectorAll('.page-card, .server-card') as NodeListOf<HTMLElement>;
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

    private drawPageConnections(pageCard: HTMLElement): void {
        const pageApisData = pageCard.dataset.apis;
        if (!pageApisData) return;

        const pageApis: string[] = JSON.parse(pageApisData);
        console.log('Drawing connections for APIs:', pageApis);
        
        pageApis.forEach(api => {
            const [serverId, apiPath] = api.split(':');
            const method = apiPath.trim().split(' ')[0] as HttpMethod;
            const fullApiPath = apiPath.trim();
            const color = this.connectionManager.getMethodColor(method);
            
            // Find page API element
            const pageApiElement = pageCard.querySelector(`[data-full-api="${api}"]`) as HTMLElement;
            
            // Find server API element
            const serverCard = document.querySelector(`[data-server="${serverId}"]`) as HTMLElement;
            let serverApiElement: HTMLElement | null = null;
            
            if (serverCard) {
                const serverApiElements = serverCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
                serverApiElements.forEach(element => {
                    const serverApiText = element.dataset.apiText || element.textContent?.trim();
                    if (serverApiText === fullApiPath) {
                        serverApiElement = element;
                    }
                });
            }
            
            if (pageApiElement && serverApiElement) {
                // Highlight the API elements
                (pageApiElement as HTMLElement).classList.add('highlighted');
                (serverApiElement as HTMLElement).classList.add('highlighted');
                
                // Get element positions for logging
                const pageRect = (pageApiElement as HTMLElement).getBoundingClientRect();
                const serverRect = (serverApiElement as HTMLElement).getBoundingClientRect();
                
                console.log(`🔗 HOVER CONNECTION LINE #${pageApis.indexOf(api) + 1}:`);
                console.log(`   📍 FROM: Page API "${fullApiPath}" at (${Math.round(pageRect.left + pageRect.width/2)}, ${Math.round(pageRect.top + pageRect.height/2)})`);
                console.log(`   📍 TO: Server API "${fullApiPath}" at (${Math.round(serverRect.left + serverRect.width/2)}, ${Math.round(serverRect.top + serverRect.height/2)})`);
                console.log(`   🎨 Color: ${color} (${method} method)`);
                console.log(`   🖥️ Server: ${serverId}`);
                
                const line = this.connectionManager.createConnectionLine(
                    pageApiElement, serverApiElement, color, method
                );
                if (line) {
                    line.setAttribute('stroke-width', '4');
                    line.setAttribute('opacity', '0.9');
                    line.classList.add('highlighted');
                    const svg = document.getElementById('connection-svg');
                    if (svg) {
                        svg.appendChild(line);
                        console.log(`   ✅ Hover line created and added to SVG`);
                    } else {
                        console.log(`   ❌ SVG not found - hover line not added`);
                    }
                } else {
                    console.log(`   ❌ Failed to create hover line`);
                }
            } else {
                console.log(`   ❌ Missing hover elements - pageApiElement: ${!!pageApiElement}, serverApiElement: ${!!serverApiElement}`);
            }
        });
    }

    private drawServerConnections(serverCard: HTMLElement): void {
        const hoveredServerId = serverCard.dataset.server;
        if (!hoveredServerId) return;

        // Find all pages that connect to this server
        const pageCards = document.querySelectorAll('.page-card') as NodeListOf<HTMLElement>;
        
        pageCards.forEach(pageCard => {
            const pageApisData = pageCard.dataset.apis;
            if (!pageApisData) return;

            const pageApis: string[] = JSON.parse(pageApisData);
            
            // Draw connections for APIs that connect to this server
            pageApis.forEach(api => {
                const [serverId, apiPath] = api.split(':');
                if (serverId !== hoveredServerId) return; // Only connect to this server
                
                const method = apiPath.trim().split(' ')[0] as HttpMethod;
                const fullApiPath = apiPath.trim();
                const color = this.connectionManager.getMethodColor(method);
                
                // Find page API element
                const pageApiElement = pageCard.querySelector(`[data-full-api="${api}"]`) as HTMLElement;
                
                // Find server API element
                let serverApiElement: HTMLElement | null = null;
                const serverApiElements = serverCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
                serverApiElements.forEach(element => {
                    const serverApiText = element.dataset.apiText || element.textContent?.trim();
                    if (serverApiText === fullApiPath) {
                        serverApiElement = element;
                    }
                });
                
                if (pageApiElement && serverApiElement) {
                    // Highlight the API elements
                    (pageApiElement as HTMLElement).classList.add('highlighted');
                    (serverApiElement as HTMLElement).classList.add('highlighted');
                    
                    const line = this.connectionManager.createConnectionLine(
                        pageApiElement, serverApiElement, color, method
                    );
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
}