/**
 * SHARED MODULE: Connection Management
 * Used by: ConnectionArea component, ArchitectureDiagram component
 * Purpose: Handles SVG line drawing, connection logic, and visual connections between API elements
 */

import type { 
    ConnectionManager as IConnectionManager, 
    HttpMethod, 
    ConnectionInfo, 
    SVGConnectionData 
} from '../../types/index.js';

export class ConnectionManager implements IConnectionManager {
    private connectionSvg: SVGElement | null = null;
    private drawnConnections: Set<string> = new Set();

    constructor() {
        this.connectionSvg = null;
        this.drawnConnections = new Set();
    }

    initialize(): boolean {
        const svg = document.getElementById('connection-svg');
        if (!svg || !(svg instanceof SVGElement)) {
            console.error('Connection SVG not found or not an SVG element');
            return false;
        }
        this.connectionSvg = svg;
        return true;
    }

    getMethodColor(method: string): string {
        const colors: Record<HttpMethod, string> = {
            'GET': '#10b981',
            'POST': '#3b82f6', 
            'PUT': '#f59e0b',
            'DELETE': '#ef4444',
            'PATCH': '#8b5cf6',
            'HEAD': '#6b7280',
            'OPTIONS': '#6b7280'
        };
        return colors[method as HttpMethod] || '#6b7280';
    }

    getMethodDashPattern(method: string): string {
        const patterns: Record<HttpMethod, string> = {
            'GET': 'none',
            'POST': '5,5',
            'PUT': '10,5',
            'DELETE': '15,10,5,10',
            'PATCH': '8,3,3,3',
            'HEAD': '2,2',
            'OPTIONS': '1,1'
        };
        return patterns[method as HttpMethod] || 'none';
    }

    createConnectionLine(
        fromElement: HTMLElement, 
        toElement: HTMLElement, 
        color: string = '#3b82f6', 
        method: string = ''
    ): SVGElement | null {
        if (!this.connectionSvg || !fromElement || !toElement) return null;

        // Create unique connection ID based on data attributes and position
        const fromApi = fromElement.dataset.fullApi || fromElement.dataset.apiText || fromElement.textContent?.trim();
        const toApi = toElement.dataset.fullApi || toElement.dataset.apiText || toElement.textContent?.trim();
        const connectionId = `${fromApi}-to-${toApi}`;
        
        console.log(`🔗 Checking connection ID: "${connectionId}"`);
        console.log(`   Already drawn: ${this.drawnConnections.has(connectionId)}`);
        
        if (this.drawnConnections.has(connectionId)) {
            console.log(`   ❌ Connection already exists, skipping`);
            return null;
        }

        this.drawnConnections.add(connectionId);
        console.log(`   ✅ New connection, proceeding with line creation`);

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
        if (fromElement.closest('.page-card')) {
            fromX = fromRect.right - svgRect.left;
            toX = toRect.left - svgRect.left;
        } else {
            fromX = fromRect.left - svgRect.left;
            toX = toRect.right - svgRect.left;
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

    clearConnections(): void {
        if (!this.connectionSvg) return;
        
        this.connectionSvg.innerHTML = '';
        this.drawnConnections.clear();
    }

    drawConnectionsForCurrentState(): void {
        this.drawConnectionsForActiveCards();
    }

    private drawConnectionsForActiveCards(): void {
        if (!this.connectionSvg) return;

        const activePageCards = document.querySelectorAll('.page-card.active') as NodeListOf<HTMLElement>;
        const activeServerCards = document.querySelectorAll('.server-card.active') as NodeListOf<HTMLElement>;

        activePageCards.forEach(pageCard => {
            const pageApisData = pageCard.dataset.apis;
            if (!pageApisData) return;

            const pageApis: string[] = JSON.parse(pageApisData);
            
            pageApis.forEach(pageApi => {
                const [serverId, apiPath] = pageApi.split(':');
                const method = apiPath.trim().split(' ')[0] as HttpMethod;
                const color = this.getMethodColor(method);
                
                const serverCard = Array.from(activeServerCards).find(card => 
                    card.dataset.server === serverId
                );
                
                if (serverCard) {
                    const pageApiItem = pageCard.querySelector(`[data-full-api="${pageApi}"]`) as HTMLElement;
                    const serverApiItems = serverCard.querySelectorAll('.api-item') as NodeListOf<HTMLElement>;
                    let matchingServerApiItem: HTMLElement | null = null;
                    
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
    }
}