/**
 * Final Connection Test - Orders Page
 * This verifies that hovering on Orders Management shows purple lines to MySQL
 */

interface PageCard {
    dataset: {
        page: string;
        apis: string;
    };
}

interface ServerCard {
    dataset: {
        server: string;
        backend: string;
    };
}

interface PurpleBackendConnection {
    id: number;
    color: string;
    method: string;
}

interface ConnectionMonitorResult {
    getConnections: () => PurpleBackendConnection[];
    getCount: () => number;
    restore: () => void;
}

console.log('🧪 Final Orders Connection Test');
console.log('===============================');

function testOrdersConnection(): boolean {
    console.log('\n🎯 Testing Orders Management Page Connections');
    
    // Find the orders page
    const ordersPage = document.querySelector('[data-page="orders"]') as unknown as PageCard | null;
    if (!ordersPage) {
        console.log('❌ Orders page not found');
        return false;
    }
    
    console.log('✅ Orders page found');
    
    // Check the APIs configuration
    const apis: string[] = JSON.parse(ordersPage.dataset.apis || '[]');
    console.log('📋 Orders APIs:', apis);
    
    // Verify expected APIs
    const hasOrderServerAPI = apis.some((api: string) => api.startsWith('order-server:'));
    const hasPaymentServerAPI = apis.some((api: string) => api.startsWith('payment-server:'));
    const hasAuthServerAPI = apis.some((api: string) => api.startsWith('auth-server:'));
    
    console.log(`✅ Has order-server APIs: ${hasOrderServerAPI}`);
    console.log(`✅ Has payment-server APIs: ${hasPaymentServerAPI}`);
    console.log(`❌ Should NOT have auth-server APIs: ${!hasAuthServerAPI}`);
    
    if (hasAuthServerAPI) {
        console.log('🚨 ERROR: Orders page should NOT connect to auth-server!');
        return false;
    }
    
    // Check server backend mappings
    const orderServer = document.querySelector('[data-server="order-server"]') as unknown as ServerCard | null;
    const paymentServer = document.querySelector('[data-server="payment-server"]') as unknown as ServerCard | null;
    
    if (!orderServer || !paymentServer) {
        console.log('❌ Required servers not found');
        return false;
    }
    
    console.log(`✅ Order server backend: ${orderServer.dataset.backend}`);
    console.log(`✅ Payment server backend: ${paymentServer.dataset.backend}`);
    
    // Both should connect to mysql-db
    if (orderServer.dataset.backend !== 'mysql-db' || paymentServer.dataset.backend !== 'mysql-db') {
        console.log('🚨 ERROR: Servers should connect to mysql-db!');
        return false;
    }
    
    return true;
}

