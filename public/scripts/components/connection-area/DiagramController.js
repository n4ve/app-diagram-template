// ConnectionArea Component - Main Diagram Controller
import { ConnectionManager } from '/scripts/shared/ConnectionManager.js';
import { CardRelationshipManager } from '/scripts/shared/CardRelationshipManager.js';
import { CardPositionManager } from '/scripts/shared/CardPositionManager.js';
import { CardAnimationManager } from '/scripts/components/connection-area/CardAnimationManager.js';
import { HoverEventManager } from '/scripts/components/connection-area/HoverEventManager.js';

export class DiagramController {
    constructor() {
        this.connectionManager = new ConnectionManager();
        this.relationshipManager = new CardRelationshipManager();
        this.positionManager = new CardPositionManager();
        this.animationManager = new CardAnimationManager(this.positionManager, this.connectionManager);
        this.hoverEventManager = new HoverEventManager(
            this.relationshipManager, 
            this.animationManager, 
            this.connectionManager
        );
    }

    async initialize() {
        console.log('Initializing Diagram Controller...');
        
        // Wait for DOM to be ready
        await this.waitForElements();
        
        // Initialize all managers
        if (!this.connectionManager.initialize()) {
            console.error('Failed to initialize ConnectionManager');
            return false;
        }
        
        if (!this.relationshipManager.initialize()) {
            console.error('Failed to initialize CardRelationshipManager');
            return false;
        }
        
        // Initialize event handling
        this.hoverEventManager.initialize();
        
        // Initialize card visibility
        this.initializeCardVisibility();
        
        console.log('Diagram Controller initialized successfully');
        return true;
    }

    waitForElements() {
        return new Promise((resolve) => {
            const checkElements = () => {
                const pageCards = document.querySelectorAll('.page-card');
                const serverCards = document.querySelectorAll('.server-card');
                const connectionSvg = document.getElementById('connection-svg');
                
                if (pageCards.length > 0 && serverCards.length > 0 && connectionSvg) {
                    console.log('Found elements:', {
                        pageCards: pageCards.length,
                        serverCards: serverCards.length,
                        connectionSvg: !!connectionSvg
                    });
                    resolve();
                } else {
                    setTimeout(checkElements, 100);
                }
            };
            checkElements();
        });
    }

    initializeCardVisibility() {
        const allCards = document.querySelectorAll('.page-card, .server-card');
        allCards.forEach(card => {
            const htmlCard = card;
            htmlCard.style.opacity = '1';
            htmlCard.style.transform = 'translate(0px, 0px) scale(1)';
            htmlCard.style.pointerEvents = 'auto';
            htmlCard.style.transition = 'all 0.3s ease';
            htmlCard.style.zIndex = '';
            htmlCard.style.position = '';
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
}