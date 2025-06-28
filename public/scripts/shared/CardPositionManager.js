/**
 * SHARED MODULE: Card Position Management
 * Used by: ConnectionArea component, ArchitectureDiagram component (zoom/pan)
 * Purpose: Handles positioning calculations, zoom-aware movements, and boundary constraints
 */
export class CardPositionManager {
    constructor() {
        this.currentZoom = 1;
    }

    getCurrentZoom() {
        const diagramContent = document.getElementById('diagram-content');
        if (diagramContent) {
            const transform = diagramContent.style.transform;
            const scaleMatch = transform.match(/scale\(([^)]+)\)/);
            if (scaleMatch) {
                this.currentZoom = parseFloat(scaleMatch[1]) || 1;
            }
        }
        return this.currentZoom;
    }

    calculateCardDistance(card1, card2, containerRect) {
        const rect1 = card1.getBoundingClientRect();
        const rect2 = card2.getBoundingClientRect();
        
        const centerX1 = rect1.left + rect1.width / 2 - containerRect.left;
        const centerY1 = rect1.top + rect1.height / 2 - containerRect.top;
        const centerX2 = rect2.left + rect2.width / 2 - containerRect.left;
        const centerY2 = rect2.top + rect2.height / 2 - containerRect.top;
        
        return Math.sqrt(
            Math.pow(centerX1 - centerX2, 2) + 
            Math.pow(centerY1 - centerY2, 2)
        );
    }

    findNearestUnrelatedCard(relatedCard, unrelatedCards, containerRect) {
        let nearestUnrelated = null;
        let nearestDistance = Infinity;
        
        unrelatedCards.forEach(unrelatedCard => {
            const distance = this.calculateCardDistance(relatedCard, unrelatedCard, containerRect);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestUnrelated = unrelatedCard;
            }
        });
        
        return { card: nearestUnrelated, distance: nearestDistance };
    }

    calculateMovement(fromCard, toCard, containerRect, moveRatio) {
        const fromRect = fromCard.getBoundingClientRect();
        const toRect = toCard.getBoundingClientRect();
        
        const fromCenterX = fromRect.left + fromRect.width / 2 - containerRect.left;
        const fromCenterY = fromRect.top + fromRect.height / 2 - containerRect.top;
        const toCenterX = toRect.left + toRect.width / 2 - containerRect.left;
        const toCenterY = toRect.top + toRect.height / 2 - containerRect.top;
        
        const directionX = toCenterX - fromCenterX;
        const directionY = toCenterY - fromCenterY;
        
        return {
            moveX: directionX * moveRatio,
            moveY: directionY * moveRatio,
            distance: Math.sqrt(directionX * directionX + directionY * directionY)
        };
    }

    getProgressiveMoveRatio(distance, isTargetingUnrelated = false) {
        const zoom = this.getCurrentZoom();
        const scaledDistance = distance * zoom;
        
        if (isTargetingUnrelated) {
            if (scaledDistance > 400) return 0.9;
            if (scaledDistance > 250) return 0.8;
            if (scaledDistance > 150) return 0.7;
            return 0.6;
        } else {
            if (scaledDistance > 600) return 0.8;
            if (scaledDistance > 400) return 0.7;
            if (scaledDistance > 200) return 0.6;
            return 0.4;
        }
    }

    ensureMinimumMovement(moveX, moveY, isTargetingUnrelated = false) {
        const zoom = this.getCurrentZoom();
        const minMovement = (isTargetingUnrelated ? 100 : 80) / zoom;
        const moveDistance = Math.sqrt(moveX * moveX + moveY * moveY);
        
        if (moveDistance < minMovement && moveDistance > 0) {
            const scale = minMovement / moveDistance;
            return {
                moveX: moveX * scale,
                moveY: moveY * scale
            };
        }
        
        return { moveX, moveY };
    }

    constrainToBounds(cardCenterX, cardCenterY, moveX, moveY, cardRect, containerRect) {
        const newX = cardCenterX + moveX;
        const newY = cardCenterY + moveY;
        
        const cardWidth = cardRect.width;
        const cardHeight = cardRect.height;
        const padding = 20;
        
        const minX = cardWidth / 2 + padding;
        const maxX = containerRect.width - cardWidth / 2 - padding;
        const minY = cardHeight / 2 + padding;
        const maxY = containerRect.height - cardHeight / 2 - padding;
        
        let constrainedMoveX = moveX;
        let constrainedMoveY = moveY;
        
        if (newX < minX) constrainedMoveX = minX - cardCenterX;
        if (newX > maxX) constrainedMoveX = maxX - cardCenterX;
        if (newY < minY) constrainedMoveY = minY - cardCenterY;
        if (newY > maxY) constrainedMoveY = maxY - cardCenterY;
        
        return {
            moveX: constrainedMoveX,
            moveY: constrainedMoveY
        };
    }

    resetAllCardPositions() {
        const allCards = document.querySelectorAll('.page-card, .server-card');
        allCards.forEach(card => {
            const htmlCard = card;
            htmlCard.style.removeProperty('transform');
            htmlCard.style.removeProperty('opacity');
            htmlCard.style.removeProperty('z-index');
            htmlCard.style.removeProperty('transition');
            htmlCard.style.removeProperty('visibility');
            htmlCard.style.removeProperty('pointer-events');
            htmlCard.style.removeProperty('position');
        });
    }
}