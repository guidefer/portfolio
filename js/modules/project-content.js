/**
 * Project Content Manager
 * Handles dynamic loading of project content in SPA mode
 */

class ProjectContentManager {
  constructor() {
    this.container = null;
    this.contentBody = null;
    this.isActive = false;
    this.currentProjectId = null;
    this.navigationController = null;
    
    // Preloading system
    this.preloadedContent = new Map(); // Cache for preloaded project content
    this.isPreloading = false;
    
    // Event listener references for cleanup
    this.boundHandlers = {
      keydown: null,
      wheel: null
    };
    this.miniGalleryListeners = new WeakMap(); // Store listeners for mini gallery items
    
    this.init();
  }

  init() {
    this.container = document.getElementById('project-content');
    this.contentBody = document.getElementById('project-content-body');
    
    if (!this.container || !this.contentBody) {
      console.warn('Project content elements not found');
      return;
    }
    
    this.setupEventListeners();
    
    // Start background preloading after initialization
    this.startBackgroundPreloading();
  }

  setupEventListeners() {
    // Escape key to close - store bound reference
    this.boundHandlers.keydown = (e) => {
      if (e.key === 'Escape' && this.isActive) {
        this.hideProject();
      }
    };
    document.addEventListener('keydown', this.boundHandlers.keydown);
    
    // Prevent body scroll when project is active - store bound reference
    this.boundHandlers.wheel = (e) => {
      e.stopPropagation();
    };
    this.container.addEventListener('wheel', this.boundHandlers.wheel);
  }

  /**
   * Set navigation controller for enhanced navigation
   */
  setNavigationController(navigationController) {
    this.navigationController = navigationController;
  }

  /**
   * Show project content
   */
  async showProject(projectId) {
    // Load project content
    await this.loadProjectContent(projectId);
    
    // Show the container
    this.container.classList.add('active');
    document.body.classList.add('project-active');
    this.isActive = true;
    this.currentProjectId = projectId;
    
    // Focus management - focus the container for keyboard accessibility
    // Focus on the container for accessibility
    this.container.focus();
    
    // Dispatch event
    this.dispatchEvent('project:show', { projectId });
  }

