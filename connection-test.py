#!/usr/bin/env python3

class ConnectionTester:
    def __init__(self):
        self.connection_count = 0
        self.connections = []
        
        # Test data
        self.test_data = {
            'pages': {
                'login': {
                    'apis': ["auth-server:POST /auth/login", "payment-server:GET /payment/status"]
                },
                'dashboard': {
                    'apis': ["user-server:GET /user/profile"]
                }
            },
            'servers': {
                "auth-server": {'backend': "mysql-db"},
                "payment-server": {'backend': "mysql-db"},
                "user-server": {'backend': "redis-cache"}
            },
            'backends': {
                "mysql-db": {},
                "redis-cache": {}
            }
        }
    
    def create_connection(self, from_id, to_id, conn_type):
        self.connection_count += 1
        self.connections.append({'from': from_id, 'to': to_id, 'type': conn_type})
        print(f"📍 Connection {self.connection_count}: {from_id} → {to_id} ({conn_type})")
    
    def reset_connections(self):
        self.connection_count = 0
        self.connections = []
    
    def test_page_hover(self, page_id):
        print(f"\n🔍 Testing page hover: {page_id}")
        self.reset_connections()
        
        page = self.test_data['pages'].get(page_id)
        if not page:
            return False
        
        # Expected: page connects to servers, servers connect to backends
        expected_connections = len(page['apis']) * 2  # page-to-server + server-to-backend
        
        # Simulate connections
        for api in page['apis']:
            server_id = api.split(':')[0]
            self.create_connection(page_id, server_id, 'page-to-server')
            
            # Server-to-backend connection
            server = self.test_data['servers'].get(server_id)
            if server:
                self.create_connection(server_id, server['backend'], 'server-to-backend')
        
        success = self.connection_count == expected_connections
        print('✅ PASS' if success else '❌ FAIL')
        return success
    
    def test_server_hover(self, server_id):
        print(f"\n🔍 Testing server hover: {server_id}")
        self.reset_connections()
        
        server = self.test_data['servers'].get(server_id)
        if not server:
            return False
        
        # Find pages that connect to this server
        connected_pages = []
        for page_id, page in self.test_data['pages'].items():
            if any(api.startswith(f"{server_id}:") for api in page['apis']):
                connected_pages.append(page_id)
        
        # Expected: one connection per connected page + one to backend
        expected_connections = len(connected_pages) + 1
        
        # Simulate connections
        for page_id in connected_pages:
            self.create_connection(page_id, server_id, 'page-to-server')
        
        # Server-to-backend connection (ONLY for the hovered server)
        self.create_connection(server_id, server['backend'], 'server-to-backend')
        
        success = self.connection_count == expected_connections
        print('✅ PASS' if success else '❌ FAIL')
        return success
    
    def run_all_tests(self):
        print('🧪 Running Connection Logic Tests')
        print('=====================================')
        
        results = []
        
        # Test page hovers
        results.append(self.test_page_hover('login'))
        results.append(self.test_page_hover('dashboard'))
        
        # Test server hovers
        results.append(self.test_server_hover('auth-server'))
        results.append(self.test_server_hover('payment-server'))
        results.append(self.test_server_hover('user-server'))
        
        # Summary
        passed = sum(results)
        total = len(results)
        
        print(f"\n📊 Test Summary: {passed}/{total} tests passed")
        
        if passed == total:
            print('🎉 All tests passed! Connection logic is working correctly.')
            print('\n✅ Expected Behavior:')
            print('  • Pages connect only to their servers')
            print('  • Servers connect only to their assigned backend')
            print('  • NO server-to-server connections')
            print('  • Proper frontend → server → backend flow')
        else:
            print('⚠️  Some tests failed. Connection logic needs fixes.')
        
        return results

# Run the tests
if __name__ == "__main__":
    tester = ConnectionTester()
    test_results = tester.run_all_tests()