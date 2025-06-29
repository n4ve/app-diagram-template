/**
 * SHARED MODULE: Connection Management
 * Used by: ConnectionArea component, ArchitectureDiagram component
 * Purpose: Handles SVG line drawing, connection logic, and visual connections between API elements
 */
export class ConnectionManager {
    connectionSvg = null;
    drawnConnections = new Set();
    constructor() {
        this.connectionSvg = null;
        this.drawnConnections = new Set();
    }
    initialize() {
        const svg = document.getElementById('connection-svg');
        if (!svg || !(svg instanceof SVGElement)) {
            console.error('Connection SVG not found or not an SVG element');
            return false;
        }
        this.connectionSvg = svg;
        return true;
    }
    getMethodColor(method) {
        const colors = {
            'GET': '#10b981',
            'POST': '#3b82f6',
            'PUT': '#f59e0b',
            'DELETE': '#ef4444',
            'PATCH': '#8b5cf6',
            'HEAD': '#6b7280',
            'OPTIONS': '#6b7280'
        };
        return colors[method] || '#6B7280';
    }
    getMethodDashPattern(method) {
        const patterns = {
            'GET': 'none',
            'POST': '5,5',
            'PUT': '10,5',
            'DELETE': '15,10,5,10',
            'PATCH': '8,3,3,3',
            'HEAD': '2,2',
            'OPTIONS': '1,1'
        };
        return patterns[method] || 'none';
    }
    createConnectionLine(fromElement, toElement, color = '#3b82f6', method = '') {
        if (!this.connectionSvg || !fromElement || !toElement)
            return null;
        // Create unique connection ID based on data attributes and position
        const fromApi = fromElement.dataset.fullApi || fromElement.dataset.apiText || fromElement.textContent?.trim();
        const toApi = toElement.dataset.fullApi || toElement.dataset.apiText || toElement.textContent?.trim();
        const connectionId = `${fromApi}-to-${toApi}`;
        if (this.drawnConnections.has(connectionId)) {
            return null;
        }
        this.drawnConnections.add(connectionId);
        // Get element positions relative to viewport
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        const svgRect = this.connectionSvg.getBoundingClientRect();
        // Calculate center points relative to SVG
        let fromX = fromRect.left + fromRect.width / 2 - svgRect.left;
        let fromY = fromRect.top + fromRect.height / 2 - svgRect.top;
        let toX = toRect.left + toRect.width / 2 - svgRect.left;
        let toY = toRect.top + toRect.height / 2 - svgRect.top;
        // Adjust connection points based on direction
        if (fromElement.closest('.page-card') && toElement.closest('.server-card')) {
            // Page to server: page right edge to server left edge
            fromX = fromRect.right - svgRect.left;
            toX = toRect.left - svgRect.left;
        }
        else if (fromElement.closest('.server-card') && toElement.closest('.backend-card')) {
            // Server to backend: server right edge to backend left edge
            fromX = fromRect.right - svgRect.left;
            toX = toRect.left - svgRect.left;
        }
        else {
            // Default: center to center
            fromX = fromRect.left + fromRect.width / 2 - svgRect.left;
            fromY = fromRect.top + fromRect.height / 2 - svgRect.top;
            toX = toRect.left + toRect.width / 2 - svgRect.left;
            toY = toRect.top + toRect.height / 2 - svgRect.top;
        }
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(fromX));
        line.setAttribute('y1', String(fromY));
        line.setAttribute('x2', String(toX));
        line.setAttribute('y2', String(toY));
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '3');
        line.setAttribute('opacity', '0.8');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('fill', 'none');
        line.classList.add('connection-line');
        if (method) {
            line.setAttribute('data-method', method);
            line.setAttribute('stroke-dasharray', this.getMethodDashPattern(method));
        }
        return line;
    }
    clearConnections() {
        if (!this.connectionSvg)
            return;
        this.connectionSvg.innerHTML = '';
        this.drawnConnections.clear();
    }
    drawConnectionsForCurrentState() {
        this.drawConnectionsForActiveCards();
    }
    drawConnectionsForActiveCards() {
        if (!this.connectionSvg)
            return;
        const activePageCards = document.querySelectorAll('.page-card.active');
        const activeServerCards = document.querySelectorAll('.server-card.active');
        activePageCards.forEach(pageCard => {
            const pageApisData = pageCard.dataset.apis;
            if (!pageApisData)
                return;
            const pageApis = JSON.parse(pageApisData);
            pageApis.forEach(pageApi => {
                const [serverId, apiPath] = pageApi.split(':');
                const method = apiPath.trim().split(' ')[0];
                const color = this.getMethodColor(method);
                const serverCard = Array.from(activeServerCards).find(card => card.dataset.server === serverId);
                if (serverCard) {
                    const pageApiItem = pageCard.querySelector(`[data-full-api="${pageApi}"]`);
                    const serverApiItems = serverCard.querySelectorAll('.api-item');
                    let matchingServerApiItem = null;
                    serverApiItems.forEach(serverApiItem => {
                        const serverApiText = serverApiItem.textContent?.trim();
                        if (serverApiText === apiPath.trim()) {
                            matchingServerApiItem = serverApiItem;
                        }
                    });
                    if (pageApiItem && matchingServerApiItem) {
                        const line = this.createConnectionLine(pageApiItem, matchingServerApiItem, color, method);
                        if (line && this.connectionSvg) {
                            line.setAttribute('stroke-width', '4');
                            line.setAttribute('opacity', '0.9');
                            this.connectionSvg.appendChild(line);
                        }
                    }
                }
            });
        });
        // Note: Server-to-backend connections for hover are handled in HoverEventManager
        // This method is for bulk active card connections, not hover-specific connections
    }
}
