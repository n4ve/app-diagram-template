/**
 * CONNECTION-AREA COMPONENT: Card Animation and Repositioning Module
 * Used by: ConnectionArea component only
 * Purpose: Handles card movement animations, strategic positioning, and hiding unrelated cards
 */

import type { 
    CardAnimationManager as ICardAnimationManager,
    RelatedElements,
    CardPositionManager,
    ConnectionManager
} from '../../../types/index.js';

export class CardAnimationManager implements ICardAnimationManager {
    private positionManager: CardPositionManager;
    private connectionManager: ConnectionManager;
    private allCards: NodeListOf<HTMLElement> = document.querySelectorAll('.page-card, .server-card');
    private originalPositions: Map<HTMLElement, DOMRect> = new Map();

    constructor(positionManager: CardPositionManager, connectionManager: ConnectionManager) {
        this.positionManager = positionManager;
        this.connectionManager = connectionManager;
        this.allCards = document.querySelectorAll('.page-card, .server-card');
        this.originalPositions = new Map();
    }

    initialize(): boolean {
        this.allCards = document.querySelectorAll('.page-card, .server-card');
        
        // Store original positions
        this.allCards.forEach(card => {
            this.originalPositions.set(card, card.getBoundingClientRect());
        });

        if (this.allCards.length === 0) {
            console.error('No cards found for animation');
            return false;
        }
        return true;
    }

    async repositionRelatedCards(hoveredCard: HTMLElement, relatedElements: RelatedElements): Promise<void> {
        const allCards = document.querySelectorAll('.page-card, .server-card') as NodeListOf<HTMLElement>;
        const hoveredRect = hoveredCard.getBoundingClientRect();
        const diagramContainer = document.getElementById('diagram-container');
        const containerRect = diagramContainer?.getBoundingClientRect();
        
        if (!containerRect) return Promise.resolve();
        
        const hoveredCenterX = hoveredRect.left + hoveredRect.width / 2 - containerRect.left;
        const hoveredCenterY = hoveredRect.top + hoveredRect.height / 2 - containerRect.top;
        
        // Flatten related elements for easier checking
        const relatedCards = [...relatedElements.pages, ...relatedElements.servers];
        
        // Identify unrelated cards first
        const unrelatedCards = Array.from(allCards).filter(card => 
            card !== hoveredCard && !relatedCards.includes(card)
        );
        
        // Calculate replacement positions for related cards (they'll take over unrelated card positions)
        const replacementPositions = this._calculateReplacementPositions(hoveredCard, relatedElements, [...unrelatedCards]);
        
        const hoveredCardId = hoveredCard.id || hoveredCard.dataset.server || hoveredCard.className;
        console.log(`🚀 Starting card repositioning for: ${hoveredCardId}`);
        console.log(`   Hovered card position: (${hoveredCenterX}, ${hoveredCenterY})`);
        console.log(`   Related cards: ${relatedCards.length}`);
        console.log(`   Replacement positions calculated: ${Object.keys(replacementPositions).length}`);
        console.log(`   ================================`);
        
        allCards.forEach(card => {
            if (card === hoveredCard) {
                console.log(`💫 Animating hovered card: ${hoveredCardId}`);
                this._animateHoveredCard(card);
            } else if (relatedCards.includes(card)) {
                // Move related cards to replacement positions
                this._animateRelatedCardToReplacement(card, hoveredCard, replacementPositions);
            } else {
                const cardId = card.id || card.dataset.server || card.className;
                console.log(`👻 Hiding unrelated card: ${cardId}`);
                this._hideUnrelatedCard(card);
            }
        });
        
        // Redraw connections after cards have moved
        setTimeout(() => {
            this.connectionManager.clearConnections();
            this._drawConnectionsForRelatedCards(hoveredCard, relatedElements);
        }, 50);
        
        return Promise.resolve();
    }

    async resetAllCards(): Promise<void> {
        const allCards = document.querySelectorAll('.page-card, .server-card') as NodeListOf<HTMLElement>;
        
        return new Promise((resolve) => {
            allCards.forEach(card => {
                // Reset all styles to initial state
                card.style.removeProperty('transform');
                card.style.removeProperty('opacity');
                card.style.removeProperty('z-index');
                card.style.removeProperty('transition');
                card.style.removeProperty('visibility');
                card.style.removeProperty('pointer-events');
                card.style.removeProperty('position');
                card.style.removeProperty('--js-transform');
                card.style.removeProperty('--js-transition');
                card.style.removeProperty('background-color'); // Remove background color
                card.style.removeProperty('border'); // Remove border
                card.style.removeProperty('outline'); // Remove outline
                card.style.removeProperty('top'); // Remove top positioning
                
                // Restore original classes if stored
                const originalClasses = card.dataset.originalClasses;
                if (originalClasses) {
                    card.className = originalClasses;
                    card.removeAttribute('data-original-classes');
                }
                
                // Force reset with explicit values
                card.style.opacity = '1';
                card.style.pointerEvents = 'auto';
                card.style.transform = 'none';
                card.style.transition = 'none';
                
                // Remove all state classes including animation classes
                card.classList.remove('active', 'highlighted', 'dimmed', 'hovered', 'js-animating', 'js-move-up-80', 'js-move-down-80');
            });
            
            // Clear all connections
            this.connectionManager.clearConnections();
            
            // Use setTimeout to ensure DOM updates are applied
            setTimeout(() => {
                // Final cleanup - remove transition after reset
                allCards.forEach(card => {
                    card.style.removeProperty('transition');
                });
                resolve();
            }, 50);
        });
    }

