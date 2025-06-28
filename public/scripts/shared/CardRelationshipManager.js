/**
 * SHARED MODULE: Card Relationship Management
 * Used by: ConnectionArea component, PageCard component, ServerCard component
 * Purpose: Manages API-based relationships between cards using JSON data mappings
 */
export class CardRelationshipManager {
    constructor() {
        this.pageCards = [];
        this.serverCards = [];
    }

    initialize() {
        this.pageCards = document.querySelectorAll('.page-card');
        this.serverCards = document.querySelectorAll('.server-card');
        
        if (this.pageCards.length === 0 || this.serverCards.length === 0) {
            console.error('Cards not found');
            return false;
        }
        return true;
    }

    findRelatedCards(hoveredCard) {
        const relatedCards = [];
        
        if (hoveredCard.classList.contains('page-card')) {
            return this._findRelatedCardsForPage(hoveredCard);
        } else if (hoveredCard.classList.contains('server-card')) {
            return this._findRelatedCardsForServer(hoveredCard);
        }
        
        return relatedCards;
    }

    _findRelatedCardsForPage(pageCard) {
        const relatedCards = [];
        const pageApis = JSON.parse(pageCard.dataset.apis || '[]');
        const relatedServerIds = new Set();
        
        // Extract server IDs from page APIs
        pageApis.forEach(api => {
            const [serverId] = api.split(':');
            relatedServerIds.add(serverId);
        });
        
        // Find server cards that match these server IDs
        this.serverCards.forEach(serverCard => {
            const serverId = serverCard.dataset.server;
            if (relatedServerIds.has(serverId)) {
                relatedCards.push(serverCard);
            }
        });
        
        // Find other pages that use the same servers
        this.pageCards.forEach(otherPageCard => {
            if (otherPageCard === pageCard) return;
            
            const otherPageApis = JSON.parse(otherPageCard.dataset.apis || '[]');
            const hasCommonServer = otherPageApis.some(api => {
                const [serverId] = api.split(':');
                return relatedServerIds.has(serverId);
            });
            
            if (hasCommonServer) {
                relatedCards.push(otherPageCard);
            }
        });
        
        return relatedCards;
    }

    _findRelatedCardsForServer(serverCard) {
        const relatedCards = [];
        const hoveredServerId = serverCard.dataset.server;
        
        // Find pages that use this server
        this.pageCards.forEach(pageCard => {
            const pageApis = JSON.parse(pageCard.dataset.apis || '[]');
            const usesThisServer = pageApis.some(api => {
                const [serverId] = api.split(':');
                return serverId === hoveredServerId;
            });
            
            if (usesThisServer) {
                relatedCards.push(pageCard);
            }
        });
        
        // Find other servers that are used by the same pages
        const relatedPages = relatedCards.filter(card => card.classList.contains('page-card'));
        const allRelatedServerIds = new Set([hoveredServerId]);
        
        relatedPages.forEach(pageCard => {
            const pageApis = JSON.parse(pageCard.dataset.apis || '[]');
            pageApis.forEach(api => {
                const [serverId] = api.split(':');
                allRelatedServerIds.add(serverId);
            });
        });
        
        // Add other servers that are related
        this.serverCards.forEach(otherServerCard => {
            if (otherServerCard === serverCard) return;
            
            const serverId = otherServerCard.dataset.server;
            if (allRelatedServerIds.has(serverId)) {
                relatedCards.push(otherServerCard);
            }
        });
        
        return relatedCards;
    }

    setActiveClasses(hoveredCard, relatedCards) {
        // Clear all active classes first
        this.clearActiveClasses();
        
        // Set active class for hovered card
        hoveredCard.classList.add('active');
        
        // Set active classes for related cards
        relatedCards.forEach(relatedCard => {
            relatedCard.classList.add('active');
        });
    }

    clearActiveClasses() {
        [...this.pageCards, ...this.serverCards].forEach(card => {
            card.classList.remove('active', 'highlighted', 'hovered');
        });
    }
}