/**
 * SHARED MODULE: Card Position Management
 * Used by: ConnectionArea component, ArchitectureDiagram component (zoom/pan)
 * Purpose: Handles positioning calculations, zoom-aware movements, and boundary constraints
 */

import type { 
    CardPositionManager as ICardPositionManager, 
    Position, 
    MovementVector 
} from '../../types/index.js';

interface MovementResult {
    moveX: number;
    moveY: number;
    distance: number;
}


export class CardPositionManager implements ICardPositionManager {
    private currentZoom: number = 1;
    private diagramContainer: HTMLElement | null = null;

    constructor() {
        this.currentZoom = 1;
        this.diagramContainer = null;
    }

    initialize(): boolean {
        this.diagramContainer = document.getElementById('diagram-container');
        if (!this.diagramContainer) {
            console.error('Diagram container not found');
            return false;
        }
        return true;
    }

    getCurrentZoom(): number {
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

    calculateDistance(element1: HTMLElement, element2: HTMLElement): number {
        const containerRect = this.diagramContainer?.getBoundingClientRect();
        if (!containerRect) return 0;

        return this.calculateCardDistance(element1, element2, containerRect);
    }

    private calculateCardDistance(card1: HTMLElement, card2: HTMLElement, containerRect: DOMRect): number {
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

    findNearestUnrelatedCard(relatedCard: HTMLElement, unrelatedCards: HTMLElement[]): { card: HTMLElement | null; distance: number; } {
        const containerRect = this.diagramContainer?.getBoundingClientRect();
        if (!containerRect) {
            return { card: null, distance: Infinity };
        }

        let nearestUnrelated: HTMLElement | null = null;
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

    calculateMovementToward(movingCard: HTMLElement, targetCard: HTMLElement, ratio: number): Position {
        const containerRect = this.diagramContainer?.getBoundingClientRect();
        if (!containerRect) return { x: 0, y: 0 };

        const movement = this.calculateMovement(movingCard, targetCard, containerRect, ratio);
        return { x: movement.moveX, y: movement.moveY };
    }

    private calculateMovement(fromCard: HTMLElement, toCard: HTMLElement, containerRect: DOMRect, moveRatio: number): MovementResult {
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

    getProgressiveMoveRatio(distance: number, isTargetingUnrelated: boolean = false): number {
        const zoom = this.getCurrentZoom();
        const scaledDistance = distance * zoom;
        
        if (isTargetingUnrelated) {
            if (scaledDistance > 400) return 0.35;
            if (scaledDistance > 250) return 0.3;
            if (scaledDistance > 150) return 0.25;
            return 0.2;
        } else {
            if (scaledDistance > 600) return 0.3;
            if (scaledDistance > 400) return 0.25;
            if (scaledDistance > 200) return 0.2;
            return 0.15;
        }
    }

    ensureMinimumMovement(moveX: number, moveY: number, isTargetingUnrelated: boolean = false): MovementVector {
        const zoom = this.getCurrentZoom();
        const minMovement = (isTargetingUnrelated ? 40 : 30) / zoom;
        const moveDistance = Math.sqrt(moveX * moveX + moveY * moveY);
        
        if (moveDistance < minMovement && moveDistance > 0) {
            const scale = minMovement / moveDistance;
            return {
                x: moveX * scale,
                y: moveY * scale
            };
        }
        
        return { x: moveX, y: moveY };
    }

    constrainToBounds(x: number, y: number, element: HTMLElement): Position {
        const containerRect = this.diagramContainer?.getBoundingClientRect();
        if (!containerRect) return { x, y };

        const elementRect = element.getBoundingClientRect();
        
        return this.constrainToBoundsWithMovement(x, y, 0, 0, elementRect, containerRect);
    }

    private constrainToBoundsWithMovement(
        cardCenterX: number, 
        cardCenterY: number, 
        moveX: number, 
        moveY: number, 
        cardRect: DOMRect, 
        containerRect: DOMRect
    ): Position {
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
            x: constrainedMoveX,
            y: constrainedMoveY
        };
    }

    resetAllCardPositions(): void {
        const allCards = document.querySelectorAll('.page-card, .server-card') as NodeListOf<HTMLElement>;
        allCards.forEach(card => {
            card.style.removeProperty('transform');
            card.style.removeProperty('opacity');
            card.style.removeProperty('z-index');
            card.style.removeProperty('transition');
            card.style.removeProperty('visibility');
            card.style.removeProperty('pointer-events');
            card.style.removeProperty('position');
        });
    }
}