/**
 * Orders Page Connection Test
 * Specifically tests the orders page → order-server → MySQL connection
 */

console.log('🧪 Testing Orders Page Connections');
console.log('==================================');

function testOrdersPageConnections() {
    // Check if orders page exists and has correct configuration
    const ordersPage = document.querySelector('[data-page="orders"]');
    
    if (!ordersPage) {
        console.log('❌ Orders page not found in DOM');
        return false;
    }
    
    console.log('✅ Orders page found');
    
    // Check APIs configuration
    const apisData = ordersPage.dataset.apis;
    if (!apisData) {
        console.log('❌ No APIs data found on orders page');
        return false;
    }
    
    const apis = JSON.parse(apisData);
    console.log('📋 Orders page APIs:', apis);
    
    // Expected APIs:
    // "order-server:GET /orders/list"
    // "order-server:GET /orders/details" 
    // "order-server:PUT /orders/status"
    // "payment-server:GET /payment/status"
    
    const hasOrderServer = apis.some(api => api.startsWith('order-server:'));
    const hasPaymentServer = apis.some(api => api.startsWith('payment-server:'));
    const hasAuthServer = apis.some(api => api.startsWith('auth-server:'));
    
    console.log(`✅ Connects to order-server: ${hasOrderServer}`);
    console.log(`✅ Connects to payment-server: ${hasPaymentServer}`);
    console.log(`❌ Should NOT connect to auth-server: ${!hasAuthServer}`);
    
    if (hasAuthServer) {
        console.log('🚨 ERROR: Orders page incorrectly connects to auth-server!');
        return false;
    }
    
    // Check server configurations
    const orderServer = document.querySelector('[data-server="order-server"]');
    const paymentServer = document.querySelector('[data-server="payment-server"]');
    
    if (!orderServer) {
        console.log('❌ Order server not found in DOM');
        return false;
    }
    
    if (!paymentServer) {
        console.log('❌ Payment server not found in DOM');
        return false;
    }
    
    console.log(`✅ Order server backend: ${orderServer.dataset.backend}`);
    console.log(`✅ Payment server backend: ${paymentServer.dataset.backend}`);
    
    // Both should connect to mysql-db
    if (orderServer.dataset.backend !== 'mysql-db') {
        console.log('🚨 ERROR: Order server should connect to mysql-db!');
        return false;
    }
    
    if (paymentServer.dataset.backend !== 'mysql-db') {
        console.log('🚨 ERROR: Payment server should connect to mysql-db!');
        return false;
    }
    
    // Check if MySQL backend exists
    const mysqlBackend = document.querySelector('[data-backend="mysql-db"]');
    if (!mysqlBackend) {
        console.log('❌ MySQL backend not found in DOM');
        return false;
    }
    
    console.log('✅ MySQL backend found');
    
    return true;
}

function simulateOrdersPageHover() {
    console.log('\n🖱️ Simulating Orders Page Hover');
    
    const ordersPage = document.querySelector('[data-page="orders"]');
    if (!ordersPage) {
        console.log('❌ Cannot simulate - orders page not found');
        return;
    }
    
    // Clear any existing connections
    const svg = document.getElementById('connection-svg');
    if (svg) {
        svg.innerHTML = '';
    }
    
    // Monitor connection creation
    let connectionCount = 0;
    const connections = [];
    
    const originalCreateElementNS = document.createElementNS;
    document.createElementNS = function(namespace, tagName) {
        const element = originalCreateElementNS.call(this, namespace, tagName);
        
        if (namespace === 'http://www.w3.org/2000/svg' && tagName === 'line') {
            connectionCount++;
            connections.push({
                id: connectionCount,
                timestamp: Date.now(),
                color: element.getAttribute('stroke') || 'unknown'
            });
            
            console.log(`📍 Connection ${connectionCount} created`);
        }
        
        return element;
    };
    
    // Trigger hover event
    const hoverEvent = new MouseEvent('mouseenter', { bubbles: true });
    ordersPage.dispatchEvent(hoverEvent);
    
    // Check results after a delay
    setTimeout(() => {
        console.log(`\n📊 Results: ${connectionCount} connections created`);
        
        if (svg) {
            const lines = svg.querySelectorAll('line');
            console.log(`SVG contains ${lines.length} line elements`);
            
            lines.forEach((line, index) => {
                const method = line.getAttribute('data-method');
                const stroke = line.getAttribute('stroke');
                console.log(`Line ${index + 1}: method=${method}, color=${stroke}`);
                
                if (method === 'DB' && stroke === '#8b5cf6') {
                    console.log('✅ Found purple server-to-backend connection!');
                } else if (method === 'DB' && stroke !== '#8b5cf6') {
                    console.log(`🚨 Wrong color for backend connection: ${stroke}`);
                }
            });
        }
        
        // Restore original function
        document.createElementNS = originalCreateElementNS;
        
        console.log('\n🎯 Expected for Orders Page Hover:');
        console.log('1. Orders → Order Server (API connection)');
        console.log('2. Orders → Payment Server (API connection)');
        console.log('3. Order Server → MySQL (purple line)');
        console.log('4. Payment Server → MySQL (purple line)');
        console.log('❌ NO connection to Auth Server');
        
    }, 200);
}

function runOrdersTest() {
    console.log('🧪 Running Orders Connection Test');
    console.log('=================================');
    
    const configTest = testOrdersPageConnections();
    
    if (configTest) {
        console.log('\n✅ Configuration test passed');
        simulateOrdersPageHover();
    } else {
        console.log('\n❌ Configuration test failed');
    }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    // Wait a bit for DOM to be ready
    setTimeout(runOrdersTest, 1000);
}

// Export for manual execution
if (typeof module !== 'undefined') {
    module.exports = { runOrdersTest, testOrdersPageConnections, simulateOrdersPageHover };
}