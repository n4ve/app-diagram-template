// Debug tool to test view toggle functionality
console.log('🔍 Testing View Toggle Functionality...\n');

// Wait for DOM to be ready
setTimeout(() => {
    console.log('1️⃣ Checking initial DOM elements...');
    
    const pageView = document.getElementById('page-view');
    const groupView = document.getElementById('group-view');
    const pageButton = document.querySelector('[data-view="page"]') as HTMLElement;
    const groupButton = document.querySelector('[data-view="group"]') as HTMLElement;
    const columnTitle = document.getElementById('pages-column-title');
    
    console.log('Page View:', pageView);
    console.log('Group View:', groupView);
    console.log('Page Button:', pageButton);
    console.log('Group Button:', groupButton);
    console.log('Column Title:', columnTitle);
    
    if (!pageView || !groupView || !pageButton || !groupButton) {
        console.error('❌ Required elements not found!');
        return;
    }
    
    console.log('\n2️⃣ Initial state:');
    console.log('Page View classes:', pageView.className);
    console.log('Group View classes:', groupView.className);
    console.log('Page View hidden?', pageView.classList.contains('hidden'));
    console.log('Group View hidden?', groupView.classList.contains('hidden'));
    
    console.log('\n3️⃣ Simulating group button click...');
    
    // Manually toggle classes to test
    console.log('Before toggle:');
    console.log('- Page View display:', window.getComputedStyle(pageView).display);
    console.log('- Group View display:', window.getComputedStyle(groupView).display);
    
    // Toggle to group view
    pageView.classList.add('hidden');
    groupView.classList.remove('hidden');
    
    console.log('\nAfter manual toggle:');
    console.log('- Page View classes:', pageView.className);
    console.log('- Group View classes:', groupView.className);
    console.log('- Page View display:', window.getComputedStyle(pageView).display);
    console.log('- Group View display:', window.getComputedStyle(groupView).display);
    
    // Test actual button click
    console.log('\n4️⃣ Testing actual button click...');
    
    // Reset to initial state
    pageView.classList.remove('hidden');
    groupView.classList.add('hidden');
    
    // Add click listener to test
    groupButton.addEventListener('click', (e) => {
        console.log('Group button clicked!');
        console.log('Event target:', e.target);
        console.log('Current target:', e.currentTarget);
    });
    
    // Trigger click
    groupButton.click();
    
    // Check DiagramController
    console.log('\n5️⃣ Checking DiagramController...');
    if ((window as any).diagramController) {
        console.log('DiagramController found!');
        const controller = (window as any).diagramController;
        console.log('Current view mode:', controller.getCurrentViewMode());
        
        // Try switching view mode directly
        console.log('\n6️⃣ Switching to group view directly...');
        controller.switchToGroupView();
        
        setTimeout(() => {
            console.log('After direct switch:');
            console.log('- Current view mode:', controller.getCurrentViewMode());
            console.log('- Page View hidden?', pageView.classList.contains('hidden'));
            console.log('- Group View hidden?', groupView.classList.contains('hidden'));
        }, 500);
    } else {
        console.error('❌ DiagramController not found on window!');
    }
    
}, 1000);