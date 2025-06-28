// Main Application Script for Astro API Architecture Diagram

let activePageId = null;
let activeServerId = null;
let searchTerm = '';

// Initialize the application
export function initializeApp() {
  console.log('🚀 Initializing API Architecture Diagram...');
  
  // Simulate loading time
  setTimeout(() => {
    hideLoadingScreen();
    setupInteractions();
    setupSearch();
    setupKeyboardShortcuts();
    setupResponsiveFeatures();
    setupCardPositioning(); // เพิ่มการจัดตำแหน่งการ์ด
    console.log('✅ Application initialized successfully');
  }, 2000);
}

// Hide loading screen and show main app
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const mainApp = document.getElementById('mainApp');
  
  if (loadingScreen && mainApp) {
    loadingScreen.classList.add('opacity-0');
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      mainApp.classList.remove('hidden');
      
      // Trigger entrance animations
      triggerEntranceAnimations();
    }, 500);
  }
}

// Trigger entrance animations for cards
function triggerEntranceAnimations() {
  const cards = document.querySelectorAll('.page-card, .server-card, .stat-card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.animationPlayState = 'running';
    }, index * 100);
  });
}

// Setup card positioning to prevent overlaps
function setupCardPositioning() {
  const pageCards = document.querySelectorAll('.page-card');
  const serverCards = document.querySelectorAll('.server-card');
  
  // ลบ class ที่อาจทำให้การ์ดเลื่อนผิดตำแหน่ง
  [...pageCards, ...serverCards].forEach(card => {
    card.classList.remove('moving', 'repositioning');
    card.style.position = 'relative';
    card.style.zIndex = '10';
  });
  
  // จัดการการ์ดหน้าเพจ - ใช้ flexbox เพื่อจัดเรียงอัตโนมัติ
  const pageContainer = document.querySelector('.pages-container, .pages-section');
  if (pageContainer) {
    pageContainer.style.display = 'flex';
    pageContainer.style.flexDirection = 'column';
    pageContainer.style.gap = '16px';
    pageContainer.style.alignItems = 'stretch';
  }
  
  // จัดการการ์ดเซิร์ฟเวอร์ - ใช้ flexbox เพื่อจัดเรียงอัตโนมัติ
  const serverContainer = document.querySelector('.servers-container, .servers-section');
  if (serverContainer) {
    serverContainer.style.display = 'flex';
    serverContainer.style.flexDirection = 'column';
    serverContainer.style.gap = '16px';
    serverContainer.style.alignItems = 'stretch';
  }
  
  // รีเซ็ต margin และ padding ที่อาจสร้างปัญหา
  pageCards.forEach(card => {
    card.style.marginTop = '';
    card.style.marginBottom = '';
    card.style.transform = '';
    card.style.minHeight = 'auto';
  });
  
  serverCards.forEach(card => {
    card.style.marginTop = '';
    card.style.marginBottom = '';
    card.style.transform = '';
    card.style.minHeight = 'auto';
  });
  
  // ตรวจสอบและแก้ไขการ์ดที่ซ้อนทับ
  setTimeout(() => {
    fixOverlappingCards();
  }, 100);
  
  console.log('✅ Card positioning setup completed');
}

// ฟังก์ชันใหม่เพื่อแก้ไขการ์ดที่ซ้อนทับ
function fixOverlappingCards() {
  const allCards = document.querySelectorAll('.page-card, .server-card');
  const cardPositions = new Map();
  
  allCards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const cardId = card.dataset.page || card.dataset.server || Math.random().toString();
    
    cardPositions.set(cardId, {
      element: card,
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      height: rect.height
    });
  });
  
  // ตรวจสอบการซ้อนทับและปรับตำแหน่ง
  const cardArray = Array.from(cardPositions.values());
  for (let i = 0; i < cardArray.length; i++) {
    for (let j = i + 1; j < cardArray.length; j++) {
      const card1 = cardArray[i];
      const card2 = cardArray[j];
      
      // ตรวจสอบการซ้อนทับ
      if (isOverlapping(card1, card2)) {
        console.warn('Found overlapping cards, adjusting...');
        // เพิ่ม margin เพื่อแยกการ์ด
        card2.element.style.marginTop = '20px';
      }
    }
  }
}

// ตรวจสอบว่าการ์ดสองใบซ้อนทับกันหรือไม่
function isOverlapping(card1, card2) {
  return !(card1.right < card2.left || 
           card2.right < card1.left || 
           card1.bottom < card2.top || 
           card2.bottom < card1.top);
}

// Adjust card heights to prevent overlap
function adjustCardHeights(cards) {
  cards.forEach(card => {
    const content = card.querySelector('.card-content') || card;
    const minHeight = Math.max(200, content.scrollHeight + 40);
    card.style.minHeight = `${minHeight}px`;
  });
}

