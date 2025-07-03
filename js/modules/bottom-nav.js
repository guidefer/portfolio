/**
 * Bottom Navigation Controller
 * Handles mobile bottom navigation functionality with responsive behavior
 */

export class BottomNavController {
  constructor() {
    this.bottomNav = null;
    this.navItems = [];
    this.logoLink = null;
    this.isActive = false;
    this.resizeTimeout = null;
    this.isManualNavigation = false; // Flag to prevent scroll spy conflicts
    this.manualNavigationTimeout = null;
    this.boundResizeHandler = null; // Store bound resize handler for cleanup
    
    // Bind methods to preserve context
    this.handleNavClick = this.handleNavClick.bind(this);
    this.handleLogoClick = this.handleLogoClick.bind(this);
    this.handleResize = this.handleResize.bind(this);
    
    this.init();
  }
  
  init() {
    try {
      // Find bottom navigation elements
      this.bottomNav = document.querySelector('.bottom-nav');
      this.navItems = Array.from(document.querySelectorAll('.bottom-nav-item'));
      this.logoLink = document.querySelector('.bottom-nav-logo');

      if (!this.bottomNav) {
        console.warn('Bottom navigation element not found');
        return;
      }

      if (this.navItems.length === 0) {
        console.warn('No bottom navigation items found');
        return;
      }

      // Set up event listeners
      this.setupEventListeners();
      
      // Check initial state
      this.handleResize();
      
      console.log('🍎 Bottom navigation initialized:', {
        bottomNav: this.bottomNav,
        navItemsCount: this.navItems.length,
        hasLogo: !!this.logoLink
      });
    } catch (error) {
      console.error('Bottom navigation initialization failed:', error);
    }
  }
  
  setupEventListeners() {
    // Navigation clicks
    this.navItems.forEach(item => {
      item.addEventListener('click', this.handleNavClick);
    });
    
    // Logo click handler
    if (this.logoLink) {
      this.logoLink.addEventListener('click', this.handleLogoClick);
    }
    
    // Debounced resize handling
    this.boundResizeHandler = () => {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout(this.handleResize, 100);
    };
    window.addEventListener('resize', this.boundResizeHandler);
  }
  
  handleNavClick(e) {
    e.preventDefault();
    
    const targetHref = e.currentTarget.getAttribute('href');
    
    if (!targetHref || !targetHref.startsWith('#')) {
      console.warn('Invalid navigation target:', targetHref);
      return;
    }

    // Find target element
    const targetElement = document.querySelector(targetHref);
    
    if (!targetElement) {
      console.warn('Navigation target not found:', targetHref);
      return;
    }

    // Set manual navigation flag to prevent scroll spy conflicts
    this.setManualNavigationMode(true);

    // Update active state immediately for better UX
    this.setActiveItem(e.currentTarget);
    
    // Scroll to target section
    this.scrollToElement(targetElement);
  }
  
  handleLogoClick(e) {
    e.preventDefault();
    
    // Set manual navigation flag
    this.setManualNavigationMode(true);
    
    // Scroll to top of page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Clear active states when going to home
    this.setActiveItem(null);
  }
  
  setActiveItem(activeItem) {
    // Remove active class from all items
    this.navItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to clicked item
    if (activeItem) {
      activeItem.classList.add('active');
    }
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

  setManualNavigationMode(isManual) {
    this.isManualNavigation = isManual;
    
    if (isManual) {
      // Clear any existing timeout
      if (this.manualNavigationTimeout) {
        clearTimeout(this.manualNavigationTimeout);
      }
      
      // Reset manual navigation mode after scroll completes
      this.manualNavigationTimeout = setTimeout(() => {
        this.isManualNavigation = false;
      }, 1000); // Allow time for smooth scroll to complete
    }
  }
  
  show() {
    if (!this.bottomNav || this.isActive) return;
    
    // Make sure element is visible before animating
    this.bottomNav.style.display = 'block';
    
    // Simple fade-in - just add active class
    this.bottomNav.classList.add('active');
    this.isActive = true;
  }
  
  hide() {
    if (!this.bottomNav || !this.isActive) return;
    
    // Simple fade-out - just remove active class
    this.bottomNav.classList.remove('active');
    this.isActive = false;
  }
  
  hideWithSlideDown() {
    if (!this.bottomNav || !this.isActive) return;
    
    // Simple fade-out for viewport transitions
    this.bottomNav.classList.add('slide-down');
    
    // Clean up classes and hide element after animation completes
    setTimeout(() => {
      this.bottomNav.classList.remove('active', 'slide-down');
      this.bottomNav.style.display = 'none'; // Hide after animation
      this.isActive = false;
    }, 300); // Match transition duration
  }
  
  handleResize() {
    const isMobile = window.innerWidth < 768;
    const header = document.querySelector('.header');
    const body = document.body;
    
    if (isMobile) {
      // Mobile: hide header, show bottom nav, move content up
      if (header) {
        header.classList.add('mobile-hidden');
        // Add body class to trigger content offset
        body.classList.add('header-hidden');
      }
      this.show();
    } else {
      // Desktop: show header, animate bottom nav down then hide, reset content position
      if (header) {
        header.classList.remove('mobile-hidden');
        // Remove body class to reset content position
        body.classList.remove('header-hidden');
      }
      this.hideWithSlideDown();
    }
  }
  
  // Public method to sync active state with external scroll spy
  updateActiveState(activeSectionId) {
    // Skip update if we're in manual navigation mode
    if (this.isManualNavigation) {
      return;
    }
    
    if (activeSectionId) {
      const activeItem = this.navItems.find(item => 
        item.getAttribute('href') === `#${activeSectionId}`
      );
      
      if (activeItem) {
        this.setActiveItem(activeItem);
      } else {
        // Clear active state if no matching section found
        this.setActiveItem(null);
      }
    } else {
      // No section is active (e.g., scrolled to top) - clear all active states
      this.setActiveItem(null);
    }
  }
  
  // Cleanup method
  destroy() {
    try {
      // Remove event listeners
      this.navItems.forEach(item => {
        item.removeEventListener('click', this.handleNavClick);
      });
      
      if (this.logoLink) {
        this.logoLink.removeEventListener('click', this.handleLogoClick);
      }
      
      window.removeEventListener('resize', this.boundResizeHandler);
      
      // Clear timeouts
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = null;
      }
      
      // Clear references
      this.bottomNav = null;
      this.navItems = [];
      this.logoLink = null;
      this.isActive = false;
      
      console.log('🍎 Bottom navigation destroyed successfully');
    } catch (error) {
      console.error('Bottom navigation cleanup failed:', error);
    }
  }
}
