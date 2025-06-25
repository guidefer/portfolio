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
    console.log('📄 Project Content Manager initialized');
  }

  setupEventListeners() {
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isActive) {
        this.hideProject();
      }
    });
    
    // Prevent body scroll when project is active
    this.container.addEventListener('wheel', (e) => {
      e.stopPropagation();
    });
  }

  /**
   * Set navigation controller for enhanced navigation
   */
  setNavigationController(navigationController) {
    this.navigationController = navigationController;
    console.log('🔗 Navigation controller connected to project content manager');
  }

  /**
   * Show project content with enhanced loading
   */
  async showProject(projectId, useEnhancedLoading = true) {
    console.log('📄 Showing project content:', projectId);
    
    // Use enhanced loading if available
    if (useEnhancedLoading && this.navigationController) {
      console.log('🌸 Using enhanced loading for project content');
      await this.navigationController.loadingController?.startNavigation(`project:${projectId}`);
    }
    
    // Load project content
    await this.loadProjectContent(projectId);
    
    // Show the container
    this.container.classList.add('active');
    document.body.classList.add('project-active');
    this.isActive = true;
    this.currentProjectId = projectId;
    
    // Focus management
    this.backButton.focus();
    
    // Dispatch event
    this.dispatchEvent('project:show', { projectId });
    
    console.log('✅ Project content shown:', projectId);
  }

  /**
   * Hide project content
   */
  async hideProject() {
    console.log('📄 Hiding project content');
    
    // Hide the container
    this.container.classList.remove('active');
    document.body.classList.remove('project-active');
    this.isActive = false;
    this.currentProjectId = null;
    
    // Use enhanced loading for transition back
    if (this.navigationController?.loadingController) {
      console.log('🌸 Using enhanced loading for back navigation');
      await this.navigationController.loadingController.startNavigation('gallery');
    }
    
    // Clear content after animation
    setTimeout(() => {
      this.contentBody.innerHTML = '';
    }, 400);
    
    // Return focus to gallery
    const gallerySection = document.querySelector('.gallery-section');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Dispatch event
    this.dispatchEvent('project:hide');
    
    console.log('✅ Project content hidden');
  }

  /**
   * Load project content data
   */
  async loadProjectContent(projectId) {
    this.contentBody.classList.add('loading');
    
    try {
      // Get project data from portfolio config
      const { portfolioData } = await import('../config/portfolio-data.js');
      const projectData = portfolioData.find(project => project.id === projectId);
      
      if (!projectData) {
        throw new Error(`Project not found: ${projectId}`);
      }
      
      // Get other projects for mini gallery
      const otherProjects = await this.getRandomOtherProjects(projectId, 2);
      
      // Generate project content HTML
      const contentHTML = this.generateProjectHTMLWithData(projectData, otherProjects);
      
      // Add small delay for better UX
      await this.delay(300);
      
      // Insert content
      this.contentBody.innerHTML = contentHTML;
      
      // Setup interactions for mini gallery
      this.setupMiniGalleryInteractions();
      
      // Setup lazy loading for images
      this.setupImageLazyLoading();
      
    } catch (error) {
      console.error('Failed to load project content:', error);
      this.contentBody.innerHTML = this.generateErrorHTML(projectId);
    } finally {
      this.contentBody.classList.remove('loading');
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
          <button class="related-project-link back-to-gallery-btn liquid-morph accent-shadow" onclick="window.projectContentManager?.hideProject()">
            ← Back to All Projects
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
        <button onclick="window.projectContentManager?.hideProject()" class="error-back-btn liquid-morph accent-shadow">
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
      console.error('Failed to get other projects:', error);
      return [];
    }
  }

  /**
   * Generate mini gallery item HTML using the same structure as main gallery
   */
  generateMiniGalleryItem(projectData) {
    return `
      <div class="gallery-item mini-gallery-item" 
           data-project-id="${projectData.id}"
           role="button"
           tabindex="0"
           aria-label="View ${projectData.title} project">
        <div class="gallery-item-wrapper">
          <div class="gallery-image-container">
            <img src="${projectData.thumbnail.src}" 
                 alt="${projectData.title}"
                 class="gallery-image"
                 loading="lazy">
          </div>
          
          <div class="gallery-item-overlay">
            <div class="gallery-item-content">
              <h3 class="gallery-item-title">${projectData.title}</h3>
              <p class="gallery-item-description">${projectData.category} • ${projectData.year}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Setup mini gallery interactions with liquid animations
   */
  setupMiniGalleryInteractions() {
    const miniGalleryItems = this.contentBody.querySelectorAll('.mini-gallery-item');
    
    miniGalleryItems.forEach(item => {
      const projectId = item.dataset.projectId;
      
      // Click handler
      item.addEventListener('click', () => {
        this.handleMiniGalleryClick(projectId, item);
      });
      
      // Keyboard support
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleMiniGalleryClick(projectId, item);
        }
      });
      
      // Use the same hover effects as main gallery
      item.addEventListener('mouseenter', () => {
        this.addGalleryHoverEffect(item);
      });
      
      item.addEventListener('mouseleave', () => {
        this.removeGalleryHoverEffect(item);
      });
    });
    
    console.log('🎨 Mini gallery interactions setup complete');
  }

  /**
   * Handle mini gallery item click
   */
  async handleMiniGalleryClick(projectId, item) {
    console.log('🖱️ Mini gallery item clicked:', projectId);
    
    // Add selection animation
    item.classList.add('selecting');
    
    // Dim other items
    const allMiniItems = this.contentBody.querySelectorAll('.mini-gallery-item');
    allMiniItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.add('context-dimmed');
      }
    });
    
    // Wait for animation, then navigate to the new project
    setTimeout(() => {
      this.showProject(projectId, true);
    }, 600);
  }

  /**
   * Add gallery hover effect (same as main gallery)
   */
  addGalleryHoverEffect(item) {
    const overlay = item.querySelector('.gallery-item-overlay');
    const image = item.querySelector('.gallery-image');
    
    // Apply the same transforms as main gallery
    item.style.transform = 'translateY(-8px) scale(1.02)';
    item.style.boxShadow = '0 20px 40px rgba(235, 197, 51, 0.3), 0 8px 16px rgba(214, 100, 34, 0.2)';
    
    if (overlay) {
      overlay.style.opacity = '1';
    }
    
    if (image) {
      image.style.transform = 'scale(1.1)';
    }
    
    // Blur non-hovered items
    const allMiniItems = this.contentBody.querySelectorAll('.mini-gallery-item');
    allMiniItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.add('gallery-blur');
      }
    });
  }

  /**
   * Remove gallery hover effect (same as main gallery)
   */
  removeGalleryHoverEffect(item) {
    const overlay = item.querySelector('.gallery-item-overlay');
    const image = item.querySelector('.gallery-image');
    
    // Reset transforms
    item.style.transform = '';
    item.style.boxShadow = '';
    
    if (overlay) {
      overlay.style.opacity = '';
    }
    
    if (image) {
      image.style.transform = '';
    }
    
    // Remove blur from all items
    const allMiniItems = this.contentBody.querySelectorAll('.mini-gallery-item');
    allMiniItems.forEach(otherItem => {
      otherItem.classList.remove('gallery-blur');
    });
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
}

export default ProjectContentManager;
