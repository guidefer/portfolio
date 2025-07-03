/**
 * Gallery Controller
 * Handles portfolio gallery functionality with auto-loading and interactions
 */

import { portfolioData } from '../config/portfolio-data.js';

class GalleryController {
  constructor() {
    this.container = null;
    this.grid = null;
    this.loadMoreBtn = null;
    this.currentItems = 0;
    this.maxItems = 15;
    this.initialLoadCount = 6;
    this.batchSize = 3;
    this.isLoading = false;
    this.observer = null;
    this.projectContentManager = null; // Add project content manager reference
    this.resizeTimeout = null;
    
    // Store bound resize handler for cleanup
    this.boundResizeHandler = null;
    
    // Animation state management
    this.animationState = {
      isAnimating: false,
      currentHero: null,
      animationTimeouts: [],
      debounceTimer: null,
      lastHoverTime: 0
    };
    
    this.init();
  }

  /**
   * Connect the project content manager for SPA navigation
   */
  setProjectContentManager(projectContentManager) {
    this.projectContentManager = projectContentManager;
  }

  init() {
    this.container = document.querySelector('.gallery-section');
    this.grid = document.querySelector('.gallery-grid');
    this.loadMoreBtn = document.getElementById('load-more-btn');
    
    if (!this.container || !this.grid) {
      console.warn('Gallery elements not found');
      return;
    }
    
    // Check if portfolio data is available
    if (!portfolioData || !Array.isArray(portfolioData) || portfolioData.length === 0) {
      this.showDataError();
      return;
    }
    
    this.setupIntersectionObserver();
    this.bindEvents();
    this.loadInitialItems();
  }

  showDataError() {
    if (this.grid) {
      this.grid.innerHTML = `
        <div class="gallery-error">
          <h3>Oops! Something went wrong 🦔</h3>
          <p>We're having trouble loading the portfolio. Please try refreshing the page.</p>
          <button onclick="window.location.reload()" class="error-retry-btn">
            Retry
          </button>
        </div>
      `;
    }
  }

