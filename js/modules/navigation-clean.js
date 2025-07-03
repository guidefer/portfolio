/**
 * Clean Navigation Module - Intersection Observer Implementation
 * Handles navigation active states using Intersection Observer API
 */

export class NavigationController {
  constructor() {
    this.navLinks = [];
    this.lastScrollTop = 0;
    this.scrollThreshold = 10;
    
    // Intersection Observer for active state detection
    this.sectionObserver = null;
    this.intersectingSections = new Map();
    
    // Callback for external sync (e.g., bottom navigation)
    this.onActiveStateChange = null;
    
    // Manual navigation state - prevents observer conflicts
    this.isManualNavigation = false;
    this.manualNavigationTimeout = null;
    
    // Bind methods to preserve context
    this.handleNavClick = this.handleNavClick.bind(this);
    this.handleWindowScroll = this.handleWindowScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleResize.bind(this);
    this.handleSectionIntersection = this.handleSectionIntersection.bind(this);
  }

  init() {
    try {
      // Find navigation elements - only desktop nav links now
      this.navLinks = Array.from(document.querySelectorAll('.nav-link'));

      if (this.navLinks.length === 0) {
        console.warn('No navigation links found');
        return;
      }

      // Set up event listeners
      this.setupEventListeners();
      
      // Set up Intersection Observer for active state detection
      this.setupSectionObserver();
    } catch (error) {
      console.error('Navigation initialization failed:', error);
    }
  }

  setupEventListeners() {
    // Navigation link clicks
    this.navLinks.forEach(link => {
      link.addEventListener('click', this.handleNavClick);
    });

    // Scroll tracking for active states
    document.body.addEventListener('scroll', this.handleWindowScroll, { passive: true });
    
    // Handle window resize
    window.addEventListener('resize', this.handleResize, { passive: true });
  }

  setupSectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '-70px 0px 0px 0px',
      threshold: [0.1, 0.3, 0.5]
    };

    this.sectionObserver = new IntersectionObserver(this.handleSectionIntersection, observerOptions);

    const sections = ['#projects', '#about', '#contact'];
    sections.forEach(sectionId => {
      const sectionElement = document.querySelector(sectionId);
      if (sectionElement) {
        this.sectionObserver.observe(sectionElement);
      }
    });
  }

  handleSectionIntersection(entries) {
    // Skip intersection updates during manual navigation
    if (this.isManualNavigation) {
      return;
    }
    
    entries.forEach(entry => {
      const sectionId = `#${entry.target.id}`;
      const intersectionRatio = entry.intersectionRatio;
      
      let threshold = sectionId === '#contact' ? 0.1 : 0.3;
      
      if (entry.isIntersecting && intersectionRatio >= threshold) {
        this.intersectingSections.set(sectionId, intersectionRatio);
      } else if (!entry.isIntersecting || intersectionRatio < threshold) {
        this.intersectingSections.delete(sectionId);
      }
    });

    this.updateActiveStateFromIntersections();
  }

  updateActiveStateFromIntersections() {
    if (this.intersectingSections.size === 0) {
      this.setActiveLink(null);
      return;
    }

    let maxRatio = 0;
    let mostVisibleSection = null;
    
    for (const [sectionId, ratio] of this.intersectingSections) {
      if (ratio > maxRatio) {
        maxRatio = ratio;
        mostVisibleSection = sectionId;
      }
    }

    if (mostVisibleSection) {
      const activeLink = this.navLinks.find(link => 
        link.getAttribute('href') === mostVisibleSection
      );
      
      if (activeLink) {
        this.setActiveLink(activeLink);
      }
    }
  }

  // Legacy method - compatibility only
  updateActiveState() {
    // Active state detection handled by Intersection Observer
  }

  handleNavClick(e) {
    e.preventDefault();
    
    const link = e.currentTarget;
    const targetId = link.getAttribute('href');
    
    if (!targetId || !targetId.startsWith('#')) {
      console.warn('Invalid navigation target:', targetId);
      return;
    }

    // Find target element
    const targetElement = document.querySelector(targetId);
    
    if (!targetElement) {
      console.warn('Navigation target not found:', targetId);
      return;
    }

    // Set manual navigation flag to prevent observer conflicts
    this.setManualNavigationMode(true);

    // Smooth scroll to target
    this.scrollToElement(targetElement);

    // Update active state immediately for better UX
    this.setActiveLink(link);
  }

  scrollToElement(element) {
    try {
      // Simple, reliable scrolling with CSS handling positioning
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } catch (error) {
      console.error('Scroll error:', error);
      // Fallback to instant scroll
      element.scrollIntoView();
    }
  }

  handleWindowScroll() {
    const scrollTop = document.body.scrollTop;
    const scrollDiff = Math.abs(scrollTop - this.lastScrollTop);
    
    if (scrollDiff < this.scrollThreshold) {
      return;
    }
    
    this.lastScrollTop = scrollTop;
  }

  handleResize() {
    // Handle any resize-specific logic for desktop navigation
  }

  updateActiveState() {
    if (this.navLinks.length === 0) return;

    // TODO: Implement simple active state detection from scratch
    console.log('� Active state detection - to be implemented');
  }

  setActiveLink(activeLink) {
    // Remove active class from all links
    this.navLinks.forEach(link => {
      link.classList.remove('active', 'nav-link-active');
    });

    // Add active class to the target link
    if (activeLink) {
      activeLink.classList.add('active', 'nav-link-active');
    }
    
    // Notify external listeners (e.g., bottom navigation)
    if (this.onActiveStateChange && activeLink) {
      const sectionId = activeLink.getAttribute('href')?.substring(1); // Remove # from href
      if (sectionId) {
        this.onActiveStateChange(sectionId);
      }
    }
  }

  // Method to set external active state change callback
  setActiveStateChangeCallback(callback) {
    this.onActiveStateChange = callback;
  }

  // Manual navigation mode control - prevents intersection observer conflicts
  setManualNavigationMode(enabled) {
    this.isManualNavigation = enabled;
    
    // Clear any existing timeout
    if (this.manualNavigationTimeout) {
      clearTimeout(this.manualNavigationTimeout);
    }
    
    if (enabled) {
      // Re-enable intersection observer after scroll completes
      // Smooth scroll typically takes 500-800ms, so we wait 1200ms to be safe
      this.manualNavigationTimeout = setTimeout(() => {
        this.isManualNavigation = false;
        this.manualNavigationTimeout = null;
      }, 1200);
    }
  }

  // Public method to scroll to a section by ID
  scrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      // Set manual navigation mode for external calls too
      this.setManualNavigationMode(true);
      
      this.scrollToElement(targetElement);
      
      // Update active state for the corresponding link
      const correspondingLink = this.navLinks.find(link => 
        link.getAttribute('href') === `#${sectionId}`
      );
      if (correspondingLink) {
        this.setActiveLink(correspondingLink);
      }
    }
  }

  // Cleanup method
  destroy() {
    try {
      // Remove event listeners
      this.navLinks.forEach(link => {
        link.removeEventListener('click', this.handleNavClick);
      });

      // Remove scroll listeners
      document.body.removeEventListener('scroll', this.handleWindowScroll);
      window.removeEventListener('resize', this.handleResize);

      // Disconnect Intersection Observer
      if (this.sectionObserver) {
        this.sectionObserver.disconnect();
        this.sectionObserver = null;
      }

      // Clear intersecting sections
      this.intersectingSections.clear();

      // Clear references
      this.navLinks = [];

      // Clear any pending timeouts
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = null;
      }
      
      if (this.manualNavigationTimeout) {
        clearTimeout(this.manualNavigationTimeout);
        this.manualNavigationTimeout = null;
      }

      console.log('Navigation destroyed successfully');
    } catch (error) {
      console.error('Navigation cleanup failed:', error);
    }
  }
}

// Export default instance
export default NavigationController;
