/**
 * SHARED MODULE: Card Relationship Management
 * Used by: ConnectionArea component, PageCard component, ServerCard component
 * Purpose: Manages API-based relationships between cards using JSON data mappings
 */

import type { 
    CardRelationshipManager as ICardRelationshipManager, 
    RelatedElements,
    ConnectionPair,
    HttpMethod
} from '../../types/index.js';
import { ConnectionType } from '../../types/index.js';

export class CardRelationshipManager implements ICardRelationshipManager {
    private pageCards: NodeListOf<HTMLElement> = document.querySelectorAll('.page-card');
    private serverCards: NodeListOf<HTMLElement> = document.querySelectorAll('.server-card');
    private backendCards: NodeListOf<HTMLElement> = document.querySelectorAll('.backend-card');
    private groupCards: NodeListOf<HTMLElement> = document.querySelectorAll('.group-card');

    constructor() {
        this.pageCards = document.querySelectorAll('.page-card');
        this.serverCards = document.querySelectorAll('.server-card');
        this.backendCards = document.querySelectorAll('.backend-card');
        this.groupCards = document.querySelectorAll('.group-card');
    }

    initialize(): boolean {
        this.pageCards = document.querySelectorAll('.page-card');
        this.serverCards = document.querySelectorAll('.server-card');
        this.backendCards = document.querySelectorAll('.backend-card');
        this.groupCards = document.querySelectorAll('.group-card');
        
        // Only require that at least one type of card exists
        const totalCards = this.pageCards.length + this.serverCards.length + this.backendCards.length + this.groupCards.length;
        if (totalCards === 0) {
            console.error('No cards found');
            return false;
        }
        return true;
    }