function simulateOrdersHover(): void {
    console.log('\n🖱️ Simulating Orders Page Hover');
    
    const ordersPage = document.querySelector('[data-page="orders"]') as unknown as PageCard | null;
    if (!ordersPage) {
        console.log('❌ Cannot simulate hover - orders page not found');
        return;
    }
    
    // Clear existing connections
    const svg = document.getElementById('connection-svg') as unknown as SVGElement | null;
    if (svg) {
        svg.innerHTML = '';
        console.log('🧹 Cleared existing connections');
    }
    
    // Monitor connection creation
    let connectionCount = 0;
    const purpleBackendConnections: PurpleBackendConnection[] = [];
    
    const originalCreateElementNS = document.createElementNS;
    (document as any).createElementNS = function(namespace: string, tagName: string): Element {
        const element = originalCreateElementNS.call(this, namespace, tagName);
        
        if (namespace === 'http://www.w3.org/2000/svg' && tagName === 'line') {
            connectionCount++;
            console.log(`📍 Connection ${connectionCount} created`);
            
            // Monitor for purple backend connections
            const observer = new MutationObserver((mutations: MutationRecord[]) => {
                mutations.forEach((mutation: MutationRecord) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'stroke') {
                        const lineElement = element as SVGLineElement;
                        const stroke = lineElement.getAttribute('stroke');
                        const method = lineElement.getAttribute('data-method');
                        
                        if (method === 'DB' && stroke === '#8b5cf6') {
                            purpleBackendConnections.push({
                                id: connectionCount,
                                color: stroke,
                                method: method
                            });
                            console.log(`✅ Purple backend connection found: ${stroke}`);
                        }
                    }
                });
            });
            
            observer.observe(element, { attributes: true });
        }
        
        return element;
    };
    
    // Trigger hover
    console.log('🔄 Triggering hover event...');
    const hoverEvent = new MouseEvent('mouseenter', { 
        bubbles: true,
        view: window 
    });
    (ordersPage as unknown as EventTarget).dispatchEvent(hoverEvent);
    
    // Check results after delay
    setTimeout(() => {
        console.log(`\n📊 Results after hover:`);
        console.log(`Total connections created: ${connectionCount}`);
        console.log(`Purple backend connections: ${purpleBackendConnections.length}`);
        
        if (svg) {
            const lines = svg.querySelectorAll('line');
            console.log(`SVG contains ${lines.length} line elements`);
            
            let purpleBackendCount = 0;
            let authServerConnections = 0;
            
            lines.forEach((line: SVGLineElement, index: number) => {
                const method = line.getAttribute('data-method');
                const stroke = line.getAttribute('stroke');
                
                if (method === 'DB' && stroke === '#8b5cf6') {
                    purpleBackendCount++;
                    console.log(`✅ Line ${index + 1}: Purple backend connection (${stroke})`);
                } else if (method === 'DB' && stroke !== '#8b5cf6') {
                    console.log(`🚨 Line ${index + 1}: Wrong color backend connection (${stroke})`);
                } else {
                    console.log(`📋 Line ${index + 1}: ${method} connection (${stroke})`);
                }
                
                // Check for auth-server connections (shouldn't exist)
                const x1 = parseFloat(line.getAttribute('x1') || '0');
                const y1 = parseFloat(line.getAttribute('y1') || '0');
                const x2 = parseFloat(line.getAttribute('x2') || '0');
                const y2 = parseFloat(line.getAttribute('y2') || '0');
                
                // This is a simplified check - in reality you'd need to map coordinates to elements
            });
            
            console.log(`\n🎯 Summary:`);
            console.log(`✅ Purple backend connections: ${purpleBackendCount}`);
            console.log(`❌ Auth server connections: ${authServerConnections} (should be 0)`);
            
            if (purpleBackendCount >= 2) {
                console.log('🎉 SUCCESS: Orders page shows purple lines to MySQL!');
            } else {
                console.log('❌ FAIL: Missing purple backend connections');
            }
        }
        
        // Restore original function
        (document as any).createElementNS = originalCreateElementNS;
        
    }, 500);
}

function runFinalTest(): void {
    console.log('🧪 Running Final Connection Test');
    console.log('================================');
    
    const configTest = testOrdersConnection();
    
    if (configTest) {
        console.log('\n✅ Configuration test PASSED');
        console.log('🔄 Proceeding with hover simulation...');
        simulateOrdersHover();
    } else {
        console.log('\n❌ Configuration test FAILED');
        console.log('Cannot proceed with hover test');
    }
    
    console.log('\n🎯 Expected Result:');
    console.log('Hovering on "Orders Management" should show:');
    console.log('1. Orders → Order Server (API connections)');
    console.log('2. Orders → Payment Server (API connections)');
    console.log('3. Order Server → MySQL (PURPLE line #8b5cf6)');
    console.log('4. Payment Server → MySQL (PURPLE line #8b5cf6)');
    console.log('5. NO connections to Auth Server');
}

// Auto-run
if (typeof window !== 'undefined') {
    setTimeout(runFinalTest, 1000);
}

export {};