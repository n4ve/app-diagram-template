/**
 * Unit Tests for Dashboard WEBSOCKET Integration
 * Tests that the dashboard page correctly includes WEBSOCKET connections
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { CardRelationshipManager } from '../src/scripts/shared/CardRelationshipManager.js';
import { ConnectionType } from '../src/types/index.js';

describe('Dashboard WEBSOCKET Integration Tests', () => {
    let dom: JSDOM;
    let relationshipManager: CardRelationshipManager;

    beforeEach(() => {
        // Create a dashboard page with WEBSOCKET connection
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div id="diagram-container">
                    <!-- Dashboard Page Card with WEBSOCKET -->
                    <div class="page-card" data-page="dashboard" data-apis='["user-server:GET /user/profile", "analytics-server:GET /analytics/summary", "notification-server:GET /notifications/recent", "notification-server:WEBSOCKET /notifications/live"]'>
                        <div class="api-item" data-full-api="user-server:GET /user/profile">GET /user/profile</div>
                        <div class="api-item" data-full-api="analytics-server:GET /analytics/summary">GET /analytics/summary</div>
                        <div class="api-item" data-full-api="notification-server:GET /notifications/recent">GET /notifications/recent</div>
                        <div class="api-item" data-full-api="notification-server:WEBSOCKET /notifications/live">WEBSOCKET /notifications/live</div>
                    </div>
                    
                    <!-- Notification Server Card with WEBSOCKET -->
                    <div class="server-card" data-server="notification-server" data-backend="rabbitmq">
                        <div class="api-item" data-api-text="GET /notifications/recent">GET /notifications/recent</div>
                        <div class="api-item" data-api-text="POST /notifications/mark-read">POST /notifications/mark-read</div>
                        <div class="api-item" data-api-text="WEBSOCKET /notifications/live">WEBSOCKET /notifications/live</div>
                    </div>
                    
                    <!-- Other Server Cards -->
                    <div class="server-card" data-server="user-server" data-backend="redis-cache">
                        <div class="api-item" data-api-text="GET /user/profile">GET /user/profile</div>
                    </div>
                    
                    <div class="server-card" data-server="analytics-server" data-backend="mongodb">
                        <div class="api-item" data-api-text="GET /analytics/summary">GET /analytics/summary</div>
                    </div>
                    
                    <!-- Backend Cards -->
                    <div class="backend-card" data-backend="rabbitmq">RabbitMQ</div>
                    <div class="backend-card" data-backend="redis-cache">Redis Cache</div>
                    <div class="backend-card" data-backend="mongodb">MongoDB</div>
                </div>
            </body>
            </html>
        `);
        
        global.document = dom.window.document;
        global.window = dom.window as any;
        
        relationshipManager = new CardRelationshipManager();
        relationshipManager.initialize();
    });

    describe('Dashboard WEBSOCKET Connection Detection', () => {
        it('should detect WEBSOCKET API in dashboard page data', () => {
            const dashboardCard = document.querySelector('.page-card[data-page="dashboard"]') as HTMLElement;
            expect(dashboardCard).toBeTruthy();
            
            const apisData = dashboardCard.dataset.apis;
            expect(apisData).toBeTruthy();
            
            const apis = JSON.parse(apisData!);
            expect(apis).toContain('notification-server:WEBSOCKET /notifications/live');
        });

        it('should find notification server as related to dashboard when hovering', () => {
            const dashboardCard = document.querySelector('.page-card[data-page="dashboard"]') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(dashboardCard);
            
            expect(relatedElements.servers.length).toBeGreaterThan(0);
            
            const notificationServer = relatedElements.servers.find(server => 
                server.dataset.server === 'notification-server'
            );
            expect(notificationServer).toBeTruthy();
        });

        it('should create connection pairs including WEBSOCKET method', () => {
            const dashboardCard = document.querySelector('.page-card[data-page="dashboard"]') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(dashboardCard);
            const connectionPairs = relationshipManager.getUniqueRelationPairs(dashboardCard, relatedElements);
            
            // Look for WEBSOCKET connection pair
            const websocketPair = connectionPairs.find(pair => 
                pair.method === 'WEBSOCKET' && 
                pair.type === ConnectionType.PAGE_TO_SERVER
            );
            
            expect(websocketPair).toBeTruthy();
            expect(websocketPair?.api).toBe('notification-server:WEBSOCKET /notifications/live');
        });

        it('should have both GET and WEBSOCKET connections to notification server', () => {
            const dashboardCard = document.querySelector('.page-card[data-page="dashboard"]') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(dashboardCard);
            const connectionPairs = relationshipManager.getUniqueRelationPairs(dashboardCard, relatedElements);
            
            // Filter connections to notification server
            const notificationConnections = connectionPairs.filter(pair => 
                pair.api?.startsWith('notification-server:')
            );
            
            expect(notificationConnections.length).toBe(2); // GET and WEBSOCKET
            
            const methods = notificationConnections.map(pair => pair.method);
            expect(methods).toContain('GET');
            expect(methods).toContain('WEBSOCKET');
        });

        it('should distinguish WEBSOCKET connection from regular HTTP connections', () => {
            const dashboardCard = document.querySelector('.page-card[data-page="dashboard"]') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(dashboardCard);
            const connectionPairs = relationshipManager.getUniqueRelationPairs(dashboardCard, relatedElements);
            
            const websocketConnections = connectionPairs.filter(pair => pair.method === 'WEBSOCKET');
            const httpConnections = connectionPairs.filter(pair => 
                pair.method && ['GET', 'POST', 'PUT', 'DELETE'].includes(pair.method)
            );
            
            expect(websocketConnections.length).toBe(1);
            expect(httpConnections.length).toBeGreaterThan(0);
            
            // Verify WEBSOCKET connection has different API endpoint
            const websocketConnection = websocketConnections[0];
            expect(websocketConnection.api).toContain('/notifications/live');
        });
    });

    describe('Dashboard Integration with Multiple Servers', () => {
        it('should connect to user-server, analytics-server, and notification-server', () => {
            const dashboardCard = document.querySelector('.page-card[data-page="dashboard"]') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(dashboardCard);
            
            const serverIds = relatedElements.servers.map(server => server.dataset.server);
            expect(serverIds).toContain('user-server');
            expect(serverIds).toContain('analytics-server');
            expect(serverIds).toContain('notification-server');
        });

        it('should create 4 API connections total (3 GET + 1 WEBSOCKET)', () => {
            const dashboardCard = document.querySelector('.page-card[data-page="dashboard"]') as HTMLElement;
            const relatedElements = relationshipManager.findRelatedCards(dashboardCard);
            const connectionPairs = relationshipManager.getUniqueRelationPairs(dashboardCard, relatedElements);
            
            const apiConnections = connectionPairs.filter(pair => 
                pair.type === ConnectionType.PAGE_TO_SERVER
            );
            
            expect(apiConnections.length).toBe(4);
            
            const methods = apiConnections.map(pair => pair.method);
            expect(methods.filter(m => m === 'GET').length).toBe(3);
            expect(methods.filter(m => m === 'WEBSOCKET').length).toBe(1);
        });
    });
});