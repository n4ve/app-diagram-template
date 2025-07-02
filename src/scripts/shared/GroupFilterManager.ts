/**
 * SHARED MODULE: Group Filter Manager
 * Purpose: Handles group-level filtering functionality to show/hide cards based on selected group
 */

import type { 
    GroupFilterManager as IGroupFilterManager,
    ViewMode 
} from '../../types/index.js';

export class GroupFilterManager implements IGroupFilterManager {
    private currentViewMode: ViewMode = 'page';
    private selectedGroup: string = 'all';
    private pageGroups: any = null;

    initialize(): boolean {
        try {
            console.log('🔧 Initializing GroupFilterManager...');
            
            // Load page groups data asynchronously but don't wait for it
            this.loadPageGroups();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Ensure filter is initially hidden (will be shown when view mode changes)
            const filterContainer = document.querySelector('.group-filter-container') as HTMLElement;
            if (filterContainer) {
                filterContainer.style.display = 'none';
                console.log('🔧 GroupFilter initially hidden');
            }
            
            console.log('✅ GroupFilterManager initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize GroupFilterManager:', error);
            return false;
        }
    }

    private async loadPageGroups(): Promise<void> {
        try {
            const response = await fetch('/src/data/pages.json');
            this.pageGroups = await response.json();
            console.log('📋 Page groups data loaded');
        } catch (error) {
            console.error('❌ Failed to load page groups data:', error);
        }
    }

