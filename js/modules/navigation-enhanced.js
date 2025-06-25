/**
 * Enhanced Navigation with Loading Integration
 * Demonstrates how to use the pause/resume loading functionality
 */

class EnhancedNavigation {
  constructor(loadingController) {
    this.loadingController = loadingController;
    this.isNavigating = false;
    this.init();
  }

  init() {
    // Wait for initial loading to complete
    document.addEventListener('loading:complete', () => {
      this.setupNavigationListeners();
      // Hide petals after initial load for better performance
      setTimeout(() => {
        this.loadingController.hideForBrowsing();
      }, 2000);
    });
  }

  setupNavigationListeners() {
    // Listen for navigation clicks
    document.addEventListener('click', (e) => {
      const navLink = e.target.closest('[data-nav-link]');
      if (navLink && !this.isNavigating) {
        e.preventDefault();
        this.handleNavigation(navLink);
      }
    });

    // Listen for back/forward navigation
    window.addEventListener('popstate', (e) => {
      if (!this.isNavigating) {
        this.handleNavigation(null, e.state?.url || window.location.pathname);
      }
    });
  }

  async handleNavigation(link, url = null) {
    if (this.isNavigating) return;
    
    this.isNavigating = true;
    const targetUrl = url || link.getAttribute('href');
    
    console.log(`🔄 Starting navigation to: ${targetUrl}`);
    
    try {
      // Start navigation loading (reuses existing petals)
      await this.loadingController.startNavigation(targetUrl);
      
      // Simulate page transition
      await this.loadPage(targetUrl);
      
      // Update URL if needed
      if (!url) {
        history.pushState({ url: targetUrl }, '', targetUrl);
      }
      
      console.log(`✅ Navigation complete: ${targetUrl}`);
    } catch (error) {
      console.error('Navigation failed:', error);
    } finally {
      this.isNavigating = false;
    }
  }

  async loadPage(url) {
    // Simulate page loading
    console.log(`📄 Loading page content for: ${url}`);
    
    // In a real implementation, you would:
    // 1. Fetch the new page content
    // 2. Update the DOM
    // 3. Initialize any page-specific scripts
    
    // For demo purposes, just simulate loading time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate content update
    this.updatePageContent(url);
  }

  updatePageContent(url) {
    // Example of updating page content
    const mainContent = document.querySelector('main');
    if (mainContent) {
      // This would typically be replaced with actual page content
      mainContent.innerHTML = `
        <div class="page-content">
          <h1>Page: ${url}</h1>
          <p>This is the content for ${url}</p>
          <button data-nav-link href="/">Back to Home</button>
        </div>
      `;
    }
  }

  // Public method to trigger navigation programmatically
  async navigateTo(url) {
    await this.handleNavigation(null, url);
  }

  // Public method to check if navigation is in progress
  isNavigationInProgress() {
    return this.isNavigating;
  }
}

// Example usage in main.js:
/*
import LoadingController from './modules/loading.js';
import EnhancedNavigation from './modules/navigation-enhanced.js';

const loadingController = new LoadingController();
const navigation = new EnhancedNavigation(loadingController);

// Start initial loading
loadingController.start();

// Later, you can trigger navigation
// navigation.navigateTo('/about');
*/

export default EnhancedNavigation;
