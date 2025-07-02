/**
 * Main Application Entry Point
 * Guilherme Ferreira Portfolio Website
 * @version 2.2.1 - Back to Gallery Navigation Fix
 */

import { LoadingController } from './modules/loading.js';
// import UnifiedMascot from './modules/mascot-unified.js'; // TEMPORARILY DISABLED FOR DEVELOPMENT
import GalleryController from './modules/gallery.js';
import { NavigationController } from './modules/navigation-clean.js';
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
  
  // Ensure fast loading state is removed
  LoadingController.hide();
  
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
    this.projectContent = null;
    this.heroParallax = null;
    this.isInitialized = false;
    
    // this.setupFocusManagement(); // TEMPORARILY DISABLED FOR DEVELOPMENT
    this.init();
  }

  setupFocusManagement() {
    // TEMPORARILY DISABLED FOR DEVELOPMENT
    return;
    
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
    
    // Ensure fast loading - remove any loading states immediately
    LoadingController.init();
    
    // Log browser compatibility info for debugging
    this.logBrowserInfo();
    
    try {
      // INITIALIZE MODULES IMMEDIATELY for fast experience
      console.log('🧭 Initializing Navigation...');
      this.navigation = new NavigationController();
      this.navigation.init();
      
      console.log('🖼️ Initializing Gallery...');
      this.gallery = new GalleryController();
      
      // console.log('🐧 Initializing Mascot...'); // TEMPORARILY DISABLED FOR DEVELOPMENT
      // this.mascot = new UnifiedMascot(); // TEMPORARILY DISABLED FOR DEVELOPMENT
      this.mascot = null; // Set to null to prevent errors
      
      console.log('📄 Initializing Project Content...');
      this.projectContent = new ProjectContentManager();
      
      console.log('🌄 Initializing Hero Parallax...');
      this.heroParallax = new HeroParallaxController();
      
      // Make project content manager globally accessible immediately
      window.projectContentManager = this.projectContent;
      
      // CONNECT PROJECT CONTENT MANAGER TO GALLERY FOR SPA NAVIGATION
      this.gallery.setProjectContentManager(this.projectContent);
      this.projectContent.setNavigationController(this.navigation);
      
      // Setup cross-module communication
      this.setupModuleCommunication();
      
      // Setup smooth scroll functionality
      this.setupSmoothScroll();
      
      // Initialize mascot directly with entrance complete
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
    // MASCOT EVENTS TEMPORARILY DISABLED FOR DEVELOPMENT
    /*
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
    */
    
    // PROJECT CONTENT AND NAVIGATION EVENTS TEMPORARILY DISABLED FOR DEVELOPMENT
    /*
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
    */
  }

  setupSmoothScroll() {
    // Handle smooth scrolling for anchor links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      
      const href = link.getAttribute('href');
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Smooth scroll to target
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
        
        // Update URL without jumping
        if (history.pushState) {
          history.pushState(null, null, href);
        }
        
        // Log the scroll action
        console.log(`🔗 Smooth scroll to: ${targetId}`);
        
        // Trigger custom event for potential mascot reactions
        document.dispatchEvent(new CustomEvent('scroll:anchor', {
          detail: { target: targetId, element: targetElement }
        }));
      }
    });
    
    console.log('✨ Smooth scroll functionality initialized');
  }

  handleInitializationError(error) {
    // Ensure fast loading state is removed
    LoadingController.hide();
    
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
    return null; // TEMPORARILY DISABLED FOR DEVELOPMENT
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
      mascot: null, // TEMPORARILY DISABLED FOR DEVELOPMENT
      gallery: this.gallery,
      navigation: this.navigation,
      initialized: this.isInitialized
    };
  }
  
  // Cleanup method
  destroy() {
    // this.mascot?.destroy(); // TEMPORARILY DISABLED FOR DEVELOPMENT
    this.gallery?.destroy();
    this.navigation?.destroy();
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
    
    // Also trigger navigation to projects section for consistency
    setTimeout(() => {
      if (window.portfolioApp && window.portfolioApp.navigation) {
        window.portfolioApp.navigation.scrollToSection('projects');
      }
    }, 100);
  } else {
    console.warn('Project content manager not available, using fallback navigation');
    // Fallback: scroll directly to projects section
    const projectsSection = document.querySelector('#projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

// Make debug available globally in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debug = () => window.portfolioApp?.debug();
}

// Handle page unload
window.addEventListener('beforeunload', () => {
  window.portfolioApp?.destroy();
});

export default PortfolioApp;
