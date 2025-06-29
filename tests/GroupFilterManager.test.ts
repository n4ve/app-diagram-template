import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GroupFilterManager } from '../src/scripts/shared/GroupFilterManager.js';

describe('GroupFilterManager', () => {
    let groupFilterManager: GroupFilterManager;
    let mockFilterContainer: HTMLElement;
    let mockInlineContainer: HTMLElement;
    let mockDropdownToggle: HTMLElement;
    let mockDropdownMenu: HTMLElement;
    let mockDropdownArrow: HTMLElement;

    beforeEach(() => {
        // Setup DOM
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
                    <button class="group-filter-option" data-group="order-app">Order Application</button>
                </div>
            </div>
            <div id="inline-group-filter-container" class="hidden"></div>
            
            <!-- Mock cards -->
            <div class="group-card" data-group="user-portal">User Portal</div>
            <div class="group-card" data-group="order-app">Order App</div>
            <div class="server-card" data-server="auth-server">Auth Server</div>
            <div class="server-card" data-server="order-server">Order Server</div>
            <div class="backend-card" data-backend="mysql-db">MySQL</div>
        `;

        mockFilterContainer = document.querySelector('.group-filter-container') as HTMLElement;
        mockInlineContainer = document.getElementById('inline-group-filter-container') as HTMLElement;
        mockDropdownToggle = document.getElementById('group-filter-dropdown-toggle') as HTMLElement;
        mockDropdownMenu = document.getElementById('group-filter-dropdown-menu') as HTMLElement;
        mockDropdownArrow = document.getElementById('dropdown-arrow') as HTMLElement;

        // Mock fetch for page groups data
        global.fetch = vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue({
                groups: {
                    'user-portal': {
                        name: 'User Portal',
                        color: '#3B82F6',
                        pages: {
                            'login': { apis: ['auth-server:POST /auth/login'] },
                            'dashboard': { apis: ['auth-server:GET /auth/validate'] }
                        }
                    },
                    'order-app': {
                        name: 'Order Application',
                        color: '#10B981',
                        pages: {
                            'orders': { apis: ['order-server:GET /orders/list'] }
                        }
                    }
                }
            })
        });

        groupFilterManager = new GroupFilterManager();
    });

    afterEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
    });

    describe('initialization', () => {
        it('should initialize successfully', () => {
            const result = groupFilterManager.initialize();
            expect(result).toBe(true);
        });

        it('should hide filter container on initialization', () => {
            groupFilterManager.initialize();
            expect(mockFilterContainer.style.display).toBe('none');
        });

        it('should load page groups data', async () => {
            groupFilterManager.initialize();
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(global.fetch).toHaveBeenCalledWith('/src/data/pages.json');
        });
    });

    describe('view mode management', () => {
        it('should show filter in group view mode', () => {
            groupFilterManager.initialize();
            groupFilterManager.setViewMode('group');
            
            expect(mockInlineContainer.classList.contains('hidden')).toBe(false);
            expect(mockFilterContainer.style.display).toBe('block');
        });

        it('should hide filter in page view mode', () => {
            groupFilterManager.initialize();
            groupFilterManager.setViewMode('group');
            groupFilterManager.setViewMode('page');
            
            expect(mockInlineContainer.classList.contains('hidden')).toBe(true);
            expect(mockFilterContainer.style.display).toBe('none');
        });

        it('should move filter to inline container in group view', () => {
            groupFilterManager.initialize();
            groupFilterManager.setViewMode('group');
            
            expect(mockInlineContainer.contains(mockFilterContainer)).toBe(true);
        });
    });

    describe('dropdown interactions', () => {
        it('should initialize dropdown elements', () => {
            groupFilterManager.initialize();
            groupFilterManager.setViewMode('group');
            
            // Check that dropdown elements exist and have correct initial state
            expect(mockDropdownToggle.getAttribute('aria-expanded')).toBe('false');
            expect(mockDropdownMenu.classList.contains('opacity-0')).toBe(true);
        });
    });

    describe('group selection', () => {
        beforeEach(async () => {
            groupFilterManager.initialize();
            // Wait for data to load
            await new Promise(resolve => setTimeout(resolve, 100));
            groupFilterManager.setViewMode('group');
        });

        it('should update selected group display', () => {
            const userPortalButton = document.querySelector('[data-group="user-portal"]') as HTMLElement;
            userPortalButton.click();
            
            const selectedDisplay = document.getElementById('selected-group-display');
            const textSpan = selectedDisplay?.querySelector('span:last-child');
            expect(textSpan?.textContent).toBe('User Portal');
        });

        it('should add active state to selected option', () => {
            const userPortalButton = document.querySelector('[data-group="user-portal"]') as HTMLElement;
            userPortalButton.click();
            
            expect(userPortalButton.classList.contains('bg-purple-50')).toBe(true);
        });

        it('should return current selected group', () => {
            expect(groupFilterManager.getSelectedGroup()).toBe('all');
            
            const userPortalButton = document.querySelector('[data-group="user-portal"]') as HTMLElement;
            userPortalButton.click();
            
            expect(groupFilterManager.getSelectedGroup()).toBe('user-portal');
        });
    });

    describe('card filtering', () => {
        beforeEach(async () => {
            groupFilterManager.initialize();
            // Wait for data to load
            await new Promise(resolve => setTimeout(resolve, 100));
            groupFilterManager.setViewMode('group');
        });

        it('should change selected group when called', () => {
            // Test that the group selection works
            expect(groupFilterManager.getSelectedGroup()).toBe('all');
            
            groupFilterManager.setSelectedGroup('user-portal');
            expect(groupFilterManager.getSelectedGroup()).toBe('user-portal');
            
            groupFilterManager.setSelectedGroup('all');
            expect(groupFilterManager.getSelectedGroup()).toBe('all');
        });
    });

    describe('getConnectedComponents', () => {
        beforeEach(async () => {
            groupFilterManager.initialize();
            // Wait for data to load
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        it('should return connected servers for a group', () => {
            const result = groupFilterManager.getConnectedComponents('user-portal');
            expect(result.servers).toContain('auth-server');
            expect(result.servers).not.toContain('order-server');
        });

        it('should return empty arrays for "all" group', () => {
            const result = groupFilterManager.getConnectedComponents('all');
            expect(result.servers).toEqual([]);
            expect(result.backends).toEqual([]);
        });

        it('should return empty arrays for non-existent group', () => {
            const result = groupFilterManager.getConnectedComponents('non-existent');
            expect(result.servers).toEqual([]);
            expect(result.backends).toEqual([]);
        });
    });
});