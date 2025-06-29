/**
 * Unit Tests for WEBSOCKET HTTP Method
 * Tests the new WEBSOCKET method integration
 */

import { describe, it, expect } from 'vitest';
import { ConnectionManager } from '../src/scripts/shared/ConnectionManager.js';
import type { HttpMethod } from '../src/types/index.js';

describe('WEBSOCKET Method Tests', () => {
    const connectionManager = new ConnectionManager();

    describe('WEBSOCKET Method Color and Pattern', () => {

        it('should return correct dash pattern for WEBSOCKET method', () => {
            const pattern = connectionManager.getMethodDashPattern('WEBSOCKET');
            expect(pattern).toBe('20,5,5,5'); // distinctive long dash pattern
        });

        it('should handle WEBSOCKET as valid HttpMethod type', () => {
            const method: HttpMethod = 'WEBSOCKET';
            expect(method).toBe('WEBSOCKET');
            
            const pattern = connectionManager.getMethodDashPattern(method);
            expect(pattern).toBe('20,5,5,5');
        });

        it('should include WEBSOCKET in all available HTTP methods', () => {
            const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'WEBSOCKET'];
            
            methods.forEach(method => {
                const pattern = connectionManager.getMethodDashPattern(method);
                expect(pattern).toBeTruthy();
            });
        });

        it('should distinguish WEBSOCKET pattern from other HTTP methods', () => {
            const websocketPattern = connectionManager.getMethodDashPattern('WEBSOCKET');
            
            // WEBSOCKET should have unique pattern
            expect(websocketPattern).toBe('20,5,5,5');
            
            // Other HTTP methods should have different patterns
            const otherMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
            
            otherMethods.forEach(method => {
                const pattern = connectionManager.getMethodDashPattern(method);
                expect(pattern).not.toBe(websocketPattern);
            });
        });
    });

    describe('WEBSOCKET Type Safety', () => {
        it('should allow WEBSOCKET in HttpMethod union type', () => {
            const validMethods: HttpMethod[] = [
                'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'WEBSOCKET'
            ];
            
            // This test ensures TypeScript compilation works with WEBSOCKET
            expect(validMethods).toContain('WEBSOCKET');
            expect(validMethods.length).toBe(8);
        });
    });
});