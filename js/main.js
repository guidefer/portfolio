/**
 * Main Application Entry Point
 * Guilherme Ferreira Portfolio Website
 */

import UnifiedMascot from './modules/mascot-unified.js';
import GalleryController from './modules/gallery.js';
import NavigationController from './modules/navigation.js';
// import LoadingController from './modules/loading.js'; // TEMPORARILY DISABLED
import ProjectContentManager from './modules/project-content.js';
import HeroParallaxController from './modules/hero-parallax.js';

// Global error handler for unhandled module errors
window.addEventListener('error', (event) => {
  console.error('❌ Global error caught:', event.error);
  if (event.error && event.error.message && event.error.message.includes('module')) {
    showModuleLoadError(event.error);
  }
});

// Global error handler for unhandled promise rejections (ES6 modules)
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason);
  if (event.reason && event.reason.message && event.reason.message.includes('module')) {
    showModuleLoadError(event.reason);
  }
});

function showModuleLoadError(error) {
  // Prevent multiple error messages
  if (document.querySelector('.error-message')) {
    return;
  }
  
  // Hide loading screen
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }
  
  // Show error message
  const errorMessage = document.createElement('div');
  errorMessage.className = 'error-message';
  errorMessage.innerHTML = `
    <div class="error-content">
      <h2>Oops! Something went wrong 🦔</h2>
      <p>We're having trouble loading the portfolio. Please try refreshing the page.</p>
      <button onclick="window.location.reload()" class="error-retry-btn">
        Retry
      </button>
    </div>
  `;
  document.body.appendChild(errorMessage);
  
  console.error('Module load error details:', error);
}