    findRelatedCards(hoveredCard: HTMLElement): RelatedElements {
        console.log('🚨🚨🚨 CARDRELATIONSHIPMANAGER FINDRELATEDCARDS CALLED 🚨🚨🚨');
        const relatedPages: HTMLElement[] = [];
        const relatedServers: HTMLElement[] = [];
        const relatedBackends: HTMLElement[] = [];
        const relatedApiItems: HTMLElement[] = [];

        // Log the hovered card
        console.log('🎯 Finding related cards for:', {
            type: hoveredCard.classList.toString(),
            id: hoveredCard.dataset.server || hoveredCard.dataset.backend || hoveredCard.dataset.apis?.substring(0, 50) + '...',
            dataset: hoveredCard.dataset
        });

        console.log('🔍 TESTING CONDITIONS:');
        console.log('🔍 has page-card:', hoveredCard.classList.contains('page-card'));
        console.log('🔍 has group-card:', hoveredCard.classList.contains('group-card'));
        console.log('🔍 has server-card:', hoveredCard.classList.contains('server-card'));
        console.log('🔍 has backend-card:', hoveredCard.classList.contains('backend-card'));
        
        if (hoveredCard.classList.contains('page-card')) {
            console.log('🔍 ENTERING PAGE CARD LOGIC');
            // Page relations: page -> servers -> backends
            this._findServersRelatedToPage(hoveredCard, relatedServers, relatedApiItems);
            this._findBackendsRelatedToServers(relatedServers, relatedBackends);
        } else if (hoveredCard.classList.contains('group-card')) {
            console.log('🔍 ENTERING GROUP CARD LOGIC');
            // Group relations: group -> servers -> backends (using all APIs from group)
            this._findServersRelatedToGroup(hoveredCard, relatedServers, relatedApiItems);
            this._findBackendsRelatedToServers(relatedServers, relatedBackends);
        } else if (hoveredCard.classList.contains('server-card')) {
            // Server relations: server -> pages & server -> backends
            // In group view, find related groups instead of pages
            console.log('🔍 SERVER CARD DETECTED - calling _isGroupViewMode()');
            const isGroupView = this._isGroupViewMode();
            if (isGroupView) {
                this._findGroupsRelatedToServer(hoveredCard, relatedPages, relatedApiItems);
            } else {
                this._findPagesRelatedToServer(hoveredCard, relatedPages, relatedApiItems);
            }
            this._findBackendsRelatedToServers([hoveredCard], relatedBackends);
        } else if (hoveredCard.classList.contains('backend-card')) {
            // Backend relations: backend -> servers -> pages/groups
            this._findServersRelatedToBackend(hoveredCard, relatedServers);
            console.log('🔍 BACKEND CARD DETECTED - calling _isGroupViewMode()');
            const isGroupView = this._isGroupViewMode();
            if (isGroupView) {
                this._findGroupsRelatedToServers(relatedServers, relatedPages, relatedApiItems);
            } else {
                this._findPagesRelatedToServers(relatedServers, relatedPages, relatedApiItems);
            }
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
    private _findServersRelatedToPage(pageCard: HTMLElement, relatedServers: HTMLElement[], relatedApiItems: HTMLElement[]): void {
        const pageApisData = pageCard.dataset.apis;
        if (!pageApisData) return;

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
    }

    private _findPagesRelatedToServer(serverCard: HTMLElement, relatedPages: HTMLElement[], relatedApiItems: HTMLElement[]): void {
        const hoveredServerId = serverCard.dataset.server;
        if (!hoveredServerId) return;
        
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
    }

    private _findPagesRelatedToServers(servers: HTMLElement[], relatedPages: HTMLElement[], relatedApiItems: HTMLElement[]): void {
        const connectedServerIds = servers.map(s => s.dataset.server).filter(Boolean) as string[];
        
        this.pageCards.forEach(pageCard => {
            const pageApisData = pageCard.dataset.apis;
            if (!pageApisData) return;

            const pageApis: string[] = JSON.parse(pageApisData);
            const hasConnection = pageApis.some(api => {
                const [serverId] = api.split(':');
                return connectedServerIds.includes(serverId);
            });
            
            if (hasConnection) {
                relatedPages.push(pageCard);
                
                // Find specific API items within the page card that connect to related servers
                const pageApiItems = pageCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
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

    private _findBackendsRelatedToServers(servers: HTMLElement[], relatedBackends: HTMLElement[]): void {
        servers.forEach(serverCard => {
            const serverBackend = serverCard.dataset.backend;
            if (serverBackend) {
                const backendCard = document.querySelector(`.backend-card[data-backend="${serverBackend}"]`) as HTMLElement;
                if (backendCard && !relatedBackends.includes(backendCard)) {
                    relatedBackends.push(backendCard);
                }
            }
        });
    }

    private _findServersRelatedToBackend(backendCard: HTMLElement, relatedServers: HTMLElement[]): void {
        const hoveredBackendId = backendCard.dataset.backend;
        if (!hoveredBackendId) return;
        
        // Find servers that use this backend
        this.serverCards.forEach(serverCard => {
            const serverBackend = serverCard.dataset.backend;
            if (serverBackend === hoveredBackendId) {
                relatedServers.push(serverCard);
            }
        });
    }

    setActiveClasses(hoveredCard: HTMLElement, relatedElements: RelatedElements): void {
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

    clearActiveClasses(): void {
        [...this.pageCards, ...this.serverCards, ...this.backendCards, ...this.groupCards].forEach(card => {
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

    getUniqueRelationPairs(hoveredCard: HTMLElement, relatedElements: RelatedElements): ConnectionPair[] {
        const connectionPairs: ConnectionPair[] = [];
        const uniquePairs = new Set<string>();

        console.log('🔍 Getting unique connection pairs for:', hoveredCard.classList.toString());

        if (hoveredCard.classList.contains('page-card')) {
            return this._getPageConnectionPairs(hoveredCard, relatedElements, connectionPairs, uniquePairs);
        } else if (hoveredCard.classList.contains('group-card')) {
            return this._getGroupConnectionPairs(hoveredCard, relatedElements, connectionPairs, uniquePairs);
        } else if (hoveredCard.classList.contains('server-card')) {
            return this._getServerConnectionPairs(hoveredCard, relatedElements, connectionPairs, uniquePairs);
        } else if (hoveredCard.classList.contains('backend-card')) {
            return this._getBackendConnectionPairs(hoveredCard, relatedElements, connectionPairs, uniquePairs);
        }

        return connectionPairs;
    }

    private _getPageConnectionPairs(
        pageCard: HTMLElement, 
        relatedElements: RelatedElements, 
        connectionPairs: ConnectionPair[], 
        uniquePairs: Set<string>
    ): ConnectionPair[] {
        const pageApisData = pageCard.dataset.apis;
        if (!pageApisData) return connectionPairs;

        const pageApis: string[] = JSON.parse(pageApisData);
        const uniqueServerIds = new Set<string>();

        // 1. Page-to-Server API connections
        pageApis.forEach(api => {
            const [serverId, apiPath] = api.split(':');
            const method = apiPath.trim().split(' ')[0] as HttpMethod;
            uniqueServerIds.add(serverId);

            // Find page API element
            const pageApiElement = pageCard.querySelector(`[data-full-api="${api}"]`) as HTMLElement;
            
            // Find server API element - only from related servers
            const serverCard = relatedElements.servers.find(s => s.dataset.server === serverId);
            if (serverCard && pageApiElement) {
                const serverApiElements = serverCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
                let serverApiElement: HTMLElement | null = null;
                
                serverApiElements.forEach(element => {
                    const serverApiText = element.dataset.apiText || element.textContent?.trim();
                    if (serverApiText === apiPath.trim()) {
                        serverApiElement = element;
                    }
                });

                if (serverApiElement) {
                    // Create unique key that includes both page ID and API to allow multiple pages to connect to same API
                    const pageId = pageCard.dataset.page || pageCard.id || 'unknown-page';
                    const serverId = serverCard.dataset.server || 'unknown-server';
                    const pairKey = `page:${pageId}-server:${serverId}-api:${api}`;
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

    private _getServerConnectionPairs(
        serverCard: HTMLElement, 
        relatedElements: RelatedElements, 
        connectionPairs: ConnectionPair[], 
        uniquePairs: Set<string>
    ): ConnectionPair[] {
        const hoveredServerId = serverCard.dataset.server;
        if (!hoveredServerId) return connectionPairs;

        // Check if we're in group view mode
        const isGroupView = this._isGroupViewMode();

        if (isGroupView) {
            // 1. Group-to-Server connections (when in group view mode)
            // Only consider visible group cards (not filtered/hidden ones)
            relatedElements.pages.forEach(groupCard => { // Note: in group view, relatedElements.pages contains group cards
                // Skip hidden/filtered group cards
                if (groupCard.style.display === 'none' || groupCard.classList.contains('filtered-hidden')) {
                    return;
                }
                
                const groupApisData = groupCard.dataset.apis;
                if (!groupApisData) return;

                const groupApis: string[] = JSON.parse(groupApisData);
                
                // Check if group has APIs for this server
                const hasServerApis = groupApis.some(api => api.startsWith(`${hoveredServerId}:`));
                if (hasServerApis) {
                    const groupId = groupCard.dataset.group || groupCard.id || 'unknown-group';
                    const pairKey = `group:${groupId}-server:${hoveredServerId}`;
                    if (!uniquePairs.has(pairKey)) {
                        uniquePairs.add(pairKey);
                        connectionPairs.push({
                            from: groupCard,
                            to: serverCard,
                            type: ConnectionType.GROUP_TO_SERVER
                        });
                    }
                }
            });
        } else {
            // 1. Page-to-Server API connections (when in page view mode)
            relatedElements.pages.forEach(pageCard => {
                const pageApisData = pageCard.dataset.apis;
                if (!pageApisData) return;

                const pageApis: string[] = JSON.parse(pageApisData);
                
                pageApis.forEach(api => {
                    const [serverId, apiPath] = api.split(':');
                    if (serverId !== hoveredServerId) return;
                    
                    const method = apiPath.trim().split(' ')[0] as HttpMethod;
                    
                    // Find page API element
                    const pageApiElement = pageCard.querySelector(`[data-full-api="${api}"]`) as HTMLElement;
                    
                    // Find server API element
                    let serverApiElement: HTMLElement | null = null;
                    const serverApiElements = serverCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
                    serverApiElements.forEach(element => {
                        const serverApiText = element.dataset.apiText || element.textContent?.trim();
                        if (serverApiText === apiPath.trim()) {
                            serverApiElement = element;
                        }
                    });
                    
                    if (pageApiElement && serverApiElement) {
                        // Create unique key that includes both page ID and API to allow multiple pages to connect to same API
                        const pageId = pageCard.dataset.page || pageCard.id || 'unknown-page';
                        const pairKey = `page:${pageId}-server:${hoveredServerId}-api:${api}`;
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
        }

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

    private _getBackendConnectionPairs(
        backendCard: HTMLElement, 
        relatedElements: RelatedElements, 
        connectionPairs: ConnectionPair[], 
        uniquePairs: Set<string>
    ): ConnectionPair[] {
        const hoveredBackendId = backendCard.dataset.backend;
        if (!hoveredBackendId) return connectionPairs;

        // Find connected server IDs
        const connectedServerIds: string[] = [];
        relatedElements.servers.forEach(serverCard => {
            const serverId = serverCard.dataset.server;
            if (serverId) {
                connectedServerIds.push(serverId);
            }
        });

        // Check if we're in group view mode
        const isGroupView = this._isGroupViewMode();

        if (isGroupView) {
            // 1. Group-to-Server connections for related groups/servers (when in group view mode)
            // Only consider visible group cards (not filtered/hidden ones)
            relatedElements.pages.forEach(groupCard => { // Note: in group view, relatedElements.pages contains group cards
                // Skip hidden/filtered group cards
                if (groupCard.style.display === 'none' || groupCard.classList.contains('filtered-hidden')) {
                    return;
                }
                
                const groupApisData = groupCard.dataset.apis;
                if (!groupApisData) return;

                const groupApis: string[] = JSON.parse(groupApisData);
                
                // Check if group has APIs for any connected servers
                groupApis.forEach(api => {
                    const [serverId] = api.split(':');
                    if (!connectedServerIds.includes(serverId)) return;
                    
                    const serverCard = relatedElements.servers.find(s => s.dataset.server === serverId);
                    if (serverCard) {
                        const groupId = groupCard.dataset.group || groupCard.id || 'unknown-group';
                        const pairKey = `group:${groupId}-server:${serverId}`;
                        if (!uniquePairs.has(pairKey)) {
                            uniquePairs.add(pairKey);
                            connectionPairs.push({
                                from: groupCard,
                                to: serverCard,
                                type: ConnectionType.GROUP_TO_SERVER
                            });
                        }
                    }
                });
            });
        } else {
            // 1. Page-to-Server API connections for related pages/servers (when in page view mode)
            relatedElements.pages.forEach(pageCard => {
                const pageApisData = pageCard.dataset.apis;
                if (!pageApisData) return;

                const pageApis: string[] = JSON.parse(pageApisData);
                
                pageApis.forEach(api => {
                    const [serverId, apiPath] = api.split(':');
                    if (!connectedServerIds.includes(serverId)) return;
                    
                    const method = apiPath.trim().split(' ')[0] as HttpMethod;
                    
                    // Find page API element
                    const pageApiElement = pageCard.querySelector(`[data-full-api="${api}"]`) as HTMLElement;
                    
                    // Find server card and API element
                    const serverCard = relatedElements.servers.find(s => s.dataset.server === serverId);
                    let serverApiElement: HTMLElement | null = null;
                    
                    if (serverCard) {
                        const serverApiElements = serverCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
                        serverApiElements.forEach(element => {
                            const serverApiText = element.dataset.apiText || element.textContent?.trim();
                            if (serverApiText === apiPath.trim()) {
                                serverApiElement = element;
                            }
                        });
                    }
                    
                    if (pageApiElement && serverApiElement) {
                        // Create unique key that includes both page ID and API to allow multiple pages to connect to same API
                        const pageId = pageCard.dataset.page || pageCard.id || 'unknown-page';
                        const pairKey = `page:${pageId}-server:${serverId}-api:${api}`;
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
        }

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

    private _getGroupConnectionPairs(
        groupCard: HTMLElement, 
        relatedElements: RelatedElements, 
        connectionPairs: ConnectionPair[], 
        uniquePairs: Set<string>
    ): ConnectionPair[] {
        // Group connections work like page connections but with aggregated APIs
        
        // 1. Group-to-Server connections
        relatedElements.servers.forEach(serverCard => {
            const serverId = serverCard.dataset.server;
            if (!serverId) return;
            
            // Create a single connection from group to server (not individual API connections)
            const pairKey = `group:${groupCard.dataset.group}-server:${serverId}`;
            if (!uniquePairs.has(pairKey)) {
                uniquePairs.add(pairKey);
                connectionPairs.push({
                    from: groupCard,
                    to: serverCard,
                    type: ConnectionType.GROUP_TO_SERVER
                });
            }
        });

        // Note: For group view, we only show group-to-server connections
        // Server-to-backend connections are not shown to keep focus on group relationships

        return connectionPairs;
    }

    // Group-specific relationship methods
    private _findServersRelatedToGroup(groupCard: HTMLElement, relatedServers: HTMLElement[], relatedApiItems: HTMLElement[]): void {
        const groupApisData = groupCard.dataset.apis;
        if (!groupApisData) return;

        const groupApis: string[] = JSON.parse(groupApisData);
        const relatedServerIds = new Set<string>();
        
        // Extract server IDs from group APIs
        groupApis.forEach(api => {
            const [serverId] = api.split(':');
            relatedServerIds.add(serverId);
        });
        
        // Find server cards that have direct API connections
        this.serverCards.forEach(serverCard => {
            const serverId = serverCard.dataset.server;
            if (serverId && relatedServerIds.has(serverId)) {
                relatedServers.push(serverCard);
                
                // Find specific API items within the server card that match group APIs
                const serverApiItems = serverCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
                serverApiItems.forEach(apiItem => {
                    const apiText = apiItem.textContent?.trim();
                    const isRelated = groupApis.some(groupApi => {
                        const [, apiPath] = groupApi.split(':');
                        return apiText === apiPath.trim();
                    });
                    if (isRelated) {
                        relatedApiItems.push(apiItem);
                    }
                });
            }
        });
    }

    private _findGroupsRelatedToServer(serverCard: HTMLElement, relatedGroups: HTMLElement[], relatedApiItems: HTMLElement[]): void {
        const hoveredServerId = serverCard.dataset.server;
        if (!hoveredServerId) return;
        
        // Find groups that have direct API connections to this server
        this.groupCards.forEach(groupCard => {
            const groupApisData = groupCard.dataset.apis;
            if (!groupApisData) return;
            
            const groupApis: string[] = JSON.parse(groupApisData);
            const hasApiConnection = groupApis.some(api => api.startsWith(`${hoveredServerId}:`));
            
            if (hasApiConnection) {
                relatedGroups.push(groupCard);
                
                // Mark specific APIs in the server card as related to this group
                const serverApiItems = serverCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
                serverApiItems.forEach(apiItem => {
                    const apiText = apiItem.textContent?.trim();
                    const isRelated = groupApis.some(groupApi => {
                        const [, apiPath] = groupApi.split(':');
                        return apiText === apiPath.trim();
                    });
                    if (isRelated && !relatedApiItems.includes(apiItem)) {
                        relatedApiItems.push(apiItem);
                    }
                });
            }
        });
    }

    private _findGroupsRelatedToServers(servers: HTMLElement[], relatedGroups: HTMLElement[], relatedApiItems: HTMLElement[]): void {
        servers.forEach(serverCard => {
            this._findGroupsRelatedToServer(serverCard, relatedGroups, relatedApiItems);
        });
    }

    /**
     * Determine if we're currently in group view mode by checking element visibility
     * instead of just element count (which is unreliable since both views exist in DOM)
     */
    private _isGroupViewMode(): boolean {
        // Check if any group cards are visible
        const groupCards = document.querySelectorAll('.group-card') as NodeListOf<HTMLElement>;
        const pageCards = document.querySelectorAll('.page-card') as NodeListOf<HTMLElement>;
        
        console.log('🔍 View mode detection:', {
            groupCardsCount: groupCards.length,
            pageCardsCount: pageCards.length
        });
        
        // If no cards exist, default to page view
        if (groupCards.length === 0 && pageCards.length === 0) {
            console.log('🔍 No cards found, defaulting to page view');
            return false;
        }
        
        // Check if group cards are visible (not hidden with display: none or hidden class)
        for (let i = 0; i < groupCards.length; i++) {
            const groupCard = groupCards[i];
            const isVisible = groupCard.style.display !== 'none' && 
                            !groupCard.classList.contains('hidden') &&
                            groupCard.offsetParent !== null; // Check if element is actually visible
            
            console.log(`🔍 Group card ${i}:`, {
                display: groupCard.style.display,
                hasHiddenClass: groupCard.classList.contains('hidden'),
                offsetParent: !!groupCard.offsetParent,
                isVisible: isVisible
            });
            
            if (isVisible) {
                console.log('🔍 Found visible group card - GROUP VIEW MODE');
                return true;
            }
        }
        
        console.log('🔍 No visible group cards found - PAGE VIEW MODE');
        return false;
    }
}