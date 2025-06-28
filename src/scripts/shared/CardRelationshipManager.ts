/**
 * SHARED MODULE: Card Relationship Management
 * Used by: ConnectionArea component, PageCard component, ServerCard component
 * Purpose: Manages API-based relationships between cards using JSON data mappings
 */

import type { 
    CardRelationshipManager as ICardRelationshipManager, 
    RelatedElements 
} from '../../types/index.js';

export class CardRelationshipManager implements ICardRelationshipManager {
    private pageCards: NodeListOf<HTMLElement> = document.querySelectorAll('.page-card');
    private serverCards: NodeListOf<HTMLElement> = document.querySelectorAll('.server-card');

    constructor() {
        this.pageCards = document.querySelectorAll('.page-card');
        this.serverCards = document.querySelectorAll('.server-card');
    }

    initialize(): boolean {
        this.pageCards = document.querySelectorAll('.page-card');
        this.serverCards = document.querySelectorAll('.server-card');
        
        if (this.pageCards.length === 0 || this.serverCards.length === 0) {
            console.error('Cards not found');
            return false;
        }
        return true;
    }

    findRelatedCards(hoveredCard: HTMLElement): RelatedElements {
        if (hoveredCard.classList.contains('page-card')) {
            return this._findRelatedCardsForPage(hoveredCard);
        } else if (hoveredCard.classList.contains('server-card')) {
            return this._findRelatedCardsForServer(hoveredCard);
        }
        
        return {
            pages: [],
            servers: [],
            apiItems: []
        };
    }

    private _findRelatedCardsForPage(pageCard: HTMLElement): RelatedElements {
        const relatedPages: HTMLElement[] = [];
        const relatedServers: HTMLElement[] = [];
        const relatedApiItems: HTMLElement[] = [];
        
        const pageApisData = pageCard.dataset.apis;
        if (!pageApisData) {
            return { pages: relatedPages, servers: relatedServers, apiItems: relatedApiItems };
        }

        const pageApis: string[] = JSON.parse(pageApisData);
        const relatedServerIds = new Set<string>();
        
        // Extract server IDs from page APIs
        pageApis.forEach(api => {
            const [serverId] = api.split(':');
            relatedServerIds.add(serverId);
        });
        
        // Find server cards that have direct API connections
        this.serverCards.forEach(serverCard => {
            const serverId = serverCard.dataset.server;
            if (serverId && relatedServerIds.has(serverId)) {
                relatedServers.push(serverCard);
                
                // Find specific API items within the server card that match page APIs
                const serverApiItems = serverCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
                serverApiItems.forEach(apiItem => {
                    const apiText = apiItem.textContent?.trim();
                    const isRelated = pageApis.some(pageApi => {
                        const [, apiPath] = pageApi.split(':');
                        return apiText === apiPath.trim();
                    });
                    if (isRelated) {
                        relatedApiItems.push(apiItem);
                    }
                });
            }
        });
        
        // DO NOT include other pages - only direct server connections matter
        // Related pages are determined by UI/business logic, not API sharing
        
        return {
            pages: relatedPages, // Empty - no automatic page relationships
            servers: relatedServers,
            apiItems: relatedApiItems
        };
    }

    private _findRelatedCardsForServer(serverCard: HTMLElement): RelatedElements {
        const relatedPages: HTMLElement[] = [];
        const relatedServers: HTMLElement[] = [];
        const relatedApiItems: HTMLElement[] = [];
        
        const hoveredServerId = serverCard.dataset.server;
        if (!hoveredServerId) {
            return { pages: relatedPages, servers: relatedServers, apiItems: relatedApiItems };
        }
        
        // Find pages that have direct API connections to this server
        this.pageCards.forEach(pageCard => {
            const pageApisData = pageCard.dataset.apis;
            if (!pageApisData) return;

            const pageApis: string[] = JSON.parse(pageApisData);
            const usesThisServer = pageApis.some(api => {
                const [serverId] = api.split(':');
                return serverId === hoveredServerId;
            });
            
            if (usesThisServer) {
                relatedPages.push(pageCard);
                
                // Find specific API items within the page card that connect to this server
                const pageApiItems = pageCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
                pageApiItems.forEach(apiItem => {
                    const apiData = apiItem.dataset.fullApi;
                    if (apiData && apiData.startsWith(`${hoveredServerId}:`)) {
                        relatedApiItems.push(apiItem);
                    }
                });
            }
        });
        
        // DO NOT include other servers - only direct page connections matter
        // Server-to-server relationships should be explicit, not inferred
        
        return {
            pages: relatedPages,
            servers: relatedServers, // Empty - no automatic server relationships
            apiItems: relatedApiItems
        };
    }

    setActiveClasses(hoveredCard: HTMLElement, relatedElements: RelatedElements): void {
        // Clear all active classes first
        this.clearActiveClasses();
        
        // Set active class for hovered card
        hoveredCard.classList.add('active');
        
        // Set active classes for related cards
        [...relatedElements.pages, ...relatedElements.servers].forEach(relatedCard => {
            relatedCard.classList.add('active');
        });

        // Set highlighted classes for related API items
        relatedElements.apiItems.forEach(apiItem => {
            apiItem.classList.add('highlighted');
        });

        // Enable diagram-dimmed mode to dim non-related cards
        const diagramContainer = document.getElementById('diagram-container');
        if (diagramContainer) {
            diagramContainer.classList.add('diagram-dimmed');
        }
    }

    clearActiveClasses(): void {
        [...this.pageCards, ...this.serverCards].forEach(card => {
            card.classList.remove('active', 'highlighted', 'hovered');
            
            // Clear API item classes too
            const apiItems = card.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
            apiItems.forEach(apiItem => {
                apiItem.classList.remove('active', 'highlighted', 'hovered');
            });
        });

        // Remove diagram-dimmed mode to show all cards normally again
        const diagramContainer = document.getElementById('diagram-container');
        if (diagramContainer) {
            diagramContainer.classList.remove('diagram-dimmed');
        }
    }
}