    private _animateHoveredCard(card: HTMLElement): void {
        card.style.setProperty('transform', 'scale(1.1)');
        card.style.setProperty('opacity', '1');
        card.style.setProperty('z-index', '100');
        card.style.setProperty('transition', 'all 0.3s ease');
        card.classList.add('active');
    }

    private _calculateReplacementPositions(hoveredCard: HTMLElement, relatedElements: RelatedElements, unrelatedCards: HTMLElement[]): Record<string, {x: number, y: number}> {
        const diagramContainer = document.getElementById('diagram-container');
        const containerRect = diagramContainer?.getBoundingClientRect();
        
        if (!containerRect) return {};
        
        const positions: Record<string, {x: number, y: number}> = {};
        
        // Sort related cards by priority (auth-server first, then payment-server)
        const relatedCards = [...relatedElements.servers].sort((a, b) => {
            const aId = a.dataset.server || '';
            const bId = b.dataset.server || '';
            
            if (aId === 'auth-server') return -1;
            if (bId === 'auth-server') return 1;
            if (aId === 'payment-server') return -1;
            if (bId === 'payment-server') return 1;
            return 0;
        });
        
        console.log(`🔄 Calculating replacement positions:`);
        console.log(`   Related cards to reposition: ${relatedCards.length}`);
        console.log(`   Available unrelated cards: ${unrelatedCards.length}`);
        
        // Find strategic replacement positions - prefer cards that create better visual grouping
        relatedCards.forEach((relatedCard, index) => {
            if (index >= unrelatedCards.length) return; // No more unrelated cards to replace
            
            const relatedCardId = relatedCard.dataset.server || relatedCard.className;
            
            // Find best strategic replacement based on card type and desired layout
            let targetUnrelated: HTMLElement | null = null;
            
            if (relatedCardId === 'auth-server') {
                // Auth-server should target user-server if available (conceptually related)
                targetUnrelated = unrelatedCards.find(card => card.dataset.server === 'user-server') || 
                                 unrelatedCards.find(card => card.dataset.server === 'analytics-server') ||
                                 unrelatedCards[0]; // Fallback to first available
            } else if (relatedCardId === 'payment-server') {
                // Payment-server should target a server that's visually well-positioned
                targetUnrelated = unrelatedCards.find(card => card.dataset.server === 'notification-server') ||
                                 unrelatedCards.find(card => card.dataset.server === 'product-server') ||
                                 unrelatedCards[0]; // Fallback to first available
            } else {
                // For other cards, use nearest logic
                const { card: nearestUnrelated } = this.positionManager.findNearestUnrelatedCard(relatedCard, unrelatedCards);
                targetUnrelated = nearestUnrelated;
            }
            
            if (targetUnrelated) {
                const targetRect = targetUnrelated.getBoundingClientRect();
                const targetX = targetRect.left + targetRect.width / 2 - containerRect.left;
                const targetY = targetRect.top + targetRect.height / 2 - containerRect.top;
                
                positions[relatedCardId] = { x: targetX, y: targetY };
                
                // Remove this unrelated card from available options
                const cardIndex = unrelatedCards.indexOf(targetUnrelated);
                if (cardIndex > -1) {
                    unrelatedCards.splice(cardIndex, 1);
                }
                
                const targetId = targetUnrelated.dataset.server || targetUnrelated.className;
                console.log(`   🎯 ${relatedCardId} will STRATEGICALLY replace ${targetId} at (${Math.round(targetX)}, ${Math.round(targetY)})`);
            }
        });
        
        return positions;
    }

    private _animateRelatedCardToReplacement(card: HTMLElement, hoveredCard: HTMLElement, replacementPositions: Record<string, {x: number, y: number}>): void {
        const diagramContainer = document.getElementById('diagram-container');
        const containerRect = diagramContainer?.getBoundingClientRect();
        if (!containerRect) return;

        const cardRect = card.getBoundingClientRect();
        const currentX = cardRect.left + cardRect.width / 2 - containerRect.left;
        const currentY = cardRect.top + cardRect.height / 2 - containerRect.top;
        const cardId = card.dataset.server || card.className;
        
        const targetPosition = replacementPositions[cardId];
        if (!targetPosition) return;
        
        const moveX = targetPosition.x - currentX;
        const moveY = targetPosition.y - currentY;
        
        console.log(`🔄 REPLACEMENT MOVEMENT: ${cardId}`);
        console.log(`   📍 FROM: (${Math.round(currentX)}, ${Math.round(currentY)}) → TO: (${Math.round(targetPosition.x)}, ${Math.round(targetPosition.y)})`);
        console.log(`   📦 Item: ${cardId} moving by (${Math.round(moveX)}, ${Math.round(moveY)})`);
        
        // Apply transform directly with maximum force
        card.style.setProperty('transition', 'none', 'important');
        card.style.setProperty('transform', `translate(${moveX}px, ${moveY}px) scale(1.05)`, 'important');
        card.style.setProperty('z-index', '50', 'important');
        card.style.setProperty('position', 'relative', 'important');
        
        // Force reflow then add transition
        card.offsetHeight;
        card.style.setProperty('transition', 'all 0.4s ease', 'important');
        
        card.classList.add('highlighted');
    }


