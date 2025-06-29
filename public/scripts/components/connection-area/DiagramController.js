// ConnectionArea Component - Main Diagram Controller
import { ConnectionManager } from '../../shared/ConnectionManager.js';
import { CardRelationshipManager } from '../../shared/CardRelationshipManager.js';
import { CardPositionManager } from '../../shared/CardPositionManager.js';
import { CardAnimationManager } from './CardAnimationManager.js';
import { HoverEventManager } from './HoverEventManager.js';
export class DiagramController {
    connectionManager;
    relationshipManager;
    positionManager;
    animationManager;
    hoverEventManager;
    constructor() {
        this.connectionManager = new ConnectionManager();
        this.relationshipManager = new CardRelationshipManager();
        this.positionManager = new CardPositionManager();
        this.animationManager = new CardAnimationManager(this.positionManager, this.connectionManager);
        this.hoverEventManager = new HoverEventManager(this.relationshipManager, this.animationManager, this.connectionManager);
    }
    async initialize() {
        try {
            // Wait for DOM to be ready
            await this.waitForElements();
            // Initialize all managers in order
            if (!this.connectionManager.initialize()) {
                console.error('Failed to initialize ConnectionManager');
                return false;
            }
            if (!this.relationshipManager.initialize()) {
                console.error('Failed to initialize CardRelationshipManager');
                return false;
            }
            if (!this.positionManager.initialize()) {
                console.error('Failed to initialize CardPositionManager');
                return false;
            }
            if (!this.animationManager.initialize()) {
                console.error('Failed to initialize CardAnimationManager');
                return false;
            }
            // Initialize event handling
            if (!this.hoverEventManager.initialize()) {
                console.error('Failed to initialize HoverEventManager');
                return false;
            }
            // Initialize card visibility
            this.initializeCardVisibility();
            return true;
        }
        catch (error) {
            console.error('Error during diagram controller initialization:', error);
            return false;
        }
    }
    waitForElements() {
        return new Promise((resolve) => {
            const checkElements = () => {
                const pageCards = document.querySelectorAll('.page-card');
                const serverCards = document.querySelectorAll('.server-card');
                const connectionSvg = document.getElementById('connection-svg');
                if (pageCards.length > 0 && serverCards.length > 0 && connectionSvg) {
                    resolve();
                }
                else {
                    setTimeout(checkElements, 100);
                }
            };
            checkElements();
        });
    }
    initializeCardVisibility() {
        const allCards = document.querySelectorAll('.page-card, .server-card');
        allCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translate(0px, 0px) scale(1)';
            card.style.pointerEvents = 'auto';
            card.style.transition = 'all 0.3s ease';
            card.style.zIndex = '';
            card.style.position = '';
        });
    }
    // Public API methods
    resetDiagram() {
        this.hoverEventManager.resetAllCards();
    }
    getConnectionManager() {
        return this.connectionManager;
    }
    getRelationshipManager() {
        return this.relationshipManager;
    }
    getPositionManager() {
        return this.positionManager;
    }
    getAnimationManager() {
        return this.animationManager;
    }
    getHoverEventManager() {
        return this.hoverEventManager;
    }
}
