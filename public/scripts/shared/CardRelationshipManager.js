/**
 * SHARED MODULE: Card Relationship Management
 * Used by: ConnectionArea component, PageCard component, ServerCard component
 * Purpose: Manages API-based relationships between cards using JSON data mappings
 */
import { ConnectionType } from '../../types/index.js';
export class CardRelationshipManager {
    pageCards = document.querySelectorAll('.page-card');
    serverCards = document.querySelectorAll('.server-card');
    backendCards = document.querySelectorAll('.backend-card');
    constructor() {
        this.pageCards = document.querySelectorAll('.page-card');
        this.serverCards = document.querySelectorAll('.server-card');
        this.backendCards = document.querySelectorAll('.backend-card');
    }
    initialize() {
        this.pageCards = document.querySelectorAll('.page-card');
        this.serverCards = document.querySelectorAll('.server-card');
        this.backendCards = document.querySelectorAll('.backend-card');
        // Only require that at least one type of card exists
        const totalCards = this.pageCards.length + this.serverCards.length + this.backendCards.length;
        if (totalCards === 0) {
            console.error('No cards found');
            return false;
        }
        return true;
    }
    findRelatedCards(hoveredCard) {
        const relatedPages = [];
        const relatedServers = [];
        const relatedBackends = [];
        const relatedApiItems = [];
        // Log the hovered card
        console.log('🎯 Finding related cards for:', {
            type: hoveredCard.classList.toString(),
            id: hoveredCard.dataset.server || hoveredCard.dataset.backend || hoveredCard.dataset.apis?.substring(0, 50) + '...',
            dataset: hoveredCard.dataset
        });
        if (hoveredCard.classList.contains('page-card')) {
            // Page relations: page -> servers -> backends
            this._findServersRelatedToPage(hoveredCard, relatedServers, relatedApiItems);
            this._findBackendsRelatedToServers(relatedServers, relatedBackends);
        }
        else if (hoveredCard.classList.contains('server-card')) {
            // Server relations: server -> pages & server -> backends
            this._findPagesRelatedToServer(hoveredCard, relatedPages, relatedApiItems);
            this._findBackendsRelatedToServers([hoveredCard], relatedBackends);
        }
        else if (hoveredCard.classList.contains('backend-card')) {
            // Backend relations: backend -> servers -> pages
            this._findServersRelatedToBackend(hoveredCard, relatedServers);
            this._findPagesRelatedToServers(relatedServers, relatedPages, relatedApiItems);
        }
        const result = {
            pages: relatedPages,
            servers: relatedServers,
            backends: relatedBackends,
            apiItems: relatedApiItems
        };
        // Log the found related cards
        console.log('📋 Related cards found:', {
            pages: relatedPages.map(p => ({
                apis: p.dataset.apis?.substring(0, 50) + '...',
                classes: p.classList.toString()
            })),
            servers: relatedServers.map(s => ({
                id: s.dataset.server,
                backend: s.dataset.backend,
                classes: s.classList.toString()
            })),
            backends: relatedBackends.map(b => ({
                id: b.dataset.backend,
                classes: b.classList.toString()
            })),
            apiItems: `${relatedApiItems.length} items`
        });
        return result;
    }
    // Unified relationship finding methods - bidirectional logic
    _findServersRelatedToPage(pageCard, relatedServers, relatedApiItems) {
        const pageApisData = pageCard.dataset.apis;
        if (!pageApisData)
            return;
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
    }
    _findPagesRelatedToServer(serverCard, relatedPages, relatedApiItems) {
        const hoveredServerId = serverCard.dataset.server;
        if (!hoveredServerId)
            return;
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
    }
    _findPagesRelatedToServers(servers, relatedPages, relatedApiItems) {
        const connectedServerIds = servers.map(s => s.dataset.server).filter(Boolean);
        this.pageCards.forEach(pageCard => {
            const pageApisData = pageCard.dataset.apis;
            if (!pageApisData)
                return;
            const pageApis = JSON.parse(pageApisData);
            const hasConnection = pageApis.some(api => {
                const [serverId] = api.split(':');
                return connectedServerIds.includes(serverId);
            });
            if (hasConnection) {
                relatedPages.push(pageCard);
                // Find specific API items within the page card that connect to related servers
                const pageApiItems = pageCard.querySelectorAll('.api-item');
                pageApiItems.forEach(apiItem => {
                    const apiData = apiItem.dataset.fullApi;
                    if (apiData) {
                        const [serverId] = apiData.split(':');
                        if (connectedServerIds.includes(serverId)) {
                            relatedApiItems.push(apiItem);
                        }
                    }
                });
            }
        });
    }
    _findBackendsRelatedToServers(servers, relatedBackends) {
        servers.forEach(serverCard => {
            const serverBackend = serverCard.dataset.backend;
            if (serverBackend) {
                const backendCard = document.querySelector(`.backend-card[data-backend="${serverBackend}"]`);
                if (backendCard && !relatedBackends.includes(backendCard)) {
                    relatedBackends.push(backendCard);
                }
            }
        });
    }
    _findServersRelatedToBackend(backendCard, relatedServers) {
        const hoveredBackendId = backendCard.dataset.backend;
        if (!hoveredBackendId)
            return;
        // Find servers that use this backend
        this.serverCards.forEach(serverCard => {
            const serverBackend = serverCard.dataset.backend;
            if (serverBackend === hoveredBackendId) {
                relatedServers.push(serverCard);
            }
        });
    }
    setActiveClasses(hoveredCard, relatedElements) {
        // Clear all active classes first
        this.clearActiveClasses();
        // Set active class for hovered card
        hoveredCard.classList.add('active');
        // Set active classes for related cards
        [...relatedElements.pages, ...relatedElements.servers, ...relatedElements.backends].forEach(relatedCard => {
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
        [...this.pageCards, ...this.serverCards, ...this.backendCards].forEach(card => {
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
    getUniqueRelationPairs(hoveredCard, relatedElements) {
        const connectionPairs = [];
        const uniquePairs = new Set();
        console.log('🔍 Getting unique connection pairs for:', hoveredCard.classList.toString());
        if (hoveredCard.classList.contains('page-card')) {
            return this._getPageConnectionPairs(hoveredCard, relatedElements, connectionPairs, uniquePairs);
        }
        else if (hoveredCard.classList.contains('server-card')) {
            return this._getServerConnectionPairs(hoveredCard, relatedElements, connectionPairs, uniquePairs);
        }
        else if (hoveredCard.classList.contains('backend-card')) {
            return this._getBackendConnectionPairs(hoveredCard, relatedElements, connectionPairs, uniquePairs);
        }
        return connectionPairs;
    }
    _getPageConnectionPairs(pageCard, relatedElements, connectionPairs, uniquePairs) {
        const pageApisData = pageCard.dataset.apis;
        if (!pageApisData)
            return connectionPairs;
        const pageApis = JSON.parse(pageApisData);
        const uniqueServerIds = new Set();
        // 1. Page-to-Server API connections
        pageApis.forEach(api => {
            const [serverId, apiPath] = api.split(':');
            const method = apiPath.trim().split(' ')[0];
            uniqueServerIds.add(serverId);
            // Find page API element
            const pageApiElement = pageCard.querySelector(`[data-full-api="${api}"]`);
            // Find server API element - only from related servers
            const serverCard = relatedElements.servers.find(s => s.dataset.server === serverId);
            if (serverCard && pageApiElement) {
                const serverApiElements = serverCard.querySelectorAll('.api-item');
                let serverApiElement = null;
                serverApiElements.forEach(element => {
                    const serverApiText = element.dataset.apiText || element.textContent?.trim();
                    if (serverApiText === apiPath.trim()) {
                        serverApiElement = element;
                    }
                });
                if (serverApiElement) {
                    const pageApiId = pageApiElement.dataset.fullApi || pageApiElement.getAttribute('data-full-api') || '';
                    const serverApiId = serverApiElement.dataset.apiText || serverApiElement.getAttribute('data-api-text') || '';
                    const pairKey = `${pageApiId}-${serverApiId}`;
                    if (!uniquePairs.has(pairKey)) {
                        uniquePairs.add(pairKey);
                        connectionPairs.push({
                            from: pageApiElement,
                            to: serverApiElement,
                            type: ConnectionType.PAGE_TO_SERVER,
                            method: method,
                            api: api
                        });
                    }
                }
            }
        });
        // 2. Server-to-Backend connections (once per unique server)
        console.log('  Creating server-to-backend connections for servers:', Array.from(uniqueServerIds));
        uniqueServerIds.forEach(serverId => {
            const serverCard = relatedElements.servers.find(s => s.dataset.server === serverId);
            if (serverCard) {
                const serverBackend = serverCard.dataset.backend;
                if (serverBackend) {
                    const backendCard = relatedElements.backends.find(b => b.dataset.backend === serverBackend);
                    if (backendCard) {
                        const pairKey = `${serverId}-${serverBackend}`;
                        console.log(`    Checking pair: ${pairKey}, already exists: ${uniquePairs.has(pairKey)}`);
                        if (!uniquePairs.has(pairKey)) {
                            uniquePairs.add(pairKey);
                            connectionPairs.push({
                                from: serverCard,
                                to: backendCard,
                                type: ConnectionType.SERVER_TO_BACKEND
                            });
                        }
                    }
                }
            }
        });
        return connectionPairs;
    }
    _getServerConnectionPairs(serverCard, relatedElements, connectionPairs, uniquePairs) {
        const hoveredServerId = serverCard.dataset.server;
        if (!hoveredServerId)
            return connectionPairs;
        // 1. Page-to-Server API connections
        relatedElements.pages.forEach(pageCard => {
            const pageApisData = pageCard.dataset.apis;
            if (!pageApisData)
                return;
            const pageApis = JSON.parse(pageApisData);
            pageApis.forEach(api => {
                const [serverId, apiPath] = api.split(':');
                if (serverId !== hoveredServerId)
                    return;
                const method = apiPath.trim().split(' ')[0];
                // Find page API element
                const pageApiElement = pageCard.querySelector(`[data-full-api="${api}"]`);
                // Find server API element
                let serverApiElement = null;
                const serverApiElements = serverCard.querySelectorAll('.api-item');
                serverApiElements.forEach(element => {
                    const serverApiText = element.dataset.apiText || element.textContent?.trim();
                    if (serverApiText === apiPath.trim()) {
                        serverApiElement = element;
                    }
                });
                if (pageApiElement && serverApiElement) {
                    const pageApiId = pageApiElement.dataset.fullApi || pageApiElement.getAttribute('data-full-api') || '';
                    const serverApiId = serverApiElement.dataset.apiText || serverApiElement.getAttribute('data-api-text') || '';
                    const pairKey = `${pageApiId}-${serverApiId}`;
                    if (!uniquePairs.has(pairKey)) {
                        uniquePairs.add(pairKey);
                        connectionPairs.push({
                            from: pageApiElement,
                            to: serverApiElement,
                            type: ConnectionType.PAGE_TO_SERVER,
                            method: method,
                            api: api
                        });
                    }
                }
            });
        });
        // 2. Server-to-Backend connection
        const serverBackend = serverCard.dataset.backend;
        if (serverBackend) {
            const backendCard = relatedElements.backends.find(b => b.dataset.backend === serverBackend);
            if (backendCard) {
                const pairKey = `${hoveredServerId}-${serverBackend}`;
                if (!uniquePairs.has(pairKey)) {
                    uniquePairs.add(pairKey);
                    connectionPairs.push({
                        from: serverCard,
                        to: backendCard,
                        type: ConnectionType.SERVER_TO_BACKEND
                    });
                }
            }
        }
        return connectionPairs;
    }
    _getBackendConnectionPairs(backendCard, relatedElements, connectionPairs, uniquePairs) {
        const hoveredBackendId = backendCard.dataset.backend;
        if (!hoveredBackendId)
            return connectionPairs;
        // Find connected server IDs
        const connectedServerIds = [];
        relatedElements.servers.forEach(serverCard => {
            const serverId = serverCard.dataset.server;
            if (serverId) {
                connectedServerIds.push(serverId);
            }
        });
        // 1. Page-to-Server API connections for related pages/servers
        relatedElements.pages.forEach(pageCard => {
            const pageApisData = pageCard.dataset.apis;
            if (!pageApisData)
                return;
            const pageApis = JSON.parse(pageApisData);
            pageApis.forEach(api => {
                const [serverId, apiPath] = api.split(':');
                if (!connectedServerIds.includes(serverId))
                    return;
                const method = apiPath.trim().split(' ')[0];
                // Find page API element
                const pageApiElement = pageCard.querySelector(`[data-full-api="${api}"]`);
                // Find server card and API element
                const serverCard = relatedElements.servers.find(s => s.dataset.server === serverId);
                let serverApiElement = null;
                if (serverCard) {
                    const serverApiElements = serverCard.querySelectorAll('.api-item');
                    serverApiElements.forEach(element => {
                        const serverApiText = element.dataset.apiText || element.textContent?.trim();
                        if (serverApiText === apiPath.trim()) {
                            serverApiElement = element;
                        }
                    });
                }
                if (pageApiElement && serverApiElement) {
                    const pageApiId = pageApiElement.dataset.fullApi || pageApiElement.getAttribute('data-full-api') || '';
                    const serverApiId = serverApiElement.dataset.apiText || serverApiElement.getAttribute('data-api-text') || '';
                    const pairKey = `${pageApiId}-${serverApiId}`;
                    if (!uniquePairs.has(pairKey)) {
                        uniquePairs.add(pairKey);
                        connectionPairs.push({
                            from: pageApiElement,
                            to: serverApiElement,
                            type: ConnectionType.PAGE_TO_SERVER,
                            method: method,
                            api: api
                        });
                    }
                }
            });
        });
        // 2. Server-to-Backend connections
        relatedElements.servers.forEach(serverCard => {
            const serverId = serverCard.dataset.server;
            if (serverId) {
                const pairKey = `${serverId}-${hoveredBackendId}`;
                if (!uniquePairs.has(pairKey)) {
                    uniquePairs.add(pairKey);
                    connectionPairs.push({
                        from: serverCard,
                        to: backendCard,
                        type: ConnectionType.SERVER_TO_BACKEND
                    });
                }
            }
        });
        return connectionPairs;
    }
}
