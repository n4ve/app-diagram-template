import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GroupFilterManager } from '../src/scripts/shared/GroupFilterManager.js';

describe('Group Filter Core Functionality', () => {
    let groupFilterManager: GroupFilterManager;

    beforeEach(async () => {
        // Setup minimal DOM structure
        document.body.innerHTML = `
            <div class="group-filter-container" style="display: none;">
                <button id="group-filter-dropdown-toggle" aria-expanded="false">
                    <div id="selected-group-display">
                        <span>🌐</span>
                        <span>All Groups</span>
                    </div>
                    <svg id="dropdown-arrow"></svg>
                </button>
                <div id="group-filter-dropdown-menu" class="opacity-0 invisible scale-95">
                    <button class="group-filter-option" data-group="all">All Groups</button>
                    <button class="group-filter-option" data-group="user-portal">User Portal</button>
                </div>
            </div>
            <div id="inline-group-filter-container" class="hidden"></div>
            
            <!-- Test cards -->
            <div class="group-card" data-group="user-portal">User Portal</div>
            <div class="group-card" data-group="order-app">Order App</div>
            <div class="server-card" data-server="auth-server" data-backend="mysql-db">Auth Server</div>
            <div class="server-card" data-server="order-server" data-backend="mysql-db">Order Server</div>
            <div class="backend-card" data-backend="mysql-db">MySQL</div>
        `;

        // Mock fetch for page groups data
        global.fetch = vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue({
                groups: {
                    'user-portal': {
                        name: 'User Portal',
                        color: '#3B82F6',
                        pages: {
                            'login': { apis: ['auth-server:POST /auth/login'] }
                        }
                    }
                }
            })
        });

        groupFilterManager = new GroupFilterManager();
        await groupFilterManager.initialize();
        await new Promise(resolve => setTimeout(resolve, 100));
        groupFilterManager.setViewMode('group');
    });

    afterEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
    });

    describe('Initialization', () => {
        it('should initialize successfully', () => {
            expect(groupFilterManager).toBeDefined();
            expect(groupFilterManager.getSelectedGroup()).toBe('all');
        });

        it('should show filter container in group view', () => {
            const filterContainer = document.querySelector('.group-filter-container') as HTMLElement;
            expect(filterContainer.style.display).toBe('block');
        });

        it('should hide filter container in page view', () => {
            groupFilterManager.setViewMode('page');
            const inlineContainer = document.getElementById('inline-group-filter-container') as HTMLElement;
            expect(inlineContainer.classList.contains('hidden')).toBe(true);
        });
    });

    describe('Group Selection', () => {
        it('should track selected group', () => {
            expect(groupFilterManager.getSelectedGroup()).toBe('all');
            
            groupFilterManager.setSelectedGroup('user-portal');
            expect(groupFilterManager.getSelectedGroup()).toBe('user-portal');
            
            groupFilterManager.setSelectedGroup('all');
            expect(groupFilterManager.getSelectedGroup()).toBe('all');
        });

        it('should get connected components for valid group', async () => {
            const result = groupFilterManager.getConnectedComponents('user-portal');
            expect(result.servers).toContain('auth-server');
            expect(result.servers).not.toContain('order-server');
        });

        it('should handle empty group data', () => {
            const result = groupFilterManager.getConnectedComponents('non-existent');
            expect(result.servers).toEqual([]);
            expect(result.backends).toEqual([]);
        });

        it('should handle "all" group special case', () => {
            const result = groupFilterManager.getConnectedComponents('all');
            expect(result.servers).toEqual([]);
            expect(result.backends).toEqual([]);
        });
    });

    describe('Filter Application', () => {
        it('should apply filtered-hidden class correctly', () => {
            const userPortalCard = document.querySelector('[data-group="user-portal"]') as HTMLElement;
            const orderAppCard = document.querySelector('[data-group="order-app"]') as HTMLElement;
            const authServer = document.querySelector('[data-server="auth-server"]') as HTMLElement;
            const orderServer = document.querySelector('[data-server="order-server"]') as HTMLElement;
            
            // Apply user portal filter
            groupFilterManager.setSelectedGroup('user-portal');
            
            // Check class application
            expect(userPortalCard.classList.contains('filtered-hidden')).toBe(false);
            expect(orderAppCard.classList.contains('filtered-hidden')).toBe(true);
            expect(authServer.classList.contains('filtered-hidden')).toBe(false);
            expect(orderServer.classList.contains('filtered-hidden')).toBe(true);
        });

        it('should remove filtered-hidden class when showing all groups', () => {
            const orderAppCard = document.querySelector('[data-group="order-app"]') as HTMLElement;
            const orderServer = document.querySelector('[data-server="order-server"]') as HTMLElement;
            
            // Apply filter
            groupFilterManager.setSelectedGroup('user-portal');
            expect(orderAppCard.classList.contains('filtered-hidden')).toBe(true);
            expect(orderServer.classList.contains('filtered-hidden')).toBe(true);
            
            // Remove filter
            groupFilterManager.setSelectedGroup('all');
            expect(orderAppCard.classList.contains('filtered-hidden')).toBe(false);
            expect(orderServer.classList.contains('filtered-hidden')).toBe(false);
        });

        it('should update button states when group is selected', () => {
            const userPortalOption = document.querySelector('[data-group="user-portal"]') as HTMLElement;
            const allGroupsOption = document.querySelector('[data-group="all"]') as HTMLElement;
            
            // Select user portal
            groupFilterManager.setSelectedGroup('user-portal');
            expect(userPortalOption.classList.contains('bg-purple-50')).toBe(true);
            expect(allGroupsOption.classList.contains('bg-purple-50')).toBe(false);
            
            // Select all groups
            groupFilterManager.setSelectedGroup('all');
            expect(allGroupsOption.classList.contains('bg-purple-50')).toBe(true);
            expect(userPortalOption.classList.contains('bg-purple-50')).toBe(false);
        });
    });

    describe('Backend Detection', () => {
        it('should identify connected backends', () => {
            const mysqlBackend = document.querySelector('[data-backend="mysql-db"]') as HTMLElement;
            
            // Apply user portal filter (which connects to auth-server -> mysql-db)
            groupFilterManager.setSelectedGroup('user-portal');
            
            // MySQL should not be hidden (connected to auth-server)
            expect(mysqlBackend.classList.contains('filtered-hidden')).toBe(false);
        });
    });

    describe('View Mode Management', () => {
        it('should handle view mode changes', () => {
            const filterContainer = document.querySelector('.group-filter-container') as HTMLElement;
            const inlineContainer = document.getElementById('inline-group-filter-container') as HTMLElement;
            
            // Group view - filter should be visible
            groupFilterManager.setViewMode('group');
            expect(filterContainer.style.display).toBe('block');
            expect(inlineContainer.classList.contains('hidden')).toBe(false);
            
            // Page view - filter should be hidden
            groupFilterManager.setViewMode('page');
            expect(inlineContainer.classList.contains('hidden')).toBe(true);
        });

        it('should reset cards when switching to page view', () => {
            const orderAppCard = document.querySelector('[data-group="order-app"]') as HTMLElement;
            
            // Apply filter in group view
            groupFilterManager.setSelectedGroup('user-portal');
            expect(orderAppCard.classList.contains('filtered-hidden')).toBe(true);
            
            // Switch to page view
            groupFilterManager.setViewMode('page');
            expect(orderAppCard.classList.contains('filtered-hidden')).toBe(false);
        });
    });
});