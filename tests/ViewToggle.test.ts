import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { DiagramController } from '../src/scripts/components/connection-area/DiagramController';

describe('ViewToggle Integration Test', () => {
    let dom: JSDOM;
    let document: Document;
    let window: Window;
    let diagramController: DiagramController;

    beforeEach(() => {
        // Create a simplified DOM structure that matches ArchitectureDiagram.astro
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        .hidden { display: none !important; }
                        .pages-grid { display: grid; }
                        .groups-grid { display: grid; }
                        .pages-grid.hidden { display: none !important; }
                        .groups-grid.hidden { display: none !important; }
                    </style>
                </head>
                <body>
                    <!-- View Toggle -->
                    <div class="view-toggle-container">
                        <button class="view-toggle-button active" data-view="page">Page Level</button>
                        <button class="view-toggle-button" data-view="group">Group Level</button>
                        <div id="toggle-slider" style="left: 0.5rem;"></div>
                    </div>
                    
                    <!-- Column Title -->
                    <h3 id="pages-column-title">📱 Frontend Pages</h3>
                    
                    <!-- Views -->
                    <div id="page-view" class="pages-grid">
                        <div class="page-card" data-page="login">Login Page</div>
                        <div class="page-card" data-page="dashboard">Dashboard Page</div>
                    </div>
                    
                    <div id="group-view" class="groups-grid hidden">
                        <div class="group-card" data-group="order-app">
                            <div class="page-card" data-page="orders">Orders</div>
                        </div>
                        <div class="group-card" data-group="user-portal">
                            <div class="page-card" data-page="profile">Profile</div>
                        </div>
                    </div>
                    
                    <!-- Other required elements -->
                    <div class="server-card">Server 1</div>
                    <svg id="connection-svg"></svg>
                    
                    <!-- Description elements -->
                    <div id="view-title">Individual Page View</div>
                    <div id="view-description">Show individual pages and their specific API connections</div>
                </body>
            </html>
        `, {
            url: 'http://localhost',
            runScripts: 'dangerously'
        });

        document = dom.window.document;
        window = dom.window as unknown as Window;
        
        // Set up global window and document
        global.window = window as any;
        global.document = document;
        
        // Mock console methods
        global.console = {
            ...console,
            log: vi.fn(),
            error: vi.fn()
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with page view visible and group view hidden', async () => {
        diagramController = new DiagramController();
        await diagramController.initialize();

        const pageView = document.getElementById('page-view');
        const groupView = document.getElementById('group-view');

        expect(pageView?.classList.contains('hidden')).toBe(false);
        expect(groupView?.classList.contains('hidden')).toBe(true);
        expect(pageView?.style.display).not.toBe('none');
    });

    it('should toggle to group view when group button is clicked', async () => {
        diagramController = new DiagramController();
        await diagramController.initialize();

        const groupButton = document.querySelector('[data-view="group"]') as HTMLElement;
        const pageView = document.getElementById('page-view');
        const groupView = document.getElementById('group-view');

        // Click the group button
        groupButton.click();

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 400));

        // Check that views have toggled
        expect(pageView?.classList.contains('hidden')).toBe(true);
        expect(groupView?.classList.contains('hidden')).toBe(false);
        
        // Check column title
        const columnTitle = document.getElementById('pages-column-title');
        expect(columnTitle?.textContent).toContain('Application Groups');
    });

    it('should toggle back to page view when page button is clicked', async () => {
        diagramController = new DiagramController();
        await diagramController.initialize();

        const groupButton = document.querySelector('[data-view="group"]') as HTMLElement;
        const pageButton = document.querySelector('[data-view="page"]') as HTMLElement;
        const pageView = document.getElementById('page-view');
        const groupView = document.getElementById('group-view');

        // First toggle to group view
        groupButton.click();
        await new Promise(resolve => setTimeout(resolve, 400));

        // Then toggle back to page view
        pageButton.click();
        await new Promise(resolve => setTimeout(resolve, 400));

        // Check that views have toggled back
        expect(pageView?.classList.contains('hidden')).toBe(false);
        expect(groupView?.classList.contains('hidden')).toBe(true);
    });

    it('should update toggle slider position when switching views', async () => {
        diagramController = new DiagramController();
        await diagramController.initialize();

        const groupButton = document.querySelector('[data-view="group"]') as HTMLElement;
        const slider = document.getElementById('toggle-slider') as HTMLElement;

        // Initial position
        expect(slider.style.left).toBe('0.5rem');

        // Click group button
        groupButton.click();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check slider moved
        expect(slider.style.left).toBe('50%');
    });

    it('should update view title and description when toggling', async () => {
        diagramController = new DiagramController();
        await diagramController.initialize();

        const groupButton = document.querySelector('[data-view="group"]') as HTMLElement;
        const viewTitle = document.getElementById('view-title');
        const viewDescription = document.getElementById('view-description');

        // Click group button
        groupButton.click();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check text updated
        expect(viewTitle?.textContent).toBe('Application Group View');
        expect(viewDescription?.textContent).toBe('Show application groups with merged API connections');
    });

    it('should toggle view with Alt+V keyboard shortcut', async () => {
        diagramController = new DiagramController();
        await diagramController.initialize();

        const pageView = document.getElementById('page-view');
        const groupView = document.getElementById('group-view');

        // Simulate Alt+V keypress
        const event = new window.KeyboardEvent('keydown', {
            key: 'v',
            altKey: true,
            bubbles: true
        });
        document.dispatchEvent(event);

        await new Promise(resolve => setTimeout(resolve, 400));

        // Check that views have toggled
        expect(pageView?.classList.contains('hidden')).toBe(true);
        expect(groupView?.classList.contains('hidden')).toBe(false);
    });

    it('should only show page cards in page view', async () => {
        diagramController = new DiagramController();
        await diagramController.initialize();

        const pageView = document.getElementById('page-view');
        const pageCards = pageView?.querySelectorAll('.page-card');

        expect(pageCards?.length).toBe(2);
        expect(pageView?.querySelector('.group-card')).toBe(null);
    });

    it('should show group cards containing page cards in group view', async () => {
        diagramController = new DiagramController();
        await diagramController.initialize();

        const groupButton = document.querySelector('[data-view="group"]') as HTMLElement;
        groupButton.click();
        await new Promise(resolve => setTimeout(resolve, 400));

        const groupView = document.getElementById('group-view');
        const groupCards = groupView?.querySelectorAll('.group-card');
        const nestedPageCards = groupView?.querySelectorAll('.group-card .page-card');

        expect(groupCards?.length).toBe(2);
        expect(nestedPageCards?.length).toBe(2);
    });

    it('should update button active states correctly', async () => {
        diagramController = new DiagramController();
        await diagramController.initialize();

        const pageButton = document.querySelector('[data-view="page"]') as HTMLElement;
        const groupButton = document.querySelector('[data-view="group"]') as HTMLElement;

        // Initial state
        expect(pageButton.classList.contains('active')).toBe(true);
        expect(groupButton.classList.contains('active')).toBe(false);

        // Click group button
        groupButton.click();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check updated states
        expect(pageButton.classList.contains('active')).toBe(false);
        expect(groupButton.classList.contains('active')).toBe(true);
        expect(pageButton.classList.contains('text-white')).toBe(false);
        expect(groupButton.classList.contains('text-white')).toBe(true);
    });

    it('should maintain view state across multiple toggles', async () => {
        diagramController = new DiagramController();
        await diagramController.initialize();

        const pageView = document.getElementById('page-view');
        const groupView = document.getElementById('group-view');
        const groupButton = document.querySelector('[data-view="group"]') as HTMLElement;

        // Toggle multiple times
        for (let i = 0; i < 3; i++) {
            groupButton.click();
            await new Promise(resolve => setTimeout(resolve, 400));
            
            expect(pageView?.classList.contains('hidden')).toBe(true);
            expect(groupView?.classList.contains('hidden')).toBe(false);
            
            // Use keyboard shortcut to toggle back
            const event = new window.KeyboardEvent('keydown', {
                key: 'v',
                altKey: true,
                bubbles: true
            });
            document.dispatchEvent(event);
            await new Promise(resolve => setTimeout(resolve, 400));
            
            expect(pageView?.classList.contains('hidden')).toBe(false);
            expect(groupView?.classList.contains('hidden')).toBe(true);
        }
    });
});