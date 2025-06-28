/**
 * CONNECTION-AREA COMPONENT: Card Animation and Repositioning Module
 * Used by: ConnectionArea component only
 * Purpose: Handles card movement animations, strategic positioning, and hiding unrelated cards
 */
export class CardAnimationManager {
    constructor(positionManager, connectionManager) {
        this.positionManager = positionManager;
        this.connectionManager = connectionManager;
    }

    repositionRelatedCards(hoveredCard, relatedElements) {
        const allCards = document.querySelectorAll('.page-card, .server-card');
        const hoveredRect = hoveredCard.getBoundingClientRect();
        const diagramContainer = document.getElementById('diagram-container');
        const containerRect = diagramContainer?.getBoundingClientRect();
        
        if (!containerRect) return Promise.resolve();
        
        const hoveredCenterX = hoveredRect.left + hoveredRect.width / 2 - containerRect.left;
        const hoveredCenterY = hoveredRect.top + hoveredRect.height / 2 - containerRect.top;
        
        // Identify unrelated cards
        const unrelatedCards = Array.from(allCards).filter(card => 
            card !== hoveredCard && !relatedElements.includes(card)
        );
        
        allCards.forEach(card => {
            const htmlCard = card;
            
            if (card === hoveredCard) {
                this._animateHoveredCard(htmlCard);
            } else if (relatedElements.includes(card)) {
                this._animateRelatedCard(htmlCard, hoveredCard, containerRect, unrelatedCards);
            } else {
                this._animateUnrelatedCard(htmlCard);
            }
        });
        
        // Redraw connections after cards have moved
        setTimeout(() => {
            this.connectionManager.clearConnections();
            this.connectionManager.drawConnectionsForActiveCards();
        }, 50);
        
        return Promise.resolve();
    }

    _animateHoveredCard(htmlCard) {
        htmlCard.style.setProperty('transform', 'scale(1.1)');
        htmlCard.style.setProperty('opacity', '1');
        htmlCard.style.setProperty('z-index', '100');
        htmlCard.style.setProperty('transition', 'all 0.3s ease');
    }

    _animateRelatedCard(htmlCard, hoveredCard, containerRect, unrelatedCards) {
        const cardRect = htmlCard.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2 - containerRect.left;
        const cardCenterY = cardRect.top + cardRect.height / 2 - containerRect.top;
        
        // Find nearest unrelated card to this related card
        const { card: nearestUnrelated, distance: nearestDistance } = 
            this.positionManager.findNearestUnrelatedCard(htmlCard, unrelatedCards, containerRect);
        
        let moveX = 0, moveY = 0;
        
        if (nearestUnrelated) {
            // Move towards the nearest unrelated card to cover it
            const movement = this.positionManager.calculateMovement(
                htmlCard, nearestUnrelated, containerRect, 
                this.positionManager.getProgressiveMoveRatio(nearestDistance, true)
            );
            
            moveX = movement.moveX;
            moveY = movement.moveY;
            
            // Ensure minimum movement for visibility
            const adjusted = this.positionManager.ensureMinimumMovement(moveX, moveY, true);
            moveX = adjusted.moveX;
            moveY = adjusted.moveY;
        } else {
            // No unrelated cards nearby, move closer to hovered card
            const movement = this.positionManager.calculateMovement(
                htmlCard, hoveredCard, containerRect,
                this.positionManager.getProgressiveMoveRatio(movement.distance, false)
            );
            
            moveX = movement.moveX;
            moveY = movement.moveY;
            
            // Ensure minimum movement for visibility
            const adjusted = this.positionManager.ensureMinimumMovement(moveX, moveY, false);
            moveX = adjusted.moveX;
            moveY = adjusted.moveY;
        }
        
        // Constrain movement to stay within container bounds
        const constrained = this.positionManager.constrainToBounds(
            cardCenterX, cardCenterY, moveX, moveY, cardRect, containerRect
        );
        
        htmlCard.style.setProperty('transform', `translate(${constrained.moveX}px, ${constrained.moveY}px) scale(1.05)`);
        htmlCard.style.setProperty('opacity', '1');
        htmlCard.style.setProperty('z-index', '50');
        htmlCard.style.setProperty('transition', 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)');
    }

    _animateUnrelatedCard(htmlCard) {
        htmlCard.style.setProperty('opacity', '0');
        htmlCard.style.setProperty('transform', 'scale(0.8)');
        htmlCard.style.setProperty('pointer-events', 'none');
        htmlCard.style.setProperty('z-index', '1');
        htmlCard.style.setProperty('transition', 'all 0.3s ease');
    }
}