  /**
   * Hide project content
   */
  async hideProject() {
    // Hide the container
    this.container.classList.remove('active');
    document.body.classList.remove('project-active');
    this.isActive = false;
    this.currentProjectId = null;
    
    // Clear content after animation
    setTimeout(() => {
      this.contentBody.innerHTML = '';
    }, 400);
    
    // Return focus to gallery
    const projectsSection = document.querySelector('#projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const gallerySection = document.querySelector('.gallery-section');
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    
    // Dispatch event
    this.dispatchEvent('project:hide');
  }

  /**
   * Load project content data
   */
  async loadProjectContent(projectId) {
    this.contentBody.classList.add('loading');
    
    try {
      // Check if content is already preloaded
      if (this.preloadedContent.has(projectId)) {
        const cachedContent = this.preloadedContent.get(projectId);
        this.contentBody.innerHTML = cachedContent;
        
        // Setup interactions for mini gallery
        this.setupMiniGalleryInteractions();
        
        // Setup lazy loading for images
        this.setupImageLazyLoading();
        
        // Smooth animated scroll to top
        requestAnimationFrame(() => {
          this.smoothScrollToTop();
        });
        
        return;
      }
      
      // Generate content if not preloaded
      const contentHTML = await this.generateProjectContent(projectId);
      this.contentBody.innerHTML = contentHTML;
      
      // Setup interactions for mini gallery
      this.setupMiniGalleryInteractions();
      
      // Setup lazy loading for images
      this.setupImageLazyLoading();
      
      // Smooth animated scroll to top after content is fully loaded
      requestAnimationFrame(() => {
        this.smoothScrollToTop();
      });
      
    } catch (error) {
      this.contentBody.innerHTML = this.generateErrorHTML(projectId);
    } finally {
      this.contentBody.classList.remove('loading');
    }
  }

  /**
   * Generate project content (extracted for reuse in preloading)
   */
  async generateProjectContent(projectId) {
    // Get project data from portfolio config
    const { portfolioData } = await import('../config/portfolio-data.js');
    const projectData = portfolioData.find(project => project.id === projectId);
    
    if (!projectData) {
      throw new Error(`Project not found: ${projectId}`);
    }
    
    // Get other projects for mini gallery
    const otherProjects = await this.getRandomOtherProjects(projectId, 2);
    
    // Generate project content HTML
    return this.generateProjectHTMLWithData(projectData, otherProjects);
  }

  /**
   * Background preloading system
   */
  async startBackgroundPreloading() {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    
    try {
      // Get all project IDs
      const { portfolioData } = await import('../config/portfolio-data.js');
      const projectIds = portfolioData.map(project => project.id);
      
      // Preload projects one by one with small delays to avoid blocking
      for (const projectId of projectIds) {
        if (!this.preloadedContent.has(projectId)) {
          try {
            const contentHTML = await this.generateProjectContent(projectId);
            this.preloadedContent.set(projectId, contentHTML);
            
            // Small delay between preloads to avoid blocking the main thread
            await this.delay(100);
          } catch (error) {
            // Handle preload errors silently
          }
        }
      }
      
    } catch (error) {
      // Handle background preloading errors silently
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Public method to preload specific project (for hover preloading)
   */
  async preloadProject(projectId) {
    if (this.preloadedContent.has(projectId)) {
      return; // Already preloaded
    }
    
    try {
      const contentHTML = await this.generateProjectContent(projectId);
      this.preloadedContent.set(projectId, contentHTML);
    } catch (error) {
      // Handle preload errors silently
    }
  }

  /**
   * Generate HTML for project content with data
   */
  generateProjectHTMLWithData(projectData, otherProjects) {
    return `
      <article class="project-article">
        <!-- Clean Hero Image -->
        <div class="project-hero">
          <img src="${projectData.thumbnail.src}" 
               alt="${projectData.title} - Hero image"
               class="project-hero-image">
        </div>

        <!-- Project Content Body -->
        <div class="project-content-section">
          <!-- Subtle Back Button -->
          <div class="project-back-header">
            <button class="project-back-btn" onclick="window.goBackToGallery()">
              ← back
            </button>
          </div>
          <header class="project-header-content">
            <div class="project-category-badge">
              <span class="project-category">${projectData.category}</span>
            </div>
            <h1 class="project-title">${projectData.title}</h1>
            <div class="project-meta">
              <span class="project-year">${projectData.year}</span>
              <span class="project-client">${projectData.client}</span>
            </div>
          </header>
          
          <div class="project-description">
            <p class="project-description-main">${projectData.description}</p>
            <p>This project showcases ${projectData.category.toLowerCase()} work, demonstrating creative excellence and attention to detail. The design process involved extensive research, conceptualization, and iterative refinement to achieve the final result.</p>
          </div>
          
          <div class="project-tags">
            ${projectData.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
          </div>
          
          <div class="project-process-gallery">
            <h2>Design Process</h2>
            <div class="process-images">
              <div class="process-image-container">
                <img src="assets/images/projects/placeholder-1.svg" 
                     alt="${projectData.title} - Process image 1"
                     class="process-image"
                     loading="lazy">
              </div>
              
              <div class="process-image-container">
                <img src="assets/images/projects/placeholder-2.svg" 
                     alt="${projectData.title} - Process image 2"
                     class="process-image"
                     loading="lazy">
              </div>
            </div>
          </div>
          
          <div class="project-process-steps">
            <div class="process-steps">
              <div class="process-step">
                <h3>Research & Discovery</h3>
                <p>Understanding the client's needs, target audience, and market positioning to inform the design direction.</p>
              </div>
              <div class="process-step">
                <h3>Concept Development</h3>
                <p>Exploring various creative directions and developing initial concepts that align with project objectives.</p>
              </div>
              <div class="process-step">
                <h3>Design Refinement</h3>
                <p>Iterating on the chosen concept, refining details, and ensuring consistency across all touchpoints.</p>
              </div>
              <div class="process-step">
                <h3>Final Execution</h3>
                <p>Delivering polished design assets and ensuring successful implementation across all media.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mini Gallery Section -->
        <div class="project-mini-gallery-section">
          <h2 class="mini-gallery-title">EXPLORE NEXT</h2>
          <div class="gallery-grid mini-gallery-grid" id="project-mini-gallery">
            ${otherProjects.map(project => this.generateMiniGalleryItem(project)).join('')}
          </div>
        </div>
        
        <div class="project-back-section">
          <button class="related-project-link back-to-gallery-btn liquid-morph accent-shadow" onclick="window.goBackToGallery()">
            <span>← Back to All Projects</span>
          </button>
        </div>
      </article>
    `;
  }

  /**
   * Generate error HTML
   */
  generateErrorHTML(projectId) {
    return `
      <div class="project-error">
        <h1>Project Not Found</h1>
        <p>Sorry, we couldn't load the project "${projectId}". Please try again or go back to the gallery.</p>
        <button onclick="window.goBackToGallery()" class="error-back-btn liquid-morph accent-shadow">
          Back to Gallery
        </button>
      </div>
    `;
  }

  /**
   * Setup lazy loading for project images
   */
  setupImageLazyLoading() {
    const images = this.contentBody.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    }
  }

  /**
   * Get random other projects (excluding current project)
   */
  async getRandomOtherProjects(currentProjectId, count = 2) {
    try {
      const { portfolioData } = await import('../config/portfolio-data.js');
      const otherProjects = portfolioData.filter(project => project.id !== currentProjectId);
      
      // Shuffle and take the requested count
      const shuffled = otherProjects.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate mini gallery item HTML using the same structure as main gallery
   */
  generateMiniGalleryItem(projectData) {
    return `
      <div class="mini-gallery-item" 
           data-project-id="${projectData.id}"
           role="button"
           tabindex="0"
           aria-label="View ${projectData.title} project">
        <div class="mini-gallery-item-wrapper">
          <div class="mini-gallery-image-container">
            <img src="${projectData.thumbnail.src}" 
                 alt="${projectData.title}"
                 class="mini-gallery-image"
                 loading="lazy">
          </div>
          
          <div class="mini-gallery-item-overlay">
            <div class="mini-gallery-item-content">
              <h3 class="mini-gallery-item-title">${projectData.title}</h3>
              <p class="mini-gallery-item-description">${projectData.category} • ${projectData.year}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Clean up existing mini gallery listeners
   */
  cleanupMiniGalleryListeners() {
    if (this.contentBody) {
      const miniGalleryItems = this.contentBody.querySelectorAll('.mini-gallery-item');
      miniGalleryItems.forEach(item => {
        const handlers = this.miniGalleryListeners.get(item);
        if (handlers) {
          item.removeEventListener('click', handlers.click);
          item.removeEventListener('keydown', handlers.keydown);
          item.removeEventListener('mouseenter', handlers.mouseenter);
          item.removeEventListener('mouseleave', handlers.mouseleave);
          this.miniGalleryListeners.delete(item);
        }
      });
    }
  }

  /**
   * Setup mini gallery interactions with liquid animations
   */
  setupMiniGalleryInteractions() {
    // Clean up existing listeners first
    this.cleanupMiniGalleryListeners();
    
    const miniGalleryItems = this.contentBody.querySelectorAll('.mini-gallery-item');
    
    miniGalleryItems.forEach(item => {
      const projectId = item.dataset.projectId;
      
      // Create bound handlers for this item
      const handlers = {
        click: () => {
          this.handleMiniGalleryClick(projectId, item);
        },
        keydown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleMiniGalleryClick(projectId, item);
          }
        },
        mouseenter: () => {
          this.addMiniGalleryHoverEffect(item);
          // Preload project content on hover for instant navigation
          if (projectId && this.preloadProject) {
            this.preloadProject(projectId);
          }
        },
        mouseleave: () => {
          this.removeMiniGalleryHoverEffect(item);
        }
      };
      
      // Store handlers for cleanup
      this.miniGalleryListeners.set(item, handlers);
      
      // Add event listeners
      item.addEventListener('click', handlers.click);
      item.addEventListener('keydown', handlers.keydown);
      item.addEventListener('mouseenter', handlers.mouseenter);
      item.addEventListener('mouseleave', handlers.mouseleave);
    });
  }

  /**
   * Handle mini gallery item click
   */
  async handleMiniGalleryClick(projectId, item) {
    // Add selection animation
    item.classList.add('selecting');
    
    // Dim other items
    // const allMiniItems = this.contentBody.querySelectorAll('.mini-gallery-item');
    // allMiniItems.forEach(otherItem => {
    //   if (otherItem !== item) {
    //     otherItem.classList.add('context-dimmed');
    //   }
    // });
    
    // Navigate to the new project immediately - no animation delay needed
    await this.showProject(projectId);
  }

  /**
   * Add enhanced mini gallery hover effect
   */
  addMiniGalleryHoverEffect(item) {
    // Add hero class for enhanced styling
    item.classList.add('mini-gallery-hero');
    
    // Blur non-hovered items for focus effect
    const allMiniItems = this.contentBody.querySelectorAll('.mini-gallery-item');
    allMiniItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.add('mini-gallery-blur');
      }
    });
  }

  /**
   * Remove enhanced mini gallery hover effect
   */
  removeMiniGalleryHoverEffect(item) {
    // Remove hero class
    item.classList.remove('mini-gallery-hero');
    
    // Remove blur from all items
    const allMiniItems = this.contentBody.querySelectorAll('.mini-gallery-item');
    allMiniItems.forEach(otherItem => {
      otherItem.classList.remove('mini-gallery-blur');
    });
  }

  /**
   * Custom smooth scroll to top with enhanced animation
   */
  smoothScrollToTop() {
    const startPosition = this.container.scrollTop;
    const distance = startPosition;
    const duration = Math.min(800, Math.max(400, distance * 0.8)); // Dynamic duration based on distance
    let startTime = null;

    // Easing function for smooth animation
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animateScroll = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      const currentPosition = startPosition - (distance * easedProgress);
      this.container.scrollTop = currentPosition;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // Ensure we're exactly at the top
        this.container.scrollTop = 0;
      }
    };

    requestAnimationFrame(animateScroll);
  }

  /**
   * Utility methods
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  /**
   * Public API
   */
  isProjectActive() {
    return this.isActive;
  }

  getCurrentProject() {
    return this.currentProjectId;
  }

  /**
   * Cleanup and destroy
   * Removes all event listeners and clears references
   */
  destroy() {
    // Remove document-level event listeners
    if (this.boundHandlers.keydown) {
      document.removeEventListener('keydown', this.boundHandlers.keydown);
      this.boundHandlers.keydown = null;
    }
    
    // Remove container event listeners
    if (this.container && this.boundHandlers.wheel) {
      this.container.removeEventListener('wheel', this.boundHandlers.wheel);
      this.boundHandlers.wheel = null;
    }
    
    // Remove mini gallery event listeners
    if (this.contentBody) {
      const miniGalleryItems = this.contentBody.querySelectorAll('.mini-gallery-item');
      miniGalleryItems.forEach(item => {
        const handlers = this.miniGalleryListeners.get(item);
        if (handlers) {
          item.removeEventListener('click', handlers.click);
          item.removeEventListener('keydown', handlers.keydown);
          item.removeEventListener('mouseenter', handlers.mouseenter);
          item.removeEventListener('mouseleave', handlers.mouseleave);
          this.miniGalleryListeners.delete(item);
        }
      });
    }
    
    // Clear caches and references
    this.preloadedContent.clear();
    this.navigationController = null;
    this.container = null;
    this.contentBody = null;
    this.currentProjectId = null;
    this.isActive = false;
    this.isPreloading = false;
  }
}

export default ProjectContentManager;