    private _hideUnrelatedCard(card: HTMLElement): void {
        card.style.setProperty('opacity', '0.1');
        card.style.setProperty('transform', 'scale(0.7)');
        card.style.setProperty('pointer-events', 'none');
        card.style.setProperty('z-index', '1');
        card.style.setProperty('transition', 'all 0.3s ease');
        card.classList.add('dimmed');
    }

    private _drawConnectionsForRelatedCards(hoveredCard: HTMLElement, relatedElements: RelatedElements): void {
        const relatedCards = [...relatedElements.pages, ...relatedElements.servers];
        const allActiveCards = [hoveredCard, ...relatedCards];
        
        // Draw connections between all active (related) cards
        allActiveCards.forEach(card => {
            if (card.classList.contains('page-card')) {
                this._drawPageConnections(card, relatedElements);
            } else if (card.classList.contains('server-card')) {
                this._drawServerConnections(card);
            }
        });
    }

    private _drawPageConnections(pageCard: HTMLElement, relatedElements: RelatedElements): void {
        const pageApisData = pageCard.dataset.apis;
        if (!pageApisData) return;

        const pageApis: string[] = JSON.parse(pageApisData);
        const relatedServers = relatedElements.servers;
        
        pageApis.forEach(api => {
            const [serverId, apiPath] = api.split(':');
            const method = apiPath.trim().split(' ')[0];
            const color = this.connectionManager.getMethodColor(method);
            
            // Find page API element
            console.log(`🔍 Looking for page API element with selector: [data-full-api="${api}"]`);
            const pageApiElement = pageCard.querySelector(`[data-full-api="${api}"]`) as HTMLElement;
            console.log(`📍 Found page API element:`, pageApiElement);
            
            // Debug: Show all API elements in page card
            const allPageApis = pageCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
            console.log(`🔍 All page API elements (${allPageApis.length}):`);
            allPageApis.forEach((el, i) => {
                console.log(`   ${i}: data-full-api="${el.dataset.fullApi}" text="${el.textContent?.trim()}"`);
            });
            
            // Find server API element - only connect to related servers
            const serverCard = relatedServers.find(server => server.dataset.server === serverId);
            let serverApiElement: HTMLElement | null = null;
            
            if (serverCard) {
                console.log(`🔍 Looking for server API element with text: "${apiPath.trim()}" in server: ${serverId}`);
                const serverApiElements = serverCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
                console.log(`🔍 All server API elements (${serverApiElements.length}):`);
                serverApiElements.forEach((element, i) => {
                    const serverApiText = element.dataset.apiText || element.textContent?.trim();
                    console.log(`   ${i}: data-api-text="${element.dataset.apiText}" text="${element.textContent?.trim()}"`);
                    if (serverApiText === apiPath.trim()) {
                        serverApiElement = element;
                        console.log(`✅ Found matching server API element`);
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
                
                console.log(`🔗 CREATING CONNECTION LINE #${pageApis.indexOf(api) + 1}:`);
                console.log(`   📍 FROM: Page API "${apiPath.trim()}" at (${Math.round(pageRect.left + pageRect.width/2)}, ${Math.round(pageRect.top + pageRect.height/2)})`);
                console.log(`   📍 TO: Server API "${apiPath.trim()}" at (${Math.round(serverRect.left + serverRect.width/2)}, ${Math.round(serverRect.top + serverRect.height/2)})`);
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
                        console.log(`   ✅ Line created and added to SVG`);
                    } else {
                        console.log(`   ❌ SVG not found - line not added`);
                    }
                } else {
                    console.log(`   ❌ Failed to create line`);
                }
            } else {
                console.log(`   ❌ Missing elements - pageApiElement: ${!!pageApiElement}, serverApiElement: ${!!serverApiElement}`);
            }
        });
    }

    private _drawServerConnections(serverCard: HTMLElement): void {
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
                
                const method = apiPath.trim().split(' ')[0];
                const color = this.connectionManager.getMethodColor(method);
                
                // Find page API element
                const pageApiElement = pageCard.querySelector(`[data-full-api="${api}"]`) as HTMLElement;
                
                // Find server API element
                let serverApiElement: HTMLElement | null = null;
                const serverApiElements = serverCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
                serverApiElements.forEach(element => {
                    const serverApiText = element.dataset.apiText || element.textContent?.trim();
                    if (serverApiText === apiPath.trim()) {
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