// Setup page and server card interactions
function setupInteractions() {
  // Page card interactions (only handle page-level hover, let ConnectionArea handle API items)
  const pageCards = document.querySelectorAll('.page-card');
  pageCards.forEach(pageCard => {
    const pageId = pageCard.dataset.page;
    
    pageCard.addEventListener('mouseenter', () => {
      if (pageId) {
        highlightPageConnections(pageId);
        activePageId = pageId;
      }
    });
    
    pageCard.addEventListener('mouseleave', () => {
      clearHighlights();
      activePageId = null;
    });
  });

  // Server card interactions
  const serverCards = document.querySelectorAll('.server-card');
  serverCards.forEach(serverCard => {
    const serverId = serverCard.dataset.server;
    
    serverCard.addEventListener('mouseenter', () => {
      if (serverId) {
        highlightServerConnections(serverId);
        activeServerId = serverId;
      }
    });
    
    serverCard.addEventListener('mouseleave', () => {
      clearHighlights();
      activeServerId = null;
    });
  });

  // API item interactions - ใช้ event delegation
  document.addEventListener('mouseenter', (e) => {
    if (e.target.matches('.api-item[data-server]')) {
      const serverId = e.target.dataset.server;
      const pageId = e.target.closest('.page-card')?.dataset.page;
      if (serverId && pageId) {
        highlightSpecificConnection(pageId, serverId);
      }
    }
  }, true);

  document.addEventListener('mouseleave', (e) => {
    if (e.target.matches('.api-item[data-server]')) {
      clearHighlights();
    }
  }, true);
}

// Highlight connections for a specific page (แสดงเส้นธรรมดา)
function highlightPageConnections(pageId) {
  // Clear previous highlights
  clearHighlights();
  
  // Find all connections for this page
  const connections = document.querySelectorAll(`[data-connection*="${pageId}"]`);
  connections.forEach(connection => {
    connection.classList.add('visible');
  });
  
  // Highlight connected servers
  const pageElement = document.querySelector(`[data-page="${pageId}"]`);
  if (pageElement) {
    const apiItems = pageElement.querySelectorAll('.api-item[data-server]');
    apiItems.forEach(item => {
      const serverId = item.dataset.server;
      const serverElement = document.querySelector(`[data-server="${serverId}"]`);
      if (serverElement) {
        serverElement.classList.add('highlighted');
      }
    });
  }
}

// Highlight connections for a specific server
function highlightServerConnections(serverId) {
  clearHighlights();
  
  const connections = document.querySelectorAll(`[data-connection*="${serverId}"]`);
  connections.forEach(connection => {
    connection.classList.add('visible');
  });
  
  // Highlight connected pages
  const apiItems = document.querySelectorAll(`[data-server="${serverId}"]`);
  apiItems.forEach(item => {
    const pageElement = item.closest('.page-card');
    if (pageElement) {
      pageElement.classList.add('highlighted');
    }
  });
}

// Highlight a specific connection (เส้นเด่นขึ้น)
function highlightSpecificConnection(pageId, serverId) {
  clearHighlights();
  
  const connectionId = `${pageId}-${serverId}`;
  const connection = document.querySelector(`[data-connection="${connectionId}"]`);
  if (connection) {
    connection.classList.add('highlighted');
  }
  
  // Highlight the specific server card
  const serverElement = document.querySelector(`[data-server="${serverId}"]`);
  if (serverElement) {
    serverElement.classList.add('highlighted');
  }
}

// Clear all highlights
function clearHighlights() {
  // Clear connection highlights
  const connections = document.querySelectorAll('.connection-line, .connection-dot');
  connections.forEach(connection => {
    connection.classList.remove('visible', 'highlighted');
  });
  
  // Clear card highlights
  const cards = document.querySelectorAll('.page-card, .server-card');
  cards.forEach(card => {
    card.classList.remove('highlighted');
  });
  
  // Clear API item highlights
  const apiItems = document.querySelectorAll('.api-item');
  apiItems.forEach(item => {
    item.classList.remove('highlighted');
  });
}

// Update connection positions (for responsive)
function updateConnectionPositions() {
  // Trigger ConnectionArea to recalculate positions
  const event = new CustomEvent('updateConnections');
  document.dispatchEvent(event);
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    filterContent();
  });
}

// Filter content based on search term
function filterContent() {
  const pageCards = document.querySelectorAll('.page-card');
  const serverCards = document.querySelectorAll('.server-card');
  
  [...pageCards, ...serverCards].forEach(card => {
    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
    const description = card.querySelector('p')?.textContent.toLowerCase() || '';
    const apis = Array.from(card.querySelectorAll('.api-item')).map(item => 
      item.textContent.toLowerCase()
    ).join(' ');
    
    const content = `${title} ${description} ${apis}`;
    const matches = searchTerm === '' || content.includes(searchTerm);
    
    card.style.display = matches ? '' : 'none';
  });
  
  // Update connections after filtering
  setTimeout(updateConnectionPositions, 100);
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Escape key to clear search and highlights
    if (e.key === 'Escape') {
      clearHighlights();
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = '';
        searchTerm = '';
        filterContent();
      }
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.focus();
      }
    }
  });
}

// Setup responsive features
function setupResponsiveFeatures() {
  let resizeTimeout;
  
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateConnectionPositions();
      adjustCardHeights(document.querySelectorAll('.page-card'));
      adjustCardHeights(document.querySelectorAll('.server-card'));
    }, 250);
  });
  
  // Setup intersection observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, observerOptions);
  
  // Observe all cards
  document.querySelectorAll('.page-card, .server-card').forEach(card => {
    observer.observe(card);
  });
}

// Initialize app when DOM is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeApp);
  
  // Also initialize if DOM is already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
}