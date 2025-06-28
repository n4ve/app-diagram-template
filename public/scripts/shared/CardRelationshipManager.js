/**
 * SHARED MODULE: Card Relationship Management
 * Used by: ConnectionArea component, PageCard component, ServerCard component
 * Purpose: Manages API-based relationships between cards using JSON data mappings
 */
export class CardRelationshipManager {
    pageCards = document.querySelectorAll('.page-card');
    serverCards = document.querySelectorAll('.server-card');
    constructor() {
        this.pageCards = document.querySelectorAll('.page-card');
        this.serverCards = document.querySelectorAll('.server-card');
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
        if (hoveredCard.classList.contains('page-card')) {
            return this._findRelatedCardsForPage(hoveredCard);
        }
        else if (hoveredCard.classList.contains('server-card')) {
            return this._findRelatedCardsForServer(hoveredCard);
        }
        return {
            pages: [],
            servers: [],
            apiItems: []
        };
    }
    _findRelatedCardsForPage(pageCard) {
        const relatedPages = [];
        const relatedServers = [];
        const relatedApiItems = [];
        const pageApisData = pageCard.dataset.apis;
        if (!pageApisData) {
            return { pages: relatedPages, servers: relatedServers, apiItems: relatedApiItems };
        }
        const pageApis = JSON.parse(pageApisData);
        const relatedServerIds = new Set();
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
                const serverApiItems = serverCard.querySelectorAll('.api-item');
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
    _findRelatedCardsForServer(serverCard) {
        const relatedPages = [];
        const relatedServers = [];
        const relatedApiItems = [];
        const hoveredServerId = serverCard.dataset.server;
        if (!hoveredServerId) {
            return { pages: relatedPages, servers: relatedServers, apiItems: relatedApiItems };
        }
        // Find pages that have direct API connections to this server
        this.pageCards.forEach(pageCard => {
            const pageApisData = pageCard.dataset.apis;
            if (!pageApisData)
                return;
            const pageApis = JSON.parse(pageApisData);
            const usesThisServer = pageApis.some(api => {
                const [serverId] = api.split(':');
                return serverId === hoveredServerId;
            });
            if (usesThisServer) {
                relatedPages.push(pageCard);
                // Find specific API items within the page card that connect to this server
                const pageApiItems = pageCard.querySelectorAll('.api-item');
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
    setActiveClasses(hoveredCard, relatedElements) {
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
    clearActiveClasses() {
        [...this.pageCards, ...this.serverCards].forEach(card => {
            card.classList.remove('active', 'highlighted', 'hovered');
            // Clear API item classes too
            const apiItems = card.querySelectorAll('.api-item');
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
