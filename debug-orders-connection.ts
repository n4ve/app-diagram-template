/**
 * Detailed Orders Connection Debug Script
 * This will trace exactly what happens when hovering orders page
 */

interface ApiItem extends Element {
    dataset: {
        apiText?: string;
    };
    textContent: string | null;
}

interface ServerCard {
    dataset: {
        server: string;
        backend: string;
    };
    querySelectorAll: (selector: string) => NodeListOf<ApiItem>;
}

interface PageCard {
    dataset: {
        page: string;
        apis: string;
    };
}

interface BackendCard {
    dataset: {
        backend: string;
    };
}

interface DebugConnection {
    id: number;
    source: string;
    timestamp: number;
    element: SVGLineElement;
}

interface ConnectionMonitor {
    getConnections: () => DebugConnection[];
    getCount: () => number;
    restore: () => void;
}

console.log('🔍 Detailed Orders Connection Debug');
console.log('===================================');

function debugOrdersPage(): void {
    // Step 1: Find and examine the orders page
    console.log('\n📋 Step 1: Examining Orders Page');
    const ordersPage = document.querySelector('[data-page="orders"]') as unknown as PageCard | null;
    
    if (!ordersPage) {
        console.log('❌ Orders page not found!');
        return;
    }
    
    console.log('✅ Orders page found');
    console.log('Page element:', ordersPage);
    console.log('Page data-page:', ordersPage.dataset.page);
    console.log('Page data-apis:', ordersPage.dataset.apis);
    
    const apis: string[] = JSON.parse(ordersPage.dataset.apis || '[]');
    console.log('Parsed APIs:', apis);
    
    // Step 2: Check each API and find corresponding servers
    console.log('\n🖥️ Step 2: Checking Server Mappings');
    apis.forEach((api: string, index: number) => {
        const [serverId, apiPath] = api.split(':');
        console.log(`\nAPI ${index + 1}: ${api}`);
        console.log(`  Server ID: ${serverId}`);
        console.log(`  API Path: ${apiPath}`);
        
        // Find the server card
        const serverCard = document.querySelector(`[data-server="${serverId}"]`) as unknown as ServerCard | null;
        if (serverCard) {
            console.log(`  ✅ Server found: ${serverCard.dataset.server}`);
            console.log(`  Backend: ${serverCard.dataset.backend}`);
            
            // Check if server has the matching API
            const apiItems = serverCard.querySelectorAll('.api-item');
            console.log(`  Server has ${apiItems.length} API items`);
            
            let foundMatchingAPI = false;
            apiItems.forEach((item: ApiItem) => {
                const apiText = item.dataset.apiText || item.textContent?.trim();
                console.log(`    API item: "${apiText}"`);
                if (apiText === apiPath.trim()) {
                    foundMatchingAPI = true;
                    console.log(`    ✅ MATCH found for: "${apiPath.trim()}"`);
                }
            });
            
            if (!foundMatchingAPI) {
                console.log(`    ❌ NO MATCH found for: "${apiPath.trim()}"`);
            }
        } else {
            console.log(`  ❌ Server NOT found: ${serverId}`);
        }
    });
    
    // Step 3: Check backends
    console.log('\n💾 Step 3: Checking Backend Mappings');
    const uniqueServerIds = Array.from(new Set(apis.map((api: string) => api.split(':')[0])));
    
    uniqueServerIds.forEach((serverId: string) => {
        const serverCard = document.querySelector(`[data-server="${serverId}"]`) as unknown as ServerCard | null;
        if (serverCard) {
            const backendId = serverCard.dataset.backend;
            console.log(`\n${serverId} → ${backendId}`);
            
            const backendCard = document.querySelector(`[data-backend="${backendId}"]`) as unknown as BackendCard | null;
            if (backendCard) {
                console.log(`  ✅ Backend found: ${backendId}`);
            } else {
                console.log(`  ❌ Backend NOT found: ${backendId}`);
            }
        }
    });
}

