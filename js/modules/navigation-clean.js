/**
 * Clean Navigation Module - Intersection Observer Impl    // Scroll tracking for active states - use document.body
    document.body.addEventListener('scroll', this.handleWindowScroll, { passive: true });
    
    // Handle window resize
    window.addEventListener('resize', this.handleResize, { passive: true });tion
 * Handles navigation active states using Intersection Observer API
 */

export class NavigationController {
  constructor() {
    this.navigationElement = null;
    this.navLinks = [];
    this.hamburgerButton = null;
    this.isMenuOpen = false;
    this.lastScrollTop = 0;
    this.scrollThreshold = 10;
    
    // Intersection Observer for active state detection
    this.sectionObserver = null;
    this.intersectingSections = new Map();
    
    // Bind methods to preserve context
    this.handleNavClick = this.handleNavClick.bind(this);
    this.handleHamburgerClick = this.handleHamburgerClick.bind(this);
    this.handleWindowScroll = this.handleWindowScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleSectionIntersection = this.handleSectionIntersection.bind(this);
  }

  init() {
    try {
      // Find navigation elements
      this.navigationElement = document.querySelector('.nav-mobile-container');
      this.mobileOverlay = document.querySelector('.nav-mobile-overlay');
      this.hamburgerButton = document.querySelector('.nav-hamburger');
      this.navLinks = Array.from(document.querySelectorAll('.nav-link, .nav-mobile-link'));

      console.log('🔍 Navigation Debug:', {
        navigationElement: this.navigationElement,
        mobileOverlay: this.mobileOverlay,
        hamburgerButton: this.hamburgerButton,
        navLinksCount: this.navLinks.length,
        mobileMenu: document.querySelector('.nav-mobile-menu'),
        backdrop: document.querySelector('.nav-backdrop')
      });

      if (!this.navigationElement || !this.mobileOverlay) {
        console.warn('Navigation elements not found');
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

    // Hamburger menu toggle
    if (this.hamburgerButton) {
      this.hamburgerButton.addEventListener('click', this.handleHamburgerClick);
    }

    // Backdrop click to close menu
    const backdrop = document.querySelector('.nav-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        this.closeMenu();
      });
    }

    // ESC key to close menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });

    // Scroll tracking for active states - use document.body since that's what works
    console.log('🔗 Adding scroll event listener to document.body...');
    document.body.addEventListener('scroll', this.handleWindowScroll, { passive: true });
    
    // Handle window resize
    window.addEventListener('resize', this.handleResize, { passive: true });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && this.mobileOverlay && !this.mobileOverlay.contains(e.target) && !this.navigationElement.contains(e.target)) {
        this.closeMenu();
      }
    });
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

    // Close mobile menu if open
    this.closeMenu();

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

  handleHamburgerClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    if (!this.mobileOverlay) return;
    
    console.log('🍔 Opening mobile menu');
    this.mobileOverlay.classList.add('open');
    this.isMenuOpen = true;
    
    // Prevent body scroll on mobile
    document.body.style.overflow = 'hidden';
  }

  closeMenu() {
    if (!this.mobileOverlay) return;
    
    console.log('🍔 Closing mobile menu');
    this.mobileOverlay.classList.remove('open');
    this.isMenuOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
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
    // Close menu on desktop resize
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMenu();
    }
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
  }

  // Public method to scroll to a section by ID
  scrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
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

      if (this.hamburgerButton) {
        this.hamburgerButton.removeEventListener('click', this.handleHamburgerClick);
      }

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
      this.navigationElement = null;
      this.navLinks = [];
      this.hamburgerButton = null;
      this.isMenuOpen = false;

      // Clear any pending timeouts
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = null;
      }

      console.log('Navigation destroyed successfully');
    } catch (error) {
      console.error('Navigation cleanup failed:', error);
    }
  }
}

// Export default instance
export default NavigationController;
