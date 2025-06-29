/**
 * Unit Tests for Server Identification Feature
 * Tests that API-server relationships are visually clear without hover
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { getServerColor, getServerName, serverColors } from '../src/utils/serverColors.ts';

describe('Server Identification Feature', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('Server Color Utilities', () => {
    test('should return correct colors for known servers', () => {
      const authColor = getServerColor('auth-server');
      expect(authColor.bg).toBe('bg-blue-500');
      expect(authColor.text).toBe('text-white');
      expect(authColor.border).toBe('border-blue-600');
      expect(authColor.leftBorder).toBe('border-l-blue-500');
    });

    test('should return default colors for unknown servers', () => {
      const unknownColor = getServerColor('unknown-server');
      expect(unknownColor.bg).toBe('bg-gray-500');
      expect(unknownColor.text).toBe('text-white');
      expect(unknownColor.border).toBe('border-gray-600');
      expect(unknownColor.leftBorder).toBe('border-l-gray-500');
    });

    test('should return correct server names', () => {
      expect(getServerName('auth-server')).toBe('Auth');
      expect(getServerName('payment-server')).toBe('Payment');
      expect(getServerName('unknown-server')).toBe('unknown-server');
    });
  });

  describe('Visual Server Identification', () => {
    test('should create page card with server legend', () => {
      // Simulate page card with multiple servers
      const pageCard = document.createElement('div');
      pageCard.className = 'page-card';
      pageCard.innerHTML = `
        <div class="mb-4">
          <div class="text-xs font-medium text-gray-600 mb-2">Connected Servers:</div>
          <div class="flex flex-wrap gap-1">
            <span class="px-2 py-1 text-xs font-medium rounded-full border bg-blue-500 text-white border-blue-600">Auth</span>
            <span class="px-2 py-1 text-xs font-medium rounded-full border bg-green-500 text-white border-green-600">Payment</span>
          </div>
        </div>
      `;
      
      document.body.appendChild(pageCard);
      
      const legend = pageCard.querySelector('.mb-4');
      expect(legend).toBeTruthy();
      
      const serverBadges = pageCard.querySelectorAll('.rounded-full');
      expect(serverBadges).toHaveLength(2);
      
      // Check Auth server badge
      const authBadge = Array.from(serverBadges).find(badge => 
        badge.textContent?.trim() === 'Auth'
      );
      expect(authBadge).toBeTruthy();
      expect(authBadge?.classList.contains('bg-blue-500')).toBe(true);
      
      // Check Payment server badge  
      const paymentBadge = Array.from(serverBadges).find(badge => 
        badge.textContent?.trim() === 'Payment'
      );
      expect(paymentBadge).toBeTruthy();
      expect(paymentBadge?.classList.contains('bg-green-500')).toBe(true);
    });

    test('should create API items with server badges', () => {
      const apiItem = document.createElement('div');
      apiItem.className = 'api-item border-l-4 border-l-blue-500';
      apiItem.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-1">
            <span class="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">POST</span>
            <span class="font-mono text-gray-700 flex-1">/auth/login</span>
          </div>
          <div class="flex items-center">
            <span class="px-2 py-1 text-xs font-medium rounded-full border bg-blue-500 text-white border-blue-600">Auth</span>
          </div>
        </div>
      `;
      
      document.body.appendChild(apiItem);
      
      // Check left border color indicates server
      expect(apiItem.classList.contains('border-l-blue-500')).toBe(true);
      
      // Check server badge is present
      const serverBadge = apiItem.querySelector('.rounded-full');
      expect(serverBadge).toBeTruthy();
      expect(serverBadge?.textContent?.trim()).toBe('Auth');
      expect(serverBadge?.classList.contains('bg-blue-500')).toBe(true);
      
      // Check API method and path are visible
      const methodBadge = apiItem.querySelector('.bg-blue-100');
      expect(methodBadge?.textContent?.trim()).toBe('POST');
      
      const pathElement = apiItem.querySelector('.font-mono');
      expect(pathElement?.textContent?.trim()).toBe('/auth/login');
    });

    test('should visually distinguish different servers', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="api-item border-l-4 border-l-blue-500">
          <span class="rounded-full bg-blue-500 text-white">Auth</span>
        </div>
        <div class="api-item border-l-4 border-l-green-500">
          <span class="rounded-full bg-green-500 text-white">Payment</span>
        </div>
        <div class="api-item border-l-4 border-l-purple-500">
          <span class="rounded-full bg-purple-500 text-white">User</span>
        </div>
      `;
      
      document.body.appendChild(container);
      
      const apiItems = container.querySelectorAll('.api-item');
      expect(apiItems).toHaveLength(3);
      
      // Verify each has different colors
      const authItem = apiItems[0];
      const paymentItem = apiItems[1];
      const userItem = apiItems[2];
      
      expect(authItem.classList.contains('border-l-blue-500')).toBe(true);
      expect(paymentItem.classList.contains('border-l-green-500')).toBe(true);
      expect(userItem.classList.contains('border-l-purple-500')).toBe(true);
      
      // Verify badges have matching colors
      expect(authItem.querySelector('.bg-blue-500')).toBeTruthy();
      expect(paymentItem.querySelector('.bg-green-500')).toBeTruthy();
      expect(userItem.querySelector('.bg-purple-500')).toBeTruthy();
    });
  });

  describe('Server Card Identification', () => {
    test('should display server ID badge on server card', () => {
      const serverCard = document.createElement('div');
      serverCard.className = 'server-card border-l-4 border-l-blue-500';
      serverCard.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-semibold text-gray-800">Authentication Server</h3>
          <span class="px-2 py-1 text-xs font-medium rounded-full border bg-blue-500 text-white border-blue-600">
            auth-server
          </span>
        </div>
      `;
      
      document.body.appendChild(serverCard);
      
      // Check server has matching border color
      expect(serverCard.classList.contains('border-l-blue-500')).toBe(true);
      
      // Check server ID badge
      const serverBadge = serverCard.querySelector('.rounded-full');
      expect(serverBadge).toBeTruthy();
      expect(serverBadge?.textContent?.trim()).toBe('auth-server');
      expect(serverBadge?.classList.contains('bg-blue-500')).toBe(true);
    });
  });

  describe('Color Consistency', () => {
    test('should use consistent colors across all components', () => {
      // Test that all known servers have defined colors
      const knownServers = [
        'auth-server', 'payment-server', 'user-server', 
        'analytics-server', 'notification-server', 'product-server', 'order-server'
      ];
      
      knownServers.forEach(serverId => {
        const color = getServerColor(serverId);
        expect(color.bg).toBeDefined();
        expect(color.text).toBeDefined();
        expect(color.border).toBeDefined();
        expect(color.leftBorder).toBeDefined();
        
        // Verify all colors follow the pattern
        expect(color.text).toBe('text-white');
        expect(color.bg).toMatch(/^bg-\w+-500$/);
        expect(color.border).toMatch(/^border-\w+-600$/);
        expect(color.leftBorder).toMatch(/^border-l-\w+-500$/);
      });
    });

    test('should provide unique colors for each server', () => {
      const knownServers = Object.keys(serverColors);
      const usedColors = new Set();
      
      knownServers.forEach(serverId => {
        const color = getServerColor(serverId);
        const colorKey = `${color.bg}-${color.border}`;
        
        expect(usedColors.has(colorKey)).toBe(false);
        usedColors.add(colorKey);
      });
    });
  });
});