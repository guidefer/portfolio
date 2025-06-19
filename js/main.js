/**
 * Main Application Entry Point
 * Guilherme Ferreira Portfolio Website
 */

import MascotController from './modules/mascot.js';
import GalleryController from './modules/gallery.js';
import NavigationController from './modules/navigation.js';
import LoadingController from './modules/loading.js';

class PortfolioApp {
  constructor() {
    this.mascot = null;
    this.gallery = null;
    this.navigation = null;
    this.loading = null;
    this.isInitialized = false;
    
    this.setupFocusManagement();
    this.init();
  }

  setupFocusManagement() {
    // Detect keyboard usage for accessibility
    let isUsingKeyboard = false;
    
    // Detect Tab key usage
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        isUsingKeyboard = true;
        document.body.classList.add('using-keyboard');
      }
    });
    
    // Detect mouse usage
    document.addEventListener('mousedown', () => {
      isUsingKeyboard = false;
      document.body.classList.remove('using-keyboard');
    });
    
    // Remove focus on click for non-keyboard users
    document.addEventListener('click', (e) => {
      if (!isUsingKeyboard && e.target.matches('a, button, .nav-link, .hero-cta, .contact-link')) {
        e.target.blur();
      }
    });
    
    // GENTLE FOCUS REMOVAL FOR GALLERY ITEMS (after a delay to not interfere with clicks)
    document.addEventListener('click', (e) => {
      const galleryItem = e.target.closest('.gallery-item');
      if (galleryItem && !isUsingKeyboard) {
        // Use a longer delay to allow click events to fire first
        setTimeout(() => {
          galleryItem.blur();
          galleryItem.style.outline = 'none';
          galleryItem.style.boxShadow = 'none';
          galleryItem.style.border = 'none';
        }, 100); // Increased delay to let gallery navigation happen first
      }
    });
    
    // Watch for focus events with minimal interference
    document.addEventListener('focusin', (e) => {
      const galleryItem = e.target.closest('.gallery-item');
      if (galleryItem && !isUsingKeyboard) {
        setTimeout(() => {
          e.target.style.outline = 'none';
          e.target.style.boxShadow = 'none';
          e.target.style.border = 'none';
        }, 50); // Minimal delay, only remove visual focus
      }
    });
  }

  async init() {
    console.log('🚀 Initializing Portfolio App...');
    
    try {
      // Start loading sequence
      this.loading = new LoadingController();
      await this.loading.start();
      
      // Initialize core modules
      this.navigation = new NavigationController();
      this.gallery = new GalleryController();
      this.mascot = new MascotController();
      
      // Setup cross-module communication
      this.setupModuleCommunication();
      
      // Complete loading and reveal content
      await this.loading.complete();
      
      this.isInitialized = true;
      console.log('✅ Portfolio App initialized successfully');
      
      // Force remove focus from all gallery items
      this.forceFocusRemoval();
      
      // Trigger initial mascot celebration
      this.mascot.onInteraction('page-load');
      
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      this.handleInitializationError(error);
    }
  }

  forceFocusRemoval() {
    // Add force-no-focus class to all gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
      item.classList.add('force-no-focus');
      item.style.outline = 'none';
      item.style.boxShadow = 'none';
      item.style.border = 'none';
      
      // Keep it focusable but remove visual focus - DON'T set tabindex="-1"
      // This was preventing click events from working properly
    });
    
    // Also add to gallery grid
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
      galleryGrid.classList.add('force-no-focus');
      galleryGrid.style.outline = 'none';
      galleryGrid.style.boxShadow = 'none';
    }
  }

  setupModuleCommunication() {
    // Gallery events trigger mascot reactions
    document.addEventListener('gallery:item-hover', () => {
      this.mascot?.onInteraction('gallery-hover');
    });
    
    document.addEventListener('gallery:item-click', () => {
      this.mascot?.onInteraction('gallery-click');
    });
    
    document.addEventListener('gallery:load-more', () => {
      this.mascot?.onInteraction('gallery-load');
    });
    
    // Navigation events trigger mascot reactions
    document.addEventListener('navigation:menu-toggle', () => {
      this.mascot?.onInteraction('menu-toggle');
    });
    
    document.addEventListener('navigation:link-click', () => {
      this.mascot?.onInteraction('navigation');
    });
    
    // Loading events
    document.addEventListener('loading:start', () => {
      this.mascot?.showLoading();
    });
    
    document.addEventListener('loading:complete', () => {
      this.mascot?.setState('excited');
      setTimeout(() => {
        this.mascot?.setState('idle');
      }, 3000);
    });
  }

  handleInitializationError(error) {
    // Remove loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
    
    // Show error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
      <div class="error-content">
        <h2>Oops! Something went wrong</h2>
        <p>We're having trouble loading the portfolio. Please try refreshing the page.</p>
        <button onclick="window.location.reload()" class="error-retry-btn">
          Retry
        </button>
      </div>
    `;
    document.body.appendChild(errorMessage);
    
    console.error('Initialization error details:', error);
  }

  // Public API for external control
  getMascot() {
    return this.mascot;
  }
  
  getGallery() {
    return this.gallery;
  }
  
  getNavigation() {
    return this.navigation;
  }
  
  // Debug methods
  debug() {
    return {
      app: this,
      mascot: this.mascot,
      gallery: this.gallery,
      navigation: this.navigation,
      loading: this.loading,
      initialized: this.isInitialized
    };
  }
  
  // Cleanup method
  destroy() {
    this.mascot?.destroy();
    this.gallery?.destroy();
    this.navigation?.destroy();
    this.loading?.destroy();
    
    console.log('🧹 Portfolio App destroyed');
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.portfolioApp = new PortfolioApp();
});

// Make debug available globally in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debug = () => window.portfolioApp?.debug();
}

// Handle page unload
window.addEventListener('beforeunload', () => {
  window.portfolioApp?.destroy();
});

// Fallback: Ensure content is always visible after a maximum time
setTimeout(() => {
  document.body.classList.remove('loading');
  document.body.classList.add('loading-complete');
  console.log('🔄 Loading fallback: Content made visible');
}, 5000); // 5 second fallback

// Also ensure content is visible on page load
document.addEventListener('DOMContentLoaded', () => {
  // Add loading-complete class after a brief delay if loading hasn't started
  setTimeout(() => {
    if (!document.body.classList.contains('loading')) {
      document.body.classList.add('loading-complete');
    }
  }, 100);
});

export default PortfolioApp;