  setupIntersectionObserver() {
    // Observer for auto-loading more items when scrolling
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isLoading && this.currentItems < this.maxItems) {
            this.loadMoreItems();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );
  }

  bindEvents() {
    // Load more button click
    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', () => {
        this.loadMoreItems();
        this.dispatchEvent('gallery:load-more');
      });
    }
    
    // Handle window resize to re-setup context dimming
    this.boundResizeHandler = () => {
      this.debounceResize(() => {
        this.setupContextDimming();
      });
    };
    window.addEventListener('resize', this.boundResizeHandler);
    
    // Note: Gallery hover events are handled in setupContextDimming()
    // to avoid conflicts with the blur effects
  }

  debounceResize(func, delay = 300) {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(func, delay);
  }

  async loadInitialItems() {
    this.isLoading = true;
    
    try {
      // Extra check for Safari compatibility
      if (!portfolioData || portfolioData.length === 0) {
        throw new Error('Portfolio data is empty or not loaded');
      }
      
      // Remove loading placeholder
      const loadingPlaceholder = this.grid.querySelector('.gallery-loading');
      if (loadingPlaceholder) {
        loadingPlaceholder.remove();
      }
      
      // Load first batch of items
      const itemsToLoad = portfolioData.slice(0, this.initialLoadCount);
      
      await this.renderItems(itemsToLoad);
      
      this.currentItems = this.initialLoadCount;
      
      // Setup observer on last item for auto-loading
      this.updateObserver();
      
      // Show load more button if there are more items
      this.updateLoadMoreButton();
      
      // Setup context dimming for newly loaded items (with small delay to ensure DOM is ready)
      setTimeout(() => {
        this.setupContextDimming();
      }, 100);
      
    } catch (error) {
      this.showDataError();
    } finally {
      this.isLoading = false;
    }
  }

  async loadMoreItems() {
    if (this.isLoading || this.currentItems >= this.maxItems) return;
    
    this.isLoading = true;
    
    try {
      const startIndex = this.currentItems;
      const endIndex = Math.min(startIndex + this.batchSize, this.maxItems);
      const itemsToLoad = portfolioData.slice(startIndex, endIndex);
      
      if (itemsToLoad.length === 0) {
        this.hideLoadMoreButton();
        return;
      }
      
      await this.renderItems(itemsToLoad);
      this.currentItems = endIndex;
      
      // Update observer and load more button
      this.updateObserver();
      this.updateLoadMoreButton();
      
      // Re-setup context dimming for all items including new ones (with delay)
      setTimeout(() => {
        this.setupContextDimming();
      }, 100);
      
      this.dispatchEvent('gallery:items-loaded', { 
        count: itemsToLoad.length,
        total: this.currentItems 
      });
      
    } catch (error) {
      // Handle error silently in production
    } finally {
      this.isLoading = false;
    }
  }

  async renderItems(items) {
    const fragment = document.createDocumentFragment();
    
    for (const item of items) {
      const element = await this.createGalleryItem(item);
      fragment.appendChild(element);
    }
    
    this.grid.appendChild(fragment);
    
    // Trigger layout and animate in
    requestAnimationFrame(() => {
      const newItems = this.grid.querySelectorAll('.gallery-item:not(.visible)');
      newItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('visible');
        }, index * 100);
      });
    });
  }

  async createGalleryItem(data) {
    const item = document.createElement('article');
    item.className = 'gallery-item'; // Removed force-no-focus to allow hover effects
    item.setAttribute('data-project-id', data.id);
    
    // Create image with lazy loading
    const imageContainer = document.createElement('div');
    imageContainer.className = 'gallery-item-image';
    
    const image = document.createElement('img');
    image.src = data.thumbnail.placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQzhDOEJDIi8+PC9zdmc+';
    image.setAttribute('data-src', data.thumbnail.src);
    image.alt = data.title;
    image.loading = 'lazy';
    image.className = 'gallery-item-img';
    
    // Create overlay content
    const overlay = document.createElement('div');
    overlay.className = 'gallery-item-overlay';
    
    const content = document.createElement('div');
    content.className = 'gallery-item-content';
    
    const title = document.createElement('h3');
    title.className = 'gallery-item-title';
    title.textContent = data.title;
    
    const description = document.createElement('p');
    description.className = 'gallery-item-description';
    description.textContent = data.description;
    
    const category = document.createElement('span');
    category.className = 'gallery-item-category';
    category.textContent = data.category;
    
    const cta = document.createElement('span');
    cta.className = 'gallery-item-cta';
    cta.textContent = 'View Project';
    cta.setAttribute('aria-hidden', 'true');
    
    // Assemble the item
    content.appendChild(category);
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(cta);
    overlay.appendChild(content);
    imageContainer.appendChild(image);
    item.appendChild(imageContainer);
    item.appendChild(overlay);
    
    // Setup lazy loading
    this.setupLazyLoading(image);
    
    // Add accessibility attributes
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `View ${data.title} project`);
    
    // Add keyboard support
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleItemClick(item);
      }
    });
    
    // Add direct click handler to bypass any event conflicts
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleItemClick(item);
    }, true);
    
    // Add hover preloading for better performance
    item.addEventListener('mouseenter', () => {
      if (this.projectContentManager && this.projectContentManager.preloadProject) {
        this.projectContentManager.preloadProject(data.id);
      }
    });
    
    return item;
  }

  setupLazyLoading(image) {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading support
      const dataSrc = image.getAttribute('data-src');
      if (dataSrc) {
        image.src = dataSrc;
        image.removeAttribute('data-src');
      }
    } else {
      // Fallback intersection observer for lazy loading
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const dataSrc = img.getAttribute('data-src');
            if (dataSrc) {
              img.src = dataSrc;
              img.removeAttribute('data-src');
              img.classList.add('loaded');
            }
            imageObserver.unobserve(img);
          }
        });
      });
      
      imageObserver.observe(image);
    }
  }

  handleItemClick(item) {
    const projectId = item.getAttribute('data-project-id');
    
    // Add selection animation classes
    item.classList.add('selecting');
    
    // Add context dimming to other items
    const allItems = this.grid.querySelectorAll('.gallery-item');
    allItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.add('context-dimmed');
      }
    });
    
    this.dispatchEvent('gallery:item-click', { projectId });
    
    // Navigate to project immediately - no animation delay needed
    this.navigateToProject(projectId);
  }

  handleItemHover(item) {
    this.dispatchEvent('gallery:item-hover', { 
      item: item.getAttribute('data-project-id') 
    });
  }

  navigateToProject(projectId) {
    // Add loading state to clicked item
    const item = document.querySelector(`[data-project-id="${projectId}"]`);
    if (item) {
      item.classList.add('loading');
    }
    
    // Find project data to get link information
    const projectData = portfolioData.find(project => project.id === projectId);
    
    // PRIORITY 1: Use project content manager for SPA navigation
    if (this.projectContentManager) {
      this.projectContentManager.showProject(projectId, true);
      
      // Remove loading state after showing project
      setTimeout(() => {
        if (item) {
          item.classList.remove('loading');
        }
      }, 600);
      return;
    }
    
    // Navigate to project page
    if (projectData && projectData.link) {
      setTimeout(() => {
        window.location.href = projectData.link;
      }, 300);
      
    } else {
      // PRIORITY 3: Legacy project path mapping for backward compatibility
      const projectPaths = {
        'restaurant-rebrand': 'restaurant',
        'dashboard-ux-design': 'dashboard',
        'book-covers-design': 'book-covers',
        'fitness-app-design': 'fitness-app',
        'magazine-layout': 'magazine',
        'icon-system-design': 'icons'
      };
      
      const folderName = projectPaths[projectId];
      let projectUrl;
      
      if (folderName) {
        // Navigate to the project page
        projectUrl = `assets/images/projects/${folderName}/index.html`;
        
        setTimeout(() => {
          window.location.href = projectUrl;
        }, 300);
      } else {
        // Fallback: show coming soon
        
        // Remove loading state
        if (item) {
          item.classList.remove('loading');
        }
        
        // Show a temporary message
        this.showProjectComingSoon(projectId, item);
      }
    }
  }
  
  showProjectComingSoon(projectId, item) {
    // Create a temporary overlay message
    const overlay = document.createElement('div');
    overlay.className = 'project-coming-soon-overlay';
    overlay.innerHTML = `
      <div class="coming-soon-content">
        <h3>Project Coming Soon</h3>
        <p>The detailed case study for this project is being prepared.</p>
        <button class="close-overlay-btn">Close</button>
      </div>
    `;
    
    // Add styles
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    `;
    
    overlay.querySelector('.coming-soon-content').style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      max-width: 400px;
      margin: 0 1rem;
    `;
    
    overlay.querySelector('.close-overlay-btn').style.cssText = `
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: var(--color-accent-yellow);
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    
    // Close functionality
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('close-overlay-btn')) {
        document.body.removeChild(overlay);
        if (item) {
          item.classList.remove('loading');
        }
      }
    });
    
    document.body.appendChild(overlay);
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
        if (item) {
          item.classList.remove('loading');
        }
      }
    }, 3000);
  }

  setupContextDimming() {
    // Only skip cascade dimming on small mobile devices without hover capability
    const isMobile = window.innerWidth <= 480;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    const hasPointer = window.matchMedia('(pointer: fine)').matches;
    
    if (isMobile || (!hasHover && !hasPointer)) {
      return;
    }

    // JavaScript-driven cascade context dimming for smooth animations
    const galleryItems = this.grid.querySelectorAll('.gallery-item');
    
    // Remove any existing event listeners to avoid duplicates
    galleryItems.forEach(item => {
      // Store original event handlers to clean up properly
      item.onmouseenter = null;
      item.onmouseleave = null;
    });
    
    // Setup cascade dimming with staggered timing
    galleryItems.forEach((item, index) => {
      item.addEventListener('mouseenter', (e) => {
        this.handleHoverStart(item, galleryItems);
        // Also trigger mascot interaction
        this.handleItemHover(item);
      });
      
      item.addEventListener('mouseleave', (e) => {
        this.handleHoverEnd(item, galleryItems);
      });
    });
  }

  handleHoverStart(heroItem, allItems) {
    const now = Date.now();
    
    // Reduced debounce since we simplified the animation
    if (now - this.animationState.lastHoverTime < 50) {
      return;
    }
    
    // Clear any existing debounce timer
    if (this.animationState.debounceTimer) {
      clearTimeout(this.animationState.debounceTimer);
    }
    
    // If already animating the same item, ignore
    if (this.animationState.currentHero === heroItem) {
      return;
    }
    
    // Cancel all existing animations immediately
    this.cancelAllAnimations(allItems);
    
    // Minimal delay since we simplified everything
    this.animationState.debounceTimer = setTimeout(() => {
      this.cascadeContextDimming(heroItem, allItems);
      this.animationState.lastHoverTime = now;
    }, 20);
  }

  handleHoverEnd(heroItem, allItems) {
    // Clear debounce timer
    if (this.animationState.debounceTimer) {
      clearTimeout(this.animationState.debounceTimer);
    }
    
    // Immediate reset since we simplified everything
    this.resetContextDimming(allItems);
  }

  cancelAllAnimations(allItems) {
    // Clear all existing timeouts
    this.animationState.animationTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    this.animationState.animationTimeouts = [];
    
    // Immediately reset all items to base state (no animation)
    allItems.forEach(item => {
      // Remove all animation classes
      item.classList.remove('gallery-item-hero');
      item.classList.remove('gallery-item-blurred');
      
      // Remove any remaining inline styles
      item.style.removeProperty('transform');
      item.style.removeProperty('opacity');
      item.style.removeProperty('filter');
      item.style.removeProperty('border-radius');
      item.style.removeProperty('box-shadow');
      item.style.removeProperty('-webkit-box-shadow');
      item.style.removeProperty('z-index');
      item.style.removeProperty('position');
      item.style.removeProperty('transition');
      
      // Also reset images
      const img = item.querySelector('.gallery-item-img');
      if (img) {
        img.style.removeProperty('transform');
        img.style.removeProperty('border-radius');
        img.style.removeProperty('transition');
      }
      
      // Trigger reflow to ensure changes are applied
      item.offsetHeight;
    });
    
    // Reset animation state
    this.animationState.isAnimating = false;
    this.animationState.currentHero = null;
  }

  cascadeContextDimming(heroItem, allItems) {
    // Set animation state
    this.animationState.isAnimating = true;
    this.animationState.currentHero = heroItem;
    
    // Force a clean state first
    allItems.forEach(item => {
      item.classList.remove('gallery-item-hero', 'gallery-item-blurred');
    });
    
    // Use a single requestAnimationFrame to ensure all changes happen together
    requestAnimationFrame(() => {
      // Animate hero
      this.animateHeroItem(heroItem);
      
      // Blur all non-hero items
      allItems.forEach(item => {
        if (item !== heroItem) {
          this.blurNonHeroItem(item);
        }
      });
    });
  }

  blurNonHeroItem(item) {
    // Apply blur class directly - all timing handled by CSS
    item.classList.add('gallery-item-blurred');
  }

  animateHeroItem(heroItem) {
    // Apply hero class directly - all timing handled by CSS
    heroItem.classList.add('gallery-item-hero');
  }

  // Remove the old animateNonHeroItem method - replaced with simple blur

  resetContextDimming(allItems) {
    // Cancel any ongoing animations first
    this.cancelAllAnimations(allItems);
    
    // Reset all items in a single frame
    requestAnimationFrame(() => {
      allItems.forEach(item => {
        this.resetItemToNormal(item);
      });
    });
    
    // Clear state
    this.animationState.currentHero = null;
    this.animationState.isAnimating = false;
  }

  resetItemToNormal(item) {
    // Remove both classes directly - all timing handled by CSS
    item.classList.remove('gallery-item-hero', 'gallery-item-blurred');
  }

  updateObserver() {
    // Observe the last gallery item for auto-loading
    const lastItem = this.grid.querySelector('.gallery-item:last-child');
    if (lastItem && this.observer) {
      // Unobserve previous items
      this.observer.disconnect();
      this.observer.observe(lastItem);
    }
  }

  updateLoadMoreButton() {
    if (!this.loadMoreBtn) return;
    
    if (this.currentItems >= this.maxItems || this.currentItems >= portfolioData.length) {
      this.hideLoadMoreButton();
    } else {
      this.showLoadMoreButton();
      this.loadMoreBtn.textContent = `Load More Projects (${portfolioData.length - this.currentItems} remaining)`;
    }
  }

  showLoadMoreButton() {
    if (this.loadMoreBtn) {
      this.loadMoreBtn.style.display = 'block';
    }
  }

  hideLoadMoreButton() {
    if (this.loadMoreBtn) {
      this.loadMoreBtn.style.display = 'none';
    }
  }

  showError() {
    const errorElement = document.createElement('div');
    errorElement.className = 'gallery-error';
    errorElement.innerHTML = `
      <div class="error-content">
        <h3>Unable to load portfolio items</h3>
        <p>Please try refreshing the page.</p>
        <button class="error-retry-btn" onclick="window.location.reload()">
          Retry
        </button>
      </div>
    `;
    
    this.grid.appendChild(errorElement);
  }

  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  // Public API methods
  refresh() {
    this.currentItems = 0;
    this.grid.innerHTML = '';
    this.loadInitialItems();
  }

  getLoadedCount() {
    return this.currentItems;
  }

  getTotalCount() {
    return portfolioData.length;
  }

  // Cleanup
  destroy() {
    // Remove resize listener
    if (this.boundResizeHandler) {
      window.removeEventListener('resize', this.boundResizeHandler);
      this.boundResizeHandler = null;
    }
    
    // Clear resize timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }
    
    // Disconnect intersection observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // Clear animation timeouts
    if (this.animationState.animationTimeouts) {
      this.animationState.animationTimeouts.forEach(timeout => clearTimeout(timeout));
      this.animationState.animationTimeouts = [];
    }
    
    // Clear debounce timer
    if (this.animationState.debounceTimer) {
      clearTimeout(this.animationState.debounceTimer);
      this.animationState.debounceTimer = null;
    }
    
    // Reset references
    this.container = null;
    this.grid = null;
    this.loadMoreBtn = null;
    this.projectContentManager = null;
  }
}

export default GalleryController;
