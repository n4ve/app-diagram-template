/**
 * Connection Validation Demo
 * Demonstrates that invalid connections are blocked
 */

interface PageCard extends HTMLElement {
    dataset: {
        page: string;
    };
}

interface ServerCard extends HTMLElement {
    dataset: {
        server: string;
        backend: string;
    };
}

interface BackendCard extends HTMLElement {
    dataset: {
        backend: string;
    };
}

interface DiagramController {
    connectionManager: {
        createConnectionLine: (fromElement: HTMLElement, toElement: HTMLElement) => boolean | null;
    };
}

declare global {
    interface Window {
        diagramController?: DiagramController;
    }
}

console.log('🛡️ Connection Validation Demo');
console.log('============================');

function testConnectionValidation(): void {
    console.log('\n🧪 Testing Connection Validation Rules');
    
    // Find example elements
    const pageCard = document.querySelector('.page-card') as PageCard | null;
    const serverCard = document.querySelector('.server-card') as ServerCard | null;
    const backendCard = document.querySelector('.backend-card') as BackendCard | null;
    
    if (!pageCard || !serverCard || !backendCard) {
        console.log('❌ Required elements not found for testing');
        return;
    }
    
    console.log('✅ Found test elements');
    console.log('  - Page card:', pageCard.dataset.page);
    console.log('  - Server card:', serverCard.dataset.server);
    console.log('  - Backend card:', serverCard.dataset.backend);
    
    // Override console.warn to capture blocked connections
    const originalWarn = console.warn;
    const blockedConnections: string[] = [];
    
    console.warn = function(...args: any[]): void {
        if (args[0] && args[0].includes('🚫 Blocked invalid connection')) {
            blockedConnections.push(args[0] as string);
        }
        originalWarn.apply(console, args);
    };
    
    // Test valid connections
    console.log('\n✅ Testing Valid Connections:');
    testValidConnection(serverCard, backendCard, 'server → backend');
    
    // Test invalid connections
    console.log('\n❌ Testing Invalid Connections:');
    testInvalidConnection(pageCard, pageCard, 'page → page');
    testInvalidConnection(serverCard, serverCard, 'server → server');
    testInvalidConnection(backendCard, backendCard, 'backend → backend');
    testInvalidConnection(backendCard, serverCard, 'backend → server');
    testInvalidConnection(backendCard, pageCard, 'backend → page');
    testInvalidConnection(serverCard, pageCard, 'server → page');
    
    // Restore console.warn
    console.warn = originalWarn;
    
    // Summary
    console.log('\n📊 Validation Results:');
    console.log(`Total blocked connections: ${blockedConnections.length}`);
    blockedConnections.forEach((blocked: string, index: number) => {
        console.log(`  ${index + 1}. ${blocked}`);
    });
    
    if (blockedConnections.length > 0) {
        console.log('\n🎉 SUCCESS: Invalid connections are being blocked!');
    } else {
        console.log('\n⚠️ WARNING: No connections were blocked - validation may not be working');
    }
}

function testValidConnection(fromElement: HTMLElement, toElement: HTMLElement, description: string): void {
    console.log(`\n  Testing: ${description}`);
    
    // Try to create connection through ConnectionManager
    // Note: In a real scenario, this would go through the actual connection creation flow
    if (window.diagramController && window.diagramController.connectionManager) {
        const result = window.diagramController.connectionManager.createConnectionLine(fromElement, toElement);
        if (result) {
            console.log(`    ✅ Connection allowed: ${description}`);
        } else {
            console.log(`    ❌ Connection blocked: ${description}`);
        }
    } else {
        console.log(`    ⚠️ Cannot test - ConnectionManager not available`);
    }
}

function testInvalidConnection(fromElement: HTMLElement, toElement: HTMLElement, description: string): void {
    console.log(`\n  Testing: ${description}`);
    
    // Try to create connection through ConnectionManager
    if (window.diagramController && window.diagramController.connectionManager) {
        const result = window.diagramController.connectionManager.createConnectionLine(fromElement, toElement);
        if (result) {
            console.log(`    ❌ ERROR: Connection was allowed but should be blocked: ${description}`);
        } else {
            console.log(`    ✅ Connection correctly blocked: ${description}`);
        }
    } else {
        console.log(`    ⚠️ Cannot test - ConnectionManager not available`);
    }
}

function demonstrateValidationRules(): void {
    console.log('\n📋 Connection Validation Rules');
    console.log('=============================');
    
    console.log('\n✅ Valid Connections:');
    console.log('  • page-api → server-api (Frontend API calls)');
    console.log('  • server → backend (Server to database/service)');
    console.log('  • page → server (Direct page to server)');
    
    console.log('\n❌ Invalid Connections (Blocked):');
    console.log('  • page → page (Same type)');
    console.log('  • server → server (Same type)');
    console.log('  • backend → backend (Same type)');
    console.log('  • backend → server (Backend cannot initiate)');
    console.log('  • backend → page (Backend cannot initiate)');
    console.log('  • server-api → page-api (Reverse direction)');
    console.log('  • server → page (Reverse direction)');
    console.log('  • page-api → page-api (Same type API)');
    console.log('  • server-api → server-api (Same type API)');
    
    console.log('\n🎯 Architecture Flow:');
    console.log('  Frontend → Server → Backend');
    console.log('  (Pages)   (APIs)   (Database/Services)');
}

function runValidationDemo(): void {
    console.log('🛡️ Running Connection Validation Demo');
    console.log('=====================================');
    
    demonstrateValidationRules();
    testConnectionValidation();
    
    console.log('\n🔒 Security Benefits:');
    console.log('  • Prevents nonsensical connections');
    console.log('  • Enforces proper architecture flow');
    console.log('  • Blocks reverse data flow');
    console.log('  • Maintains clean separation of concerns');
    
    console.log('\n💡 How It Works:');
    console.log('  1. Every createConnectionLine() call is validated');
    console.log('  2. Element types are detected (page/server/backend/api)');
    console.log('  3. Connection patterns are checked against rules');
    console.log('  4. Invalid patterns return null (no connection created)');
    console.log('  5. Valid patterns proceed with line creation');
}

// Auto-run
if (typeof window !== 'undefined') {
    setTimeout(runValidationDemo, 1000);
}

export {};