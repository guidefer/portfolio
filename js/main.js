/**
 * Main Application Entry Point
 * Guilherme Ferreira Portfolio Website
 * @version 2.2.1 - Back to Gallery Navigation Fix
 */

import { LoadingController } from './modules/loading.js';
// import UnifiedMascot from './modules/mascot-unified.js'; // TEMPORARILY DISABLED FOR DEVELOPMENT
import GalleryController from './modules/gallery.js';
import { NavigationController } from './modules/navigation-clean.js';
import { BottomNavController } from './modules/bottom-nav.js';
import ProjectContentManager from './modules/project-content.js';
import HeroParallaxController from './modules/hero-parallax.js';

// Global error handler for unhandled module errors
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('module')) {
    showModuleLoadError(event.error);
  }
});

// Global error handler for unhandled promise rejections (ES6 modules)
window.addEventListener('unhandledrejection', (event) => {
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
}

class PortfolioApp {
  constructor() {
    this.mascot = null;
    this.gallery = null;
    this.navigation = null;
    this.bottomNav = null;
    this.projectContent = null;
    this.heroParallax = null;
    this.isInitialized = false;
    
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
    // Ensure fast loading - remove any loading states immediately
    LoadingController.init();
    
    // Log browser compatibility info for debugging
    this.logBrowserInfo();
    
    try {
      // INITIALIZE MODULES IMMEDIATELY for fast experience
      this.navigation = new NavigationController();
      this.navigation.init();
      
      this.bottomNav = new BottomNavController();
      
      this.gallery = new GalleryController();
      
      this.mascot = null; // Set to null to prevent errors
      
      this.projectContent = new ProjectContentManager();
      
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
      
    } catch (error) {
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
    // SYNC DESKTOP AND MOBILE NAVIGATION ACTIVE STATES
    if (this.navigation && this.bottomNav) {
      // When desktop navigation changes active state, update bottom nav
      this.navigation.setActiveStateChangeCallback((sectionId) => {
        this.bottomNav.updateActiveState(sectionId);
      });
    }
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
        
        // Trigger custom event for potential mascot reactions
        document.dispatchEvent(new CustomEvent('scroll:anchor', {
          detail: { target: targetId, element: targetElement }
        }));
      }
    });
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
  }

  // Remove detailed Safari compatibility logging  
  logBrowserInfo() {
    // Basic browser info for essential compatibility checks only
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Only log critical compatibility issues
    if (isIOS && window.innerHeight < 500) {
      // Minimal viewport warning for very small screens
    }
  }

  // Public API for external control
  getMascot() {
    return null;
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
  
  // Debug methods - removed for production
  debug() {
    return {
      app: this,
      mascot: null,
      gallery: this.gallery,
      navigation: this.navigation,
      initialized: this.isInitialized
    };
  }
  
  // Cleanup method
  destroy() {
    this.gallery?.destroy();
    this.navigation?.destroy();
    this.projectContent?.destroy();
    this.heroParallax?.destroy();
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
    // Fallback: scroll directly to projects section
    const projectsSection = document.querySelector('#projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

// Make debug available globally in development (removed for production)
// if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
//   window.debug = () => window.portfolioApp?.debug();
// }

// Handle page unload
window.addEventListener('beforeunload', () => {
  window.portfolioApp?.destroy();
});

export default PortfolioApp;
