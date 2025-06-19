// Guilherme Designer Mascot Behavior System
// Handles all interactive behaviors and state management for the pixel art mascot

export class DesignerMascot {
  constructor() {
    this.element = null;
    this.currentState = 'idle';
    this.lastInteraction = Date.now();
    this.hideTimeout = null;
    this.restTimeout = null;
    this.isHidden = false;
    this.mousePosition = { x: 0, y: 0 };
    
    // Configuration
    this.config = {
      hideDistance: 100, // pixels
      revealDelay: 2000, // milliseconds
      restDelay: 30000,  // 30 seconds of inactivity
      mouseMoveThrottle: 100, // throttle mouse move events
    };
    
    this.init();
  }
  
  init() {
    this.createElement();
    this.bindEvents();
    this.startBehaviorLoop();
    
    // Trigger page load sequence
    setTimeout(() => {
      this.onPageLoad();
    }, 500);
    
    console.log('🎭 Designer Mascot initialized - Guilherme is ready!');
  }
  
  createElement() {
    // Create the mascot HTML structure with individual body parts
    this.element = document.createElement('div');
    this.element.className = 'character-mascot';
    this.element.innerHTML = `
      <div class="mascot-container">
        <div class="mascot-character">
          <div class="mascot-hair"></div>
          <div class="mascot-head"></div>
          <div class="mascot-eye-left"></div>
          <div class="mascot-eye-right"></div>
          <div class="mascot-beard"></div>
          <div class="mascot-body"></div>
          <div class="mascot-arm-left"></div>
          <div class="mascot-arm-right"></div>
          <div class="mascot-leg-left"></div>
          <div class="mascot-leg-right"></div>
          <div class="mascot-tool"></div>
        </div>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(this.element);
    
    // Set initial state
    this.setState('idle');
  }
  
  bindEvents() {
    // Mouse movement tracking for proximity detection
    let mouseMoveThrottled = this.throttle((e) => {
      this.mousePosition = { x: e.clientX, y: e.clientY };
      this.checkMouseProximity();
    }, this.config.mouseMoveThrottle);
    
    document.addEventListener('mousemove', mouseMoveThrottled);
    
    // Page interaction events
    document.addEventListener('click', () => this.onUserInteraction('click'));
    document.addEventListener('scroll', this.throttle(() => this.onUserInteraction('scroll'), 200));
    document.addEventListener('keydown', () => this.onUserInteraction('keydown'));
    
    // Gallery specific events
    document.addEventListener('DOMContentLoaded', () => {
      this.bindGalleryEvents();
      this.bindNavigationEvents();
    });
    
    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.setState('sleepy');
      } else {
        this.setState('excited');
        this.onUserInteraction('page-focus');
      }
    });
  }
  
  bindGalleryEvents() {
    // Gallery item hover events
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        this.onProjectHover();
      });
      
      item.addEventListener('click', () => {
        this.onProjectClick();
      });
    });
    
    // Scroll loading events
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.setState('excited');
          this.onUserInteraction('content-load');
        }
      });
    });
    
    // Observe gallery loading indicator
    const loadingIndicator = document.querySelector('.gallery-loading');
    if (loadingIndicator) {
      scrollObserver.observe(loadingIndicator);
    }
  }
  
  bindNavigationEvents() {
    // Menu interactions
    const menuToggles = document.querySelectorAll('.menu-toggle, .nav-toggle');
    menuToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        this.onMenuOpen();
      });
    });
    
    // Back navigation
    const backLinks = document.querySelectorAll('.back-link');
    backLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.setState('walking');
        this.onUserInteraction('navigation');
      });
    });
  }
  
  setState(newState) {
    if (this.currentState === newState) return;
    
    // Remove previous state class
    this.element.classList.remove(`mascot-${this.currentState}`);
    
    // Add new state class
    this.element.classList.add(`mascot-${newState}`);
    
    this.currentState = newState;
    console.log(`🎭 Mascot state changed to: ${newState}`);
    
    // Handle state-specific logic
    this.handleStateChange(newState);
  }
  
  handleStateChange(state) {
    switch (state) {
      case 'excited':
        // Clear rest timeout since user is active
        clearTimeout(this.restTimeout);
        this.scheduleRestState();
        break;
        
      case 'dancing':
        // Dancing animation will handle positioning
        clearTimeout(this.restTimeout);
        setTimeout(() => {
          if (this.currentState === 'dancing') {
            this.setState('idle');
          }
        }, 8000); // Match enhanced animation duration
        break;
        
      case 'creating':
        // Special designer gesture
        setTimeout(() => {
          if (this.currentState === 'creating') {
            this.setState('excited');
          }
        }, 3000);
        break;
        
      case 'hiding':
        this.isHidden = true;
        // Schedule reveal
        clearTimeout(this.hideTimeout);
        this.hideTimeout = setTimeout(() => {
          if (this.isHidden) {
            this.setState('revealing');
          }
        }, this.config.revealDelay);
        break;
        
      case 'revealing':
        this.isHidden = false;
        setTimeout(() => {
          if (this.currentState === 'revealing') {
            this.setState('idle');
          }
        }, 800); // Match animation duration
        break;
        
      case 'sleepy':
        // Very tired, stays sleepy until interaction
        break;
        
      case 'coffee':
        // Coffee break time
        setTimeout(() => {
          if (this.currentState === 'coffee') {
            this.setState('excited');
          }
        }, 6000);
        break;
    }
  }
  
  onUserInteraction(type) {
    this.lastInteraction = Date.now();
    
    // Log interaction for debugging
    console.log(`🎭 User interaction: ${type}`);
    
    // Clear rest timeout on any interaction
    clearTimeout(this.restTimeout);
    
    // Handle specific interaction types
    switch (type) {
      case 'gallery-hover':
        if (this.currentState !== 'hiding' && this.currentState !== 'dancing') {
          this.setState('excited');
        }
        break;
        
      case 'project-select':
        this.setState('creating');
        break;
        
      case 'menu-toggle':
      case 'navigation':
        this.setState('dancing');
        break;
        
      case 'page-focus':
        if (this.currentState === 'sleepy') {
          this.setState('excited');
        }
        break;
    }
    
    // Schedule rest state
    this.scheduleRestState();
  }
  
  scheduleRestState() {
    clearTimeout(this.restTimeout);
    this.restTimeout = setTimeout(() => {
      if (Date.now() - this.lastInteraction >= this.config.restDelay) {
        this.setState('sleepy');
      }
    }, this.config.restDelay);
  }
  
  checkMouseProximity() {
    if (this.isHidden) return;
    
    const mascotRect = this.element.getBoundingClientRect();
    const mascotCenter = {
      x: mascotRect.left + mascotRect.width / 2,
      y: mascotRect.top + mascotRect.height / 2
    };
    
    const distance = Math.sqrt(
      Math.pow(this.mousePosition.x - mascotCenter.x, 2) +
      Math.pow(this.mousePosition.y - mascotCenter.y, 2)
    );
    
    if (distance < this.config.hideDistance && this.currentState !== 'hiding') {
      this.setState('hiding');
    }
  }
  
  // Utility method for throttling events
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
    }
  }
  
  // Behavior loop for periodic actions
  startBehaviorLoop() {
    setInterval(() => {
      this.periodicBehavior();
    }, 15000); // Check every 15 seconds
  }
  
  // Enhanced periodic behaviors
  periodicBehavior() {
    const timeSinceInteraction = Date.now() - this.lastInteraction;
    
    // Random dancing if idle for a while
    if (timeSinceInteraction > 45000 && this.currentState === 'idle' && Math.random() > 0.7) {
      this.setState('dancing');
    }
    
    // Coffee break occasionally when idle
    if (timeSinceInteraction > 60000 && this.currentState === 'idle' && Math.random() > 0.75) {
      this.setState('coffee');
    }
    
    // Occasional creative gesture when idle
    if (this.currentState === 'idle' && Math.random() > 0.8) {
      this.setState('creating');
    }
    
    // Get sleepy after very long inactivity
    if (timeSinceInteraction > 120000 && this.currentState === 'idle' && Math.random() > 0.6) {
      this.setState('sleepy');
    }
    
    // Subtle idle variations
    if (this.currentState === 'idle' && Math.random() > 0.85) {
      this.addIdleVariation();
    }
  }

  // Add subtle idle variations
  addIdleVariation() {
    this.element.classList.add('mascot-idle-variation');
    setTimeout(() => {
      this.element.classList.remove('mascot-idle-variation');
    }, 6000);
  }

  // Surprise reaction for unexpected interactions
  showSurprise() {
    this.element.classList.add('mascot-surprised');
    setTimeout(() => {
      this.element.classList.remove('mascot-surprised');
    }, 600);
  }

  // Enhanced hover response with variations
  onProjectHover() {
    const responses = ['excited', 'creating'];
    
    // Occasionally show surprise for variety
    if (Math.random() > 0.9) {
      this.showSurprise();
      setTimeout(() => {
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.setState(randomResponse);
      }, 600);
    } else {
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      this.setState(randomResponse);
    }
  }

  onProjectClick() {
    this.setState('excited');
  }

  onMenuOpen() {
    this.setState('excited');
  }

  onPageLoad() {
    this.setState('revealing');
    
    // After revealing, start creating
    setTimeout(() => {
      if (this.currentState === 'idle') {
        this.setState('creating');
      }
    }, 2000);
  }
  
  // Loading state for project pages
  setLoadingState(progress = 0) {
    this.element.classList.add('mascot-loading');
    
    // Update loading animation based on progress
    if (progress >= 100) {
      setTimeout(() => {
        this.element.classList.remove('mascot-loading');
        this.setState('excited');
      }, 500);
    }
  }
  
  // Special designer mode (color palette mode)
  setPaletteMode(enabled = true) {
    if (enabled) {
      this.element.classList.add('mascot-palette-mode');
    } else {
      this.element.classList.remove('mascot-palette-mode');
    }
  }
  
  // Debug mode
  enableDebug(enabled = true) {
    if (enabled) {
      this.element.classList.add('debug-mascot');
      console.log('🎭 Mascot debug mode enabled');
    } else {
      this.element.classList.remove('debug-mascot');
    }
  }
  
  // Cleanup method
  destroy() {
    clearTimeout(this.hideTimeout);
    clearTimeout(this.restTimeout);
    
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    console.log('🎭 Designer Mascot destroyed');
  }
}

// MascotController wrapper for main app
class MascotController {
  constructor() {
    this.mascot = null;
    this.initializeMascot();
  }
  
  initializeMascot() {
    try {
      this.mascot = initializeMascot();
      if (this.mascot) {
        console.log('✅ MascotController initialized successfully');
      } else {
        console.error('❌ Failed to initialize mascot instance');
      }
    } catch (error) {
      console.error('❌ MascotController initialization error:', error);
    }
  }
  
  setState(state) {
    if (this.mascot && typeof this.mascot.setState === 'function') {
      this.mascot.setState(state);
    } else {
      console.warn('⚠️ Mascot setState not available');
    }
  }
  
  onInteraction(type) {
    if (this.mascot && typeof this.mascot.onUserInteraction === 'function') {
      this.mascot.onUserInteraction(type);
    } else {
      console.warn('⚠️ Mascot onUserInteraction not available');
    }
  }
  
  showLoading() {
    if (this.mascot && typeof this.mascot.setState === 'function') {
      this.mascot.setState('loading');
    } else {
      console.warn('⚠️ Mascot showLoading not available');
    }
  }
  
  destroy() {
    if (this.mascot && typeof this.mascot.destroy === 'function') {
      this.mascot.destroy();
    }
    this.mascot = null;
  }
}

// Default export for main app
export default MascotController;

// Global mascot instance
let mascotInstance = null;

// Initialize mascot when DOM is ready
export function initializeMascot() {
  if (mascotInstance) {
    console.warn('🎭 Mascot already initialized');
    return mascotInstance;
  }
  
  mascotInstance = new DesignerMascot();
  
  // Make available globally for debugging
  window.mascot = mascotInstance;
  
  return mascotInstance;
}

// Get current mascot instance
export function getMascot() {
  return mascotInstance;
}

// Convenience functions for external use
export function triggerMascotState(state) {
  if (mascotInstance) {
    switch (state) {
      case 'excited':
        mascotInstance.triggerExcited();
        break;
      case 'walking':
        mascotInstance.triggerWalking();
        break;
      case 'creating':
        mascotInstance.triggerCreating();
        break;
    }
  }
}

// Auto-initialize if not in module environment
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMascot);
} else if (typeof document !== 'undefined') {
  initializeMascot();
}