class PortfolioApp {
  constructor() {
    this.mascot = null;
    this.gallery = null;
    this.navigation = null;
    // this.loading = null; // TEMPORARILY DISABLED
    this.projectContent = null;
    this.heroParallax = null;
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
          // DON'T override box-shadow or border - let CSS handle hover effects
        }, 100); // Increased delay to let gallery navigation happen first
      }
    });
    
    // Watch for focus events with minimal interference
    document.addEventListener('focusin', (e) => {
      const galleryItem = e.target.closest('.gallery-item');
      if (galleryItem && !isUsingKeyboard) {
        setTimeout(() => {
          e.target.style.outline = 'none';
          // DON'T override box-shadow or border - let CSS handle hover effects
        }, 50); // Minimal delay, only remove visual focus
      }
    });
  }

  async init() {
    console.log('🚀 Initializing Portfolio App...');
    
    // Log browser compatibility info for debugging
    this.logBrowserInfo();
    
    try {
      // Add more detailed error logging for Safari debugging
      console.log('📱 User agent:', navigator.userAgent);
      console.log('📱 Platform:', navigator.platform);
      
      // INITIALIZE MODULES BEFORE LOADING STARTS - with individual error handling
      console.log('🧭 Initializing Navigation...');
      this.navigation = new NavigationController();
      
      console.log('🖼️ Initializing Gallery...');
      this.gallery = new GalleryController();
      
      console.log('🐧 Initializing Mascot...');
      this.mascot = new UnifiedMascot();
      
      console.log('📄 Initializing Project Content...');
      this.projectContent = new ProjectContentManager();
      
      console.log('🌄 Initializing Hero Parallax...');
      this.heroParallax = new HeroParallaxController();
      
      // Make project content manager globally accessible immediately
      window.projectContentManager = this.projectContent;
      
      // INITIALIZE LOADING CONTROLLER - TEMPORARILY DISABLED
      // this.loading = new LoadingController();
      
      // CONNECT PROJECT CONTENT MANAGER TO GALLERY FOR SPA NAVIGATION
      this.gallery.setProjectContentManager(this.projectContent);
      this.projectContent.setNavigationController(this.navigation);
      
      // Setup cross-module communication
      this.setupModuleCommunication();
      
      // Start loading sequence - TEMPORARILY DISABLED
      // await this.loading.start();
      
      // After initial loading, hide petals for better performance during browsing - TEMPORARILY DISABLED
      // setTimeout(() => {
      //   this.loading.hideForBrowsing();
      // }, 3000);
      
      // IMMEDIATE SETUP WITHOUT LOADING SCREEN
      document.body.classList.remove('loading');
      document.body.classList.add('loading-complete');
      
      // Hide loading screen immediately
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }
      
      // Initialize mascot directly
      setTimeout(() => {
        if (this.mascot) {
          this.mascot.container?.classList.add('entrance-complete');
        }
      }, 500);
      
      this.isInitialized = true;
      console.log('✅ Portfolio App fully initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        fileName: error.fileName,
        lineNumber: error.lineNumber
      });
      this.handleInitializationError(error);
    }
  }

  forceFocusRemoval() {
    // Handle focus removal without conflicting with hover effects
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
      // Only remove focus visuals when not using keyboard
      item.addEventListener('mousedown', () => {
        setTimeout(() => {
          if (!document.body.classList.contains('using-keyboard')) {
            item.style.outline = 'none';
            item.blur();
          }
        }, 50);
      });
    });
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
    
    // Project content events
    document.addEventListener('project:show', () => {
      this.mascot?.onInteraction('project-view');
    });
    
    document.addEventListener('project:hide', () => {
      this.mascot?.onInteraction('project-close');
    });
    
    // Navigation events trigger mascot reactions
    document.addEventListener('navigation:menu-toggle', () => {
      this.mascot?.onInteraction('menu-toggle');
    });
    
    document.addEventListener('navigation:link-click', () => {
      this.mascot?.onInteraction('navigation');
    });
    
    // Loading events - TEMPORARILY DISABLED
    // document.addEventListener('loading:start', () => {
    //   // Mascot will be initialized after loading completes
    //   console.log('🌸 Loading started');
    // });
    
    // Progress completion event - triggered when progress bar reaches 100% - TEMPORARILY DISABLED
    // document.addEventListener('progress:complete', () => {
    //   console.log('🎯 Progress complete - modules already initialized');
    // });

    // document.addEventListener('loading:complete', () => {
    //   console.log('🌸 Loading screen fade complete');
    //   
    //   // Force remove focus from all gallery items after loading completes
    //   this.forceFocusRemoval();
    //   
    //   // Trigger mascot celebration
    //   this.mascot?.setState('excited');
    //   setTimeout(() => {
    //     this.mascot?.setState('idle');
    //   }, 3000);
    // });
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

  // Add detailed Safari compatibility logging
  logBrowserInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isiPhone = /iPhone/.test(userAgent);
    
    console.log('🔍 Browser Detection:', {
      userAgent,
      platform,
      isSafari,
      isIOS,
      isiPhone,
      hasModuleSupport: 'import' in HTMLScriptElement.prototype,
      hasES6: typeof Symbol !== 'undefined'
    });
    
    // Check for specific iOS/Safari features
    if (isIOS) {
      console.log('📱 iOS Device detected');
      console.log('📱 Viewport:', {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      });
    }
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
  
  getLoading() {
    return this.loading;
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
    this.projectContent?.destroy();
    this.heroParallax?.destroy();
    
    console.log('🧹 Portfolio App destroyed');
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.portfolioApp = new PortfolioApp();
});

// Global fallback function for back button
window.goBackToGallery = function() {
  if (window.projectContentManager) {
    window.projectContentManager.hideProject();
  } else {
    console.warn('Project content manager not available');
  }
};

// Make debug available globally in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debug = () => window.portfolioApp?.debug();
  
  // Load debug helper for enhanced loading
  import('./modules/debug-loading.js').then(module => {
    console.log('🔧 Debug helper loaded');
  }).catch(err => {
    console.warn('Debug helper failed to load:', err);
  });
}

// Handle page unload
window.addEventListener('beforeunload', () => {
  window.portfolioApp?.destroy();
});

// Fallback: Ensure content is always visible after a maximum time (DISABLED - using progress bar trigger)
// setTimeout(() => {
//   document.body.classList.remove('loading');
//   document.body.classList.add('loading-complete');
//   console.log('🔄 Loading fallback: Content made visible');
// }, 5000); // 5 second fallback

// Also ensure content is visible on page load (DISABLED - using progress bar trigger)
// document.addEventListener('DOMContentLoaded', () => {
//   // Add loading-complete class after a brief delay if loading hasn't started
//   setTimeout(() => {
//     if (!document.body.classList.contains('loading')) {
//       document.body.classList.add('loading-complete');
//     }
//   }, 100);
// });

export default PortfolioApp;
