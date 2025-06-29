import { describe, it, expect, beforeEach } from 'vitest';

describe('Simple View Toggle Test', () => {
    let pageView: HTMLElement;
    let groupView: HTMLElement;

    beforeEach(() => {
        // Create simple test elements
        document.body.innerHTML = `
            <div id="page-view" class="pages-grid">Page View</div>
            <div id="group-view" class="groups-grid hidden">Group View</div>
        `;
        
        pageView = document.getElementById('page-view')!;
        groupView = document.getElementById('group-view')!;
    });

    it('should toggle hidden class correctly', () => {
        // Initial state
        expect(pageView.classList.contains('hidden')).toBe(false);
        expect(groupView.classList.contains('hidden')).toBe(true);
        
        // Toggle to group view
        pageView.classList.add('hidden');
        groupView.classList.remove('hidden');
        
        expect(pageView.classList.contains('hidden')).toBe(true);
        expect(groupView.classList.contains('hidden')).toBe(false);
        
        // Toggle back to page view
        pageView.classList.remove('hidden');
        groupView.classList.add('hidden');
        
        expect(pageView.classList.contains('hidden')).toBe(false);
        expect(groupView.classList.contains('hidden')).toBe(true);
    });

    it('should have correct class names', () => {
        expect(pageView.className).toContain('pages-grid');
        expect(groupView.className).toContain('groups-grid');
        expect(groupView.className).toContain('hidden');
    });
});