/**
 * Navigation Controller
 * Handles navigation interactions, smooth scrolling, and mobile menu
 */

class NavigationController {
  constructor() {
    this.header = null;
    this.navToggle = null;
    this.navMenu = null;
    this.navLinks = null;
    this.isMenuOpen = false;
    this.scrollThreshold = 100;
    this.lastScrollY = 0;
    this.isHeaderVisible = true;
    this.loadingController = null; // Enhanced loading controller
    this.isNavigating = false; // Prevent concurrent navigation
    this.isInitialLoad = true; // Track if this is initial page load
    
    this.init();
  }

  init() {
    this.header = document.querySelector('.header');
    this.navToggle = document.querySelector('.nav-toggle');
    this.navMenu = document.querySelector('.nav-menu');
    this.navLinks = document.querySelectorAll('.nav-link');
    
    if (!this.header || !this.navToggle || !this.navMenu) {
      console.warn('Navigation elements not found');
      return;
    }
    
    this.bindEvents();
    this.setupSmoothScrolling();
    
    // Set initial active link state
    this.updateActiveLink();
    
    console.log('🧭 Navigation initialized');
  }

  bindEvents() {
    // Mobile menu toggle
    this.navToggle.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.header.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Navigation link clicks
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this.handleNavClick(e, link);
      });
    });

    // Scroll events for header behavior and active link updates
    window.addEventListener('scroll', this.throttle(() => {
      this.handleScroll();
      this.updateActiveLink();
    }, 100));

    // Handle window resize
    window.addEventListener('resize', this.throttle(() => {
      this.handleResize();
    }, 250));
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    
    // Update ARIA attributes
    this.navToggle.setAttribute('aria-expanded', this.isMenuOpen.toString());
    
    // Toggle classes
    this.header.classList.toggle('nav-open', this.isMenuOpen);
    this.navMenu.classList.toggle('nav-menu-open', this.isMenuOpen);
    
    // Prevent body scroll when menu is open
    document.body.classList.toggle('nav-menu-open', this.isMenuOpen);
    
    // Update active link state when menu opens
    if (this.isMenuOpen) {
      this.updateActiveLink();
      
      // Force clear any stuck hover/focus states on navigation links
      this.navLinks.forEach(link => {
        link.blur(); // Remove focus
        // Force a style recalculation to clear hover states
        link.style.pointerEvents = 'none';
        setTimeout(() => {
          link.style.pointerEvents = '';
        }, 10);
      });
      
      // Don't focus the first link - this might be causing the hover state
      // Keep focus on the toggle button instead
      this.navToggle.blur();
    } else {
      // Return focus to toggle button
      this.navToggle.focus();
    }
    
    // Dispatch event for mascot reaction
    this.dispatchEvent('navigation:menu-toggle', { isOpen: this.isMenuOpen });
    
    console.log(`📱 Mobile menu ${this.isMenuOpen ? 'opened' : 'closed'}`);
  }

  closeMobileMenu() {
    if (!this.isMenuOpen) return;
    
    this.isMenuOpen = false;
    this.navToggle.setAttribute('aria-expanded', 'false');
    this.header.classList.remove('nav-open');
    this.navMenu.classList.remove('nav-menu-open');
    document.body.classList.remove('nav-menu-open');
    
    this.dispatchEvent('navigation:menu-close');
  }

  handleNavClick(e, link) {
    const href = link.getAttribute('href');
    
    console.log('🖱️ Navigation click detected:', href);
    
    // Handle external links
    if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      // For external links, just navigate normally
      return; // Let the browser handle it
    }
    
    // Handle hash links (smooth scrolling)
    if (href && href.startsWith('#')) {
      e.preventDefault();
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        console.log('📍 Using smooth scrolling for section:', targetId);
        
        // Use regular smooth scrolling navigation
        this.scrollToElement(targetElement);
        
        // Close mobile menu if open
        if (this.isMenuOpen) {
          this.closeMobileMenu();
        }
        
        // Update URL without jumping
        history.pushState(null, null, href);
        
        // Update active link
        this.setActiveLink(targetId);
        
        // Dispatch event for mascot reaction
        this.dispatchEvent('navigation:link-click', { 
          target: targetId,
          link: link 
        });
      }
    }
  }

  scrollToElement(element) {
    const headerHeight = this.header.offsetHeight;
    const elementTop = element.offsetTop - headerHeight; // No gap - header bottom touches section top
    
    window.scrollTo({
      top: Math.max(0, elementTop), // Ensure we don't scroll negative
      behavior: 'smooth'
    });
  }

  setupSmoothScrolling() {
    // Handle hash links in URL on page load
    if (window.location.hash) {
      setTimeout(() => {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          this.scrollToElement(targetElement);
        }
      }, 100);
    }
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Hide/show header based on scroll direction
    if (currentScrollY > this.scrollThreshold) {
      if (currentScrollY > this.lastScrollY && this.isHeaderVisible) {
        // Scrolling down - hide header
        this.hideHeader();
      } else if (currentScrollY < this.lastScrollY && !this.isHeaderVisible) {
        // Scrolling up - show header
        this.showHeader();
      }
    } else {
      // At top of page - always show header
      if (!this.isHeaderVisible) {
        this.showHeader();
      }
    }
    
    // Add scrolled class for styling
    this.header.classList.toggle('scrolled', currentScrollY > 50);
    
    this.lastScrollY = currentScrollY;
  }

  hideHeader() {
    this.header.classList.add('header-hidden');
    this.isHeaderVisible = false;
  }

  showHeader() {
    this.header.classList.remove('header-hidden');
    this.isHeaderVisible = true;
  }

  updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const headerHeight = this.header.offsetHeight;
    
    let activeSection = '';
    let maxVisibleArea = 0;
    
    // If we're at the very top (above all sections), default to 'home'
    if (window.scrollY < 100) {
      activeSection = 'home';
    } else {
      // Find the section with the most visible area in the viewport
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionBottom = sectionTop + sectionHeight;
        
        // Calculate visible area of this section
        const viewportTop = window.scrollY + headerHeight;
        const viewportBottom = window.scrollY + window.innerHeight;
        
        const visibleTop = Math.max(sectionTop, viewportTop);
        const visibleBottom = Math.min(sectionBottom, viewportBottom);
        const visibleArea = Math.max(0, visibleBottom - visibleTop);
        
        // If this section has more visible area, make it active
        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea;
          activeSection = section.id;
        }
      });
    }
    
    // Update active navigation link
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        
        // If activeSection is 'home', no nav links should be active
        if (activeSection === 'home') {
          link.classList.remove('nav-link-active');
        } else {
          link.classList.toggle('nav-link-active', targetId === activeSection);
        }
      }
    });
  }

  handleResize() {
    // Close mobile menu on desktop
    if (window.innerWidth >= 768 && this.isMenuOpen) {
      this.closeMobileMenu();
    }
  }

  // Public API methods
  navigateTo(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      this.scrollToElement(element);
      history.pushState(null, null, `#${sectionId}`);
    }
  }

  openMobileMenu() {
    if (!this.isMenuOpen) {
      this.toggleMobileMenu();
    }
  }

  closeMobileMenuPublic() {
    this.closeMobileMenu();
  }

  setActiveLink(sectionId) {
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        link.classList.toggle('nav-link-active', targetId === sectionId);
      }
    });
  }

  // Utility functions
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Cleanup
  destroy() {
    // Remove event listeners
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('click', this.closeMobileMenu);
    document.removeEventListener('keydown', this.closeMobileMenu);
    
    // Reset classes
    this.header?.classList.remove('nav-open', 'header-hidden', 'scrolled');
    this.navMenu?.classList.remove('nav-menu-open');
    document.body.classList.remove('nav-menu-open');
    
    console.log('🧭 Navigation destroyed');
  }
}

export default NavigationController;
