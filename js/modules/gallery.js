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
    this.navigationController = null; // Add navigation controller reference
    this.projectContentManager = null; // Add project content manager reference
    
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
   * Connect the navigation controller for enhanced navigation
   */
  setNavigationController(navigationController) {
    this.navigationController = navigationController;
    console.log('🔗 Navigation controller connected to gallery:', !!navigationController);
  }

  /**
   * Connect the project content manager for SPA navigation
   */
  setProjectContentManager(projectContentManager) {
    this.projectContentManager = projectContentManager;
    console.log('🔗 Project content manager connected to gallery:', !!projectContentManager);
  }

  init() {
    console.log('🖼️ Gallery initializing...');
    
    this.container = document.querySelector('.gallery-section');
    this.grid = document.querySelector('.gallery-grid');
    this.loadMoreBtn = document.getElementById('load-more-btn');
    
    if (!this.container || !this.grid) {
      console.warn('Gallery elements not found');
      return;
    }
    
    console.log('📊 Portfolio data loaded:', portfolioData.length, 'items');
    
    this.setupIntersectionObserver();
    this.bindEvents();
    this.loadInitialItems();
    
    console.log('✅ Gallery initialized successfully');
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
    console.log('🔗 Binding gallery events...');
    
    // Load more button click
    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', () => {
        this.loadMoreItems();
        this.dispatchEvent('gallery:load-more');
      });
    }
    
    // Handle hover events for mascot interaction only
    this.grid.addEventListener('mouseenter', (e) => {
      const galleryItem = e.target.closest('.gallery-item');
      if (galleryItem) {
        this.handleItemHover(galleryItem);
      }
    }, true);
    
    console.log('✅ Gallery events bound successfully');
  }

  async loadInitialItems() {
    this.isLoading = true;
    
    try {
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
      console.error('Failed to load initial gallery items:', error);
      this.showError();
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
      console.error('Failed to load more gallery items:', error);
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
    
    // Create loading overlay for selection animation
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'gallery-item-loading';
    loadingOverlay.innerHTML = '<div class="gallery-item-loading-spinner"></div>';
    
    // Assemble the item
    content.appendChild(category);
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(cta);
    overlay.appendChild(content);
    imageContainer.appendChild(image);
    item.appendChild(imageContainer);
    item.appendChild(overlay);
    item.appendChild(loadingOverlay);
    
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
      console.log('🖱️ Direct click on gallery item:', data.id);
      e.preventDefault();
      e.stopPropagation();
      this.handleItemClick(item);
    }, true);
    
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
    
    console.log('🖱️ Gallery item clicked:', projectId);
    
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
    
    // Navigate to project page after animation
    setTimeout(() => {
      this.navigateToProject(projectId);
    }, 600); // Allow animation to play
  }

  handleItemHover(item) {
    this.dispatchEvent('gallery:item-hover', { 
      item: item.getAttribute('data-project-id') 
    });
  }

  navigateToProject(projectId) {
    console.log(`🚀 Navigating to project: ${projectId}`);
    console.log('📊 Navigation controller available:', !!this.navigationController);
    console.log('📊 Project content manager available:', !!this.projectContentManager);
    console.log('📊 Enhanced navigation ready:', this.navigationController?.isEnhancedNavigationReady());
    
    // Add loading state to clicked item
    const item = document.querySelector(`[data-project-id="${projectId}"]`);
    if (item) {
      item.classList.add('loading');
    }
    
    // Find project data to get link information
    const projectData = portfolioData.find(project => project.id === projectId);
    console.log('📊 Project data found:', !!projectData, projectData?.link);
    
    // PRIORITY 1: Use project content manager for SPA navigation
    if (this.projectContentManager) {
      console.log('🌸 Using SPA project content manager for:', projectId);
      this.projectContentManager.showProject(projectId, true);
      
      // Remove loading state after showing project
      setTimeout(() => {
        if (item) {
          item.classList.remove('loading');
        }
      }, 600);
      return;
    }
    
    // PRIORITY 2: Use enhanced navigation if available (fallback to external pages)
    if (projectData && projectData.link) {
      if (this.navigationController && this.navigationController.isEnhancedNavigationReady()) {
        console.log('🌸 Using enhanced navigation for project:', projectData.link);
        this.navigationController.navigateToPage(projectData.link, true);
        return;
      }
      
      // Fallback to regular navigation
      console.log('📍 Using regular navigation for project:', projectData.link);
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
        
        // Use enhanced navigation if available
        if (this.navigationController && this.navigationController.isEnhancedNavigationReady()) {
          console.log('🌸 Using enhanced navigation for legacy project:', projectUrl);
          this.navigationController.navigateToPage(projectUrl, true);
          return;
        }
        
        // Fallback to regular navigation
        console.log('📍 Using regular navigation for legacy project:', projectUrl);
        setTimeout(() => {
          window.location.href = projectUrl;
        }, 300);
      } else {
        // Fallback: show coming soon
        console.warn(`Project page not found for: ${projectId}`);
        
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
    // Skip cascade dimming on mobile devices
    if (window.innerWidth <= 768) {
      console.log('📱 Mobile detected - skipping context dimming');
      return;
    }

    console.log('🎭 Setting up cascade context dimming...');

    // JavaScript-driven cascade context dimming for smooth animations
    const galleryItems = this.grid.querySelectorAll('.gallery-item');
    console.log('🖼️ Found', galleryItems.length, 'gallery items for cascade dimming');
    
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
      });
      
      item.addEventListener('mouseleave', (e) => {
        this.handleHoverEnd(item, galleryItems);
      });
    });

    console.log('✅ Context dimming cascade setup complete');
  }

  handleHoverStart(heroItem, allItems) {
    const now = Date.now();
    
    // Reduced debounce since we simplified the animation
    if (now - this.animationState.lastHoverTime < 50) {
      console.log('⏭️ Hover too rapid, skipping');
      return;
    }
    
    // Clear any existing debounce timer
    if (this.animationState.debounceTimer) {
      clearTimeout(this.animationState.debounceTimer);
    }
    
    // If already animating the same item, ignore
    if (this.animationState.currentHero === heroItem) {
      console.log('🔄 Same hero item, ignoring');
      return;
    }
    
    console.log('🎯 Hover start - cleaning previous state');
    
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
    console.log('👋 Hover end - resetting state');
    this.resetContextDimming(allItems);
  }

  cancelAllAnimations(allItems) {
    console.log('� Cancelling all animations');
    
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
    console.log('🚀 Starting simplified blur effect');
    
    // Set animation state
    this.animationState.isAnimating = true;
    this.animationState.currentHero = heroItem;
    
    // Animate hero immediately
    this.animateHeroItem(heroItem);
    
    // Apply blur to all non-hero items immediately (no cascade)
    allItems.forEach(item => {
      if (item !== heroItem) {
        this.blurNonHeroItem(item);
      }
    });
    
    console.log('✅ Hero scaled and non-hero items blurred');
  }

  blurNonHeroItem(item) {
    console.log('🌫️ Adding blur to non-hero item');
    item.classList.add('gallery-item-blurred');
  }

  animateHeroItem(heroItem) {
    console.log('💫 Adding hero class for smooth CSS transition');
    
    // Use CSS class for smooth animation
    heroItem.classList.add('gallery-item-hero');
  }

  // Remove the old animateNonHeroItem method - replaced with simple blur

  resetContextDimming(allItems) {
    console.log('🔄 Resetting simplified blur effect');
    
    // Cancel any ongoing animations first
    this.cancelAllAnimations(allItems);
    
    // Reset all items immediately (no cascade)
    allItems.forEach(item => {
      this.resetItemToNormal(item);
    });
    
    // Clear state
    this.animationState.currentHero = null;
    this.animationState.isAnimating = false;
    
    console.log('✅ All items reset');
  }

  resetItemToNormal(item) {
    console.log('📈 Removing animation classes for clean reset');
    
    // Remove both animation classes
    item.classList.remove('gallery-item-hero');
    item.classList.remove('gallery-item-blurred');
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
    if (this.observer) {
      this.observer.disconnect();
    }
    
    console.log('🖼️ Gallery destroyed');
  }
}

export default GalleryController;
