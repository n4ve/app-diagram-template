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
    private allCards: NodeListOf<HTMLElement> = document.querySelectorAll('.page-card, .server-card, .backend-card');
    private originalPositions: Map<HTMLElement, DOMRect> = new Map();

    constructor(positionManager: CardPositionManager, connectionManager: ConnectionManager) {
        this.positionManager = positionManager;
        this.connectionManager = connectionManager;
        this.allCards = document.querySelectorAll('.page-card, .server-card, .backend-card');
        this.originalPositions = new Map();
    }

    initialize(): boolean {
        this.allCards = document.querySelectorAll('.page-card, .server-card, .backend-card');
        
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
        const allCards = document.querySelectorAll('.page-card, .server-card, .backend-card') as NodeListOf<HTMLElement>;
        const hoveredRect = hoveredCard.getBoundingClientRect();
        const diagramContainer = document.getElementById('diagram-container');
        const containerRect = diagramContainer?.getBoundingClientRect();
        
        if (!containerRect) return Promise.resolve();
        
        const hoveredCenterX = hoveredRect.left + hoveredRect.width / 2 - containerRect.left;
        const hoveredCenterY = hoveredRect.top + hoveredRect.height / 2 - containerRect.top;
        
        // Flatten related elements for easier checking
        const relatedCards = [...relatedElements.pages, ...relatedElements.servers, ...relatedElements.backends];
        
        // Identify unrelated cards first
        const unrelatedCards = Array.from(allCards).filter(card => 
            card !== hoveredCard && !relatedCards.includes(card)
        );
        
        // Calculate replacement positions for related cards (they'll take over unrelated card positions)
        const replacementPositions = this._calculateReplacementPositions(hoveredCard, relatedElements, [...unrelatedCards]);
        
        const hoveredCardId = hoveredCard.id || hoveredCard.dataset.server || hoveredCard.className;
        
        console.log(`🎨 Starting card repositioning for hover on: ${hoveredCardId}`);
        console.log(`   Related cards to move: ${relatedCards.length}`);
        console.log(`   Cards to hide: ${Array.from(allCards).length - relatedCards.length - 1}`);
        
        allCards.forEach(card => {
            if (card === hoveredCard) {
                this._animateHoveredCard(card);
            } else if (relatedCards.includes(card)) {
                // Move related cards to replacement positions
                this._animateRelatedCardToReplacement(card, hoveredCard, replacementPositions);
            } else {
                const cardId = card.id || card.dataset.server || card.className;
                this._hideUnrelatedCard(card);
            }
        });
        
        // Note: Connections are drawn by HoverEventManager after repositioning
        
        return Promise.resolve();
    }

    async resetAllCards(): Promise<void> {
        const allCards = document.querySelectorAll('.page-card, .server-card, .backend-card') as NodeListOf<HTMLElement>;
        
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
        const cardId = card.id || card.dataset.server || card.className;
        const cardRect = card.getBoundingClientRect();
        
        console.log(`🎆 Animating hovered card: ${cardId}`, {
            position: { x: cardRect.left, y: cardRect.top },
            size: { width: cardRect.width, height: cardRect.height },
            transform: 'scale(1.1)',
            zIndex: '100'
        });
        
        card.style.setProperty('transform', 'scale(1.1)');
        card.style.setProperty('opacity', '1');
        card.style.setProperty('z-index', '100');
        card.style.setProperty('transition', 'all 0.6s ease');
        card.classList.add('active');
    }

    private _calculateReplacementPositions(_hoveredCard: HTMLElement, relatedElements: RelatedElements, unrelatedCards: HTMLElement[]): Record<string, {x: number, y: number}> {
        const diagramContainer = document.getElementById('diagram-container');
        const containerRect = diagramContainer?.getBoundingClientRect();
        
        if (!containerRect) return {};
        
        const positions: Record<string, {x: number, y: number}> = {};
        
        // Use the natural order from relatedElements without any hardcoded sorting
        const relatedCards = [...relatedElements.servers];
        
        console.log(`🔄 Calculating replacement positions:`);
        console.log(`   Related cards to reposition: ${relatedCards.length}`);
        console.log(`   Available unrelated cards: ${unrelatedCards.length}`);
        
        // Find replacement positions using nearest card logic for all cards
        relatedCards.forEach((relatedCard, index) => {
            if (index >= unrelatedCards.length) return; // No more unrelated cards to replace
            
            const relatedCardId = relatedCard.dataset.server || relatedCard.className;
            
            // Always use nearest unrelated card logic without any hardcoded preferences
            const { card: nearestUnrelated } = this.positionManager.findNearestUnrelatedCard(relatedCard, unrelatedCards);
            const targetUnrelated = nearestUnrelated;
            
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
            }
        });
        
        return positions;
    }

    private _animateRelatedCardToReplacement(card: HTMLElement, _hoveredCard: HTMLElement, replacementPositions: Record<string, {x: number, y: number}>): void {
        const diagramContainer = document.getElementById('diagram-container');
        const containerRect = diagramContainer?.getBoundingClientRect();
        if (!containerRect) return;

        const cardRect = card.getBoundingClientRect();
        const currentX = cardRect.left + cardRect.width / 2 - containerRect.left;
        const currentY = cardRect.top + cardRect.height / 2 - containerRect.top;
        const cardId = card.dataset.server || card.className;
        
        const targetPosition = replacementPositions[cardId];
        if (!targetPosition) return;
        
        const fullMoveX = targetPosition.x - currentX;
        const fullMoveY = targetPosition.y - currentY;
        const fullDistance = Math.sqrt(fullMoveX * fullMoveX + fullMoveY * fullMoveY);
        
        // Use progressive movement ratio based on distance to avoid excessive movement
        const moveRatio = this.positionManager.getProgressiveMoveRatio(fullDistance, false);
        const moveX = fullMoveX * moveRatio;
        const moveY = fullMoveY * moveRatio;
        
        // Log position movement details
        console.log(`🎯 Card Position Movement:`, {
            cardId,
            originalPosition: { x: currentX, y: currentY },
            targetPosition: { x: targetPosition.x, y: targetPosition.y },
            fullMovement: { deltaX: fullMoveX, deltaY: fullMoveY },
            progressiveMovement: { deltaX: moveX, deltaY: moveY },
            fullDistance: fullDistance.toFixed(1) + 'px',
            actualDistance: Math.sqrt(moveX * moveX + moveY * moveY).toFixed(1) + 'px',
            moveRatio: (moveRatio * 100).toFixed(1) + '%'
        });
        
        
        // Apply transform with progressive movement
        card.style.setProperty('transition', 'none', 'important');
        card.style.setProperty('transform', `translate(${moveX}px, ${moveY}px) scale(1.05)`, 'important');
        card.style.setProperty('z-index', '50', 'important');
        card.style.setProperty('position', 'relative', 'important');
        
        // Force reflow then add transition
        card.offsetHeight;
        card.style.setProperty('transition', 'all 0.6s ease', 'important');
        
        card.classList.add('highlighted');
    }


    private _hideUnrelatedCard(card: HTMLElement): void {
        const cardId = card.id || card.dataset.server || card.className;
        const cardRect = card.getBoundingClientRect();
        
        console.log(`🔍 Hiding unrelated card: ${cardId}`, {
            position: { x: cardRect.left, y: cardRect.top },
            transform: 'scale(0.7)',
            opacity: '0.1'
        });
        
        card.style.setProperty('opacity', '0.1');
        card.style.setProperty('transform', 'scale(0.7)');
        card.style.setProperty('pointer-events', 'none');
        card.style.setProperty('z-index', '1');
        card.style.setProperty('transition', 'all 0.6s ease');
        card.classList.add('dimmed');
    }



}