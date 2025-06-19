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
    
    this.init();
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
    
    // SIMPLIFIED GALLERY CLICK HANDLING - Direct attachment to each item
    // This will be called after items are created
    
    // Handle hover events for mascot interaction
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
    item.className = 'gallery-item force-no-focus';
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
    
    this.dispatchEvent('gallery:item-click', { projectId });
    
    // Navigate to project page
    this.navigateToProject(projectId);
  }

  handleItemHover(item) {
    this.dispatchEvent('gallery:item-hover', { 
      item: item.getAttribute('data-project-id') 
    });
  }

  navigateToProject(projectId) {
    console.log(`🚀 Navigating to project: ${projectId}`);
    
    // Add loading state to clicked item
    const item = document.querySelector(`[data-project-id="${projectId}"]`);
    if (item) {
      item.classList.add('loading');
    }
    
    // Create the project page URL based on the project ID
    let projectUrl;
    
    // Map project IDs to their corresponding folder paths
    const projectPaths = {
      'restaurant-rebrand': 'restaurant',
      'dashboard-ux-design': 'dashboard',
      'book-covers-design': 'book-covers',
      'fitness-app-design': 'fitness-app',
      'magazine-layout': 'magazine',
      'icon-system-design': 'icons'
    };
    
    const folderName = projectPaths[projectId];
    
    if (folderName) {
      // Navigate to the project page
      projectUrl = `assets/images/projects/${folderName}/index.html`;
      
      // Add a small delay for UX
      setTimeout(() => {
        window.location.href = projectUrl;
      }, 300);
    } else {
      // Fallback: scroll to project section or show coming soon
      console.warn(`Project page not found for: ${projectId}`);
      
      // Remove loading state
      if (item) {
        item.classList.remove('loading');
      }
      
      // Show a temporary message
      this.showProjectComingSoon(projectId, item);
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