    private setupEventListeners(): void {
        // Listen for dropdown toggle clicks
        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            
            // Handle dropdown toggle
            const toggleButton = target.closest('.group-filter-dropdown-toggle') as HTMLElement;
            if (toggleButton) {
                event.preventDefault();
                this.toggleDropdown();
                return;
            }
            
            // Handle dropdown option selection
            const optionButton = target.closest('.group-filter-option') as HTMLElement;
            if (optionButton && optionButton.dataset.group) {
                this.setSelectedGroup(optionButton.dataset.group);
                this.closeDropdown();
                return;
            }
            
            // Close dropdown when clicking outside
            const dropdown = target.closest('.group-filter-dropdown-menu, .group-filter-dropdown-toggle');
            if (!dropdown) {
                this.closeDropdown();
            }
        });

        // Handle keyboard navigation for dropdown
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeDropdown();
            }
        });
    }

    setViewMode(viewMode: ViewMode): void {
        this.currentViewMode = viewMode;
        console.log(`🔧 GroupFilterManager view mode changed to: ${viewMode}`);
        
        // Get filter container and inline container
        const filterContainer = document.querySelector('.group-filter-container') as HTMLElement;
        const inlineContainer = document.getElementById('inline-group-filter-container') as HTMLElement;
        
        console.log('🔍 FilterContainer element:', filterContainer);
        console.log('🔍 InlineContainer element:', inlineContainer);
        
        if (filterContainer && inlineContainer) {
            if (viewMode === 'group') {
                console.log('👁️ Moving group filter to inline position');
                // Move filter to inline container
                inlineContainer.appendChild(filterContainer);
                inlineContainer.classList.remove('hidden');
                filterContainer.style.display = 'block';
                filterContainer.classList.add('visible');
                // Apply current filter when switching to group view
                this.applyGroupFilter();
            } else {
                console.log('🙈 Hiding group filter dropdown');
                inlineContainer.classList.add('hidden');
                filterContainer.style.display = 'none';
                filterContainer.classList.remove('visible');
                // Reset all cards to visible when switching away from group view
                this.showAllCards();
            }
        } else {
            console.error('❌ GroupFilter or inline container not found in DOM');
        }
    }

    setSelectedGroup(groupId: string): void {
        this.selectedGroup = groupId;
        console.log(`🔍 Group filter changed to: ${groupId}`);
        
        // Update button states
        this.updateFilterButtonStates();
        
        // Update description
        this.updateFilterDescription();
        
        // Apply the filter
        this.applyGroupFilter();
    }

    getSelectedGroup(): string {
        return this.selectedGroup;
    }

    private updateFilterButtonStates(): void {
        // Update dropdown toggle display
        const selectedDisplay = document.getElementById('selected-group-display');
        if (selectedDisplay && this.pageGroups) {
            const iconSpan = selectedDisplay.querySelector('span:first-child');
            const textSpan = selectedDisplay.querySelector('span:last-child');
            
            if (this.selectedGroup === 'all') {
                if (iconSpan) iconSpan.textContent = '🌐';
                if (textSpan) textSpan.textContent = 'All Groups';
            } else {
                const groupData = this.pageGroups.groups[this.selectedGroup];
                if (groupData && iconSpan && textSpan) {
                    // Create colored dot for selected group
                    iconSpan.innerHTML = `<div class="w-4 h-4 rounded-full border-2 border-white shadow-sm" style="background-color: ${groupData.color}"></div>`;
                    textSpan.textContent = groupData.name;
                }
            }
        }

        // Update option states (for future use with checkmarks or active states)
        const options = document.querySelectorAll('.group-filter-option');
        options.forEach(option => {
            const btn = option as HTMLElement;
            const groupId = btn.dataset.group;
            
            if (groupId === this.selectedGroup) {
                btn.classList.add('bg-purple-50');
            } else {
                btn.classList.remove('bg-purple-50');
            }
        });
    }

    private updateFilterDescription(): void {
        const description = document.getElementById('filter-description');
        if (description && this.pageGroups) {
            if (this.selectedGroup === 'all') {
                description.textContent = 'Showing all application groups and their connections';
            } else {
                const groupData = this.pageGroups.groups[this.selectedGroup];
                const groupName = groupData?.name || 'selected';
                description.textContent = `Showing only ${groupName} group and connected components`;
            }
        }
    }

    private applyGroupFilter(): void {
        if (this.currentViewMode !== 'group' || !this.pageGroups) {
            return;
        }

        console.log(`🔍 Applying group filter for: ${this.selectedGroup}`);

        if (this.selectedGroup === 'all') {
            this.showAllCards();
            return;
        }

        // Get APIs used by the selected group
        const selectedGroupData = this.pageGroups.groups[this.selectedGroup];
        if (!selectedGroupData) {
            console.warn(`⚠️ Group data not found for: ${this.selectedGroup}`);
            return;
        }

        const groupApis = new Set<string>();
        Object.values(selectedGroupData.pages).forEach((page: any) => {
            page.apis?.forEach((api: string) => groupApis.add(api));
        });

        console.log(`📋 Group ${this.selectedGroup} uses APIs:`, Array.from(groupApis));

        // Extract servers and backends from APIs
        const connectedServers = new Set<string>();
        const connectedBackends = new Set<string>();

        groupApis.forEach(api => {
            const [serverName] = api.split(':');
            connectedServers.add(serverName);
        });

        // Find backends connected to these servers
        document.querySelectorAll('.server-card').forEach(serverCard => {
            const serverId = serverCard.getAttribute('data-server');
            if (serverId && connectedServers.has(serverId)) {
                const backendsJson = serverCard.getAttribute('data-backends');
                if (backendsJson) {
                    try {
                        const backends = JSON.parse(backendsJson) as string[];
                        backends.forEach(backend => {
                            connectedBackends.add(backend);
                        });
                    } catch (error) {
                        console.error('Error parsing server backends data:', error);
                    }
                }
            }
        });

        console.log(`🔗 Connected servers:`, Array.from(connectedServers));
        console.log(`🔗 Connected backends:`, Array.from(connectedBackends));

        // Hide/show cards based on connections
        this.filterCards(this.selectedGroup, connectedServers, connectedBackends);
    }

    private filterCards(selectedGroup: string, connectedServers: Set<string>, connectedBackends: Set<string>): void {
        // Show selected group card, hide others
        document.querySelectorAll('.group-card').forEach(card => {
            const cardElement = card as HTMLElement;
            const cardGroupId = cardElement.getAttribute('data-group');
            
            if (cardGroupId === selectedGroup) {
                this.showCard(cardElement);
                console.log(`👁️ Showing group card: ${selectedGroup}`);
            } else {
                this.hideCard(cardElement);
                console.log(`🙈 Hiding group card: ${cardGroupId}`);
            }
        });

        // Show connected servers, hide others
        document.querySelectorAll('.server-card').forEach(card => {
            const cardElement = card as HTMLElement;
            const serverId = cardElement.getAttribute('data-server');
            
            if (serverId && connectedServers.has(serverId)) {
                this.showCard(cardElement);
                console.log(`👁️ Showing server card: ${serverId}`);
                // Filter API items within the server card
                this.filterServerApiItems(cardElement, selectedGroup);
            } else {
                this.hideCard(cardElement);
                console.log(`🙈 Hiding server card: ${serverId}`);
            }
        });

        // Show connected backends, hide others
        document.querySelectorAll('.backend-card').forEach(card => {
            const cardElement = card as HTMLElement;
            const backendId = cardElement.getAttribute('data-backend');
            
            if (backendId && connectedBackends.has(backendId)) {
                this.showCard(cardElement);
                console.log(`👁️ Showing backend card: ${backendId}`);
            } else {
                this.hideCard(cardElement);
                console.log(`🙈 Hiding backend card: ${backendId}`);
            }
        });

        // Update visible API counts after filtering
        this.updateVisibleApiCounts();
    }

    private showCard(card: HTMLElement): void {
        card.style.display = '';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        card.style.pointerEvents = 'auto';
        card.classList.remove('filtered-hidden');
    }

    private hideCard(card: HTMLElement): void {
        card.style.display = 'none';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        card.style.pointerEvents = 'none';
        card.classList.add('filtered-hidden');
    }

    private showAllCards(): void {
        console.log('👁️ Showing all cards (filter disabled)');
        
        const allCards = document.querySelectorAll('.group-card, .page-card, .server-card, .backend-card');
        allCards.forEach(card => {
            this.showCard(card as HTMLElement);
        });

        // Show all API items
        document.querySelectorAll('.api-item').forEach(apiItem => {
            (apiItem as HTMLElement).style.display = '';
        });

        // Update API counts to show all
        this.updateVisibleApiCounts();
    }

    // Dropdown interaction methods
    private toggleDropdown(): void {
        const menu = document.getElementById('group-filter-dropdown-menu');
        const toggle = document.getElementById('group-filter-dropdown-toggle');
        const arrow = document.getElementById('dropdown-arrow');
        
        if (menu && toggle && arrow) {
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';
            
            if (isOpen) {
                this.closeDropdown();
            } else {
                this.openDropdown();
            }
        }
    }

    private openDropdown(): void {
        const menu = document.getElementById('group-filter-dropdown-menu');
        const toggle = document.getElementById('group-filter-dropdown-toggle');
        const arrow = document.getElementById('dropdown-arrow');
        
        if (menu && toggle && arrow) {
            menu.classList.remove('opacity-0', 'invisible', 'scale-95');
            menu.classList.add('opacity-100', 'visible', 'scale-100');
            toggle.setAttribute('aria-expanded', 'true');
            arrow.style.transform = 'rotate(180deg)';
        }
    }

    private closeDropdown(): void {
        const menu = document.getElementById('group-filter-dropdown-menu');
        const toggle = document.getElementById('group-filter-dropdown-toggle');
        const arrow = document.getElementById('dropdown-arrow');
        
        if (menu && toggle && arrow) {
            menu.classList.remove('opacity-100', 'visible', 'scale-100');
            menu.classList.add('opacity-0', 'invisible', 'scale-95');
            toggle.setAttribute('aria-expanded', 'false');
            arrow.style.transform = 'rotate(0deg)';
        }
    }

    // Public method to get connected components for a group (useful for testing)
    getConnectedComponents(groupId: string): { servers: string[], backends: string[] } {
        if (!this.pageGroups || groupId === 'all') {
            return { servers: [], backends: [] };
        }

        const groupData = this.pageGroups.groups[groupId];
        if (!groupData) {
            return { servers: [], backends: [] };
        }

        const servers = new Set<string>();
        const backends = new Set<string>();

        Object.values(groupData.pages).forEach((page: any) => {
            page.apis?.forEach((api: string) => {
                const [serverName] = api.split(':');
                servers.add(serverName);
            });
        });

        // Find backends connected to these servers
        document.querySelectorAll('.server-card').forEach(serverCard => {
            const serverId = serverCard.getAttribute('data-server');
            if (serverId && servers.has(serverId)) {
                const backendsJson = serverCard.getAttribute('data-backends');
                if (backendsJson) {
                    try {
                        const serverBackends = JSON.parse(backendsJson) as string[];
                        serverBackends.forEach(backend => {
                            backends.add(backend);
                        });
                    } catch (error) {
                        console.error('Error parsing server backends data:', error);
                    }
                }
            }
        });

        return {
            servers: Array.from(servers),
            backends: Array.from(backends)
        };
    }

    private filterServerApiItems(serverCard: HTMLElement, selectedGroup: string): void {
        if (!this.pageGroups) return;

        const selectedGroupData = this.pageGroups.groups[selectedGroup];
        if (!selectedGroupData) return;

        // Get APIs used by the selected group
        const groupApis = new Set<string>();
        Object.values(selectedGroupData.pages).forEach((page: any) => {
            page.apis?.forEach((api: string) => groupApis.add(api));
        });

        // Hide/show API items within the server card
        const apiItems = serverCard.querySelectorAll('.api-item');
        apiItems.forEach(apiItem => {
            const apiElement = apiItem as HTMLElement;
            const fullApi = apiElement.getAttribute('data-full-api');
            
            if (fullApi && groupApis.has(fullApi)) {
                apiElement.style.display = '';
                console.log(`👁️ Showing API: ${fullApi}`);
            } else {
                apiElement.style.display = 'none';
                console.log(`🙈 Hiding API: ${fullApi}`);
            }
        });
    }

    private updateVisibleApiCounts(): void {
        // Update API count for each visible server card
        document.querySelectorAll('.server-card:not(.filtered-hidden)').forEach(serverCard => {
            const apiCountBadge = serverCard.querySelector('[data-api-count]');
            if (!apiCountBadge) return;

            // Count visible API items
            const totalApiItems = serverCard.querySelectorAll('.api-item').length;
            const visibleApiItems = serverCard.querySelectorAll('.api-item:not([style*="display: none"])').length;
            
            // Update the badge text
            apiCountBadge.textContent = `${visibleApiItems} APIs`;
            
            console.log(`📊 Server ${serverCard.getAttribute('data-server')}: ${visibleApiItems}/${totalApiItems} APIs visible`);
        });
    }
}