function debugConnectionCreation(): ConnectionMonitor {
    console.log('\n🔗 Step 4: Monitoring Connection Creation');
    
    const connections: DebugConnection[] = [];
    let connectionCount = 0;
    
    // Override createElementNS to trace all SVG line creation
    const originalCreateElementNS = document.createElementNS;
    (document as any).createElementNS = function(namespace: string, tagName: string): Element {
        const element = originalCreateElementNS.call(this, namespace, tagName);
        
        if (namespace === 'http://www.w3.org/2000/svg' && tagName === 'line') {
            connectionCount++;
            
            // Get stack trace to see where this is called from
            const stack = new Error().stack;
            let source = 'unknown';
            if (stack && stack.includes('drawPageConnections')) source = 'drawPageConnections';
            else if (stack && stack.includes('drawServerConnections')) source = 'drawServerConnections';
            else if (stack && stack.includes('drawBackendConnections')) source = 'drawBackendConnections';
            else if (stack && stack.includes('CardAnimationManager')) source = 'CardAnimationManager';
            
            const connection: DebugConnection = {
                id: connectionCount,
                source: source,
                timestamp: Date.now(),
                element: element as SVGLineElement
            };
            
            connections.push(connection);
            
            console.log(`📍 Connection ${connectionCount} created from: ${source}`);
            
            // Add a property to track this line
            (element as SVGLineElement & {debugInfo: DebugConnection}).debugInfo = connection;
        }
        
        return element;
    };
    
    // Return function to get results
    return {
        getConnections: (): DebugConnection[] => connections,
        getCount: (): number => connectionCount,
        restore: (): void => { (document as any).createElementNS = originalCreateElementNS; }
    };
}

function analyzeConnections(monitor: ConnectionMonitor): void {
    console.log('\n📊 Step 5: Analyzing Created Connections');
    
    const svg = document.getElementById('connection-svg') as unknown as SVGElement | null;
    if (!svg) {
        console.log('❌ No SVG found');
        return;
    }
    
    const lines = svg.querySelectorAll('line');
    console.log(`Found ${lines.length} connection lines in SVG`);
    
    lines.forEach((line: SVGLineElement, index: number) => {
        const method = line.getAttribute('data-method');
        const stroke = line.getAttribute('stroke');
        const strokeWidth = line.getAttribute('stroke-width');
        const opacity = line.getAttribute('opacity');
        
        console.log(`\nLine ${index + 1}:`);
        console.log(`  Method: ${method}`);
        console.log(`  Color: ${stroke}`);
        console.log(`  Width: ${strokeWidth}`);
        console.log(`  Opacity: ${opacity}`);
        
        // If this is a DB connection, check if it's the right color
        if (method === 'DB') {
            if (stroke === '#8b5cf6') {
                console.log(`  ✅ CORRECT: Purple server-to-backend connection`);
            } else {
                console.log(`  ❌ WRONG COLOR: Expected #8b5cf6, got ${stroke}`);
            }
        }
        
        // Try to determine what this line connects
        const x1 = line.getAttribute('x1');
        const y1 = line.getAttribute('y1');
        const x2 = line.getAttribute('x2');
        const y2 = line.getAttribute('y2');
        
        console.log(`  Coordinates: (${x1},${y1}) → (${x2},${y2})`);
        
        const lineWithDebugInfo = line as SVGLineElement & {debugInfo?: DebugConnection};
        if (lineWithDebugInfo.debugInfo) {
            console.log(`  Created by: ${lineWithDebugInfo.debugInfo.source}`);
        }
    });
    
    monitor.restore();
}

function runFullDebug(): void {
    console.log('🧪 Running Full Orders Debug');
    console.log('============================');
    
    // Step 1: Examine the page structure
    debugOrdersPage();
    
    // Step 2: Set up connection monitoring
    const monitor = debugConnectionCreation();
    
    // Step 3: Clear existing connections
    const svg = document.getElementById('connection-svg') as unknown as SVGElement | null;
    if (svg) {
        svg.innerHTML = '';
        console.log('\n🧹 Cleared existing connections');
    }
    
    // Step 4: Trigger hover on orders page
    const ordersPage = document.querySelector('[data-page="orders"]') as unknown as PageCard | null;
    if (ordersPage) {
        console.log('\n🖱️ Triggering hover on orders page...');
        const hoverEvent = new MouseEvent('mouseenter', { 
            bubbles: true,
            view: window 
        });
        (ordersPage as unknown as EventTarget).dispatchEvent(hoverEvent);
        
        // Wait for connections to be drawn
        setTimeout(() => {
            analyzeConnections(monitor);
            
            console.log('\n🎯 EXPECTED BEHAVIOR:');
            console.log('1. Orders page should connect to order-server APIs');
            console.log('2. Orders page should connect to payment-server APIs');
            console.log('3. Order-server should connect to mysql-db with purple line');
            console.log('4. Payment-server should connect to mysql-db with purple line');
            console.log('5. NO connections to auth-server');
            
        }, 300);
    } else {
        console.log('❌ Cannot trigger hover - orders page not found');
    }
}

// Auto-run
if (typeof window !== 'undefined') {
    setTimeout(runFullDebug, 1000);
}

export {};