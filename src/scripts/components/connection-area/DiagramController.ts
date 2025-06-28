// ConnectionArea Component - Main Diagram Controller
import { ConnectionManager } from '../../shared/ConnectionManager.js';
import { CardRelationshipManager } from '../../shared/CardRelationshipManager.js';
import { CardPositionManager } from '../../shared/CardPositionManager.js';
import { CardAnimationManager } from './CardAnimationManager.js';
import { HoverEventManager } from './HoverEventManager.js';

import type { 
    DiagramController as IDiagramController,
    ConnectionManager as IConnectionManager,
    CardRelationshipManager as ICardRelationshipManager,
    CardPositionManager as ICardPositionManager,
    CardAnimationManager as ICardAnimationManager,
    HoverEventManager as IHoverEventManager
} from '../../../types/index.js';

export class DiagramController implements IDiagramController {
    private connectionManager: IConnectionManager;
    private relationshipManager: ICardRelationshipManager;
    private positionManager: ICardPositionManager;
    private animationManager: ICardAnimationManager;
    private hoverEventManager: IHoverEventManager;

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

    async initialize(): Promise<boolean> {
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
        } catch (error) {
            console.error('Error during diagram controller initialization:', error);
            return false;
        }
    }

    private waitForElements(): Promise<void> {
        return new Promise((resolve) => {
            const checkElements = () => {
                const pageCards = document.querySelectorAll('.page-card');
                const serverCards = document.querySelectorAll('.server-card');
                const connectionSvg = document.getElementById('connection-svg');
                
                if (pageCards.length > 0 && serverCards.length > 0 && connectionSvg) {
                    resolve();
                } else {
                    setTimeout(checkElements, 100);
                }
            };
            checkElements();
        });
    }

    private initializeCardVisibility(): void {
        const allCards = document.querySelectorAll('.page-card, .server-card') as NodeListOf<HTMLElement>;
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
    resetDiagram(): void {
        this.hoverEventManager.resetAllCards();
    }

    getConnectionManager(): IConnectionManager {
        return this.connectionManager;
    }

    getRelationshipManager(): ICardRelationshipManager {
        return this.relationshipManager;
    }

    getPositionManager(): ICardPositionManager {
        return this.positionManager;
    }

    getAnimationManager(): ICardAnimationManager {
        return this.animationManager;
    }

    getHoverEventManager(): IHoverEventManager {
        return this.hoverEventManager;
    }
}