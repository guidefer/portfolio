// Guilherme Designer Mascot Behavior System
// Enhanced with environmental elements and responsive interactions
// Handles all interactive behaviors and state management for the pixel art mascot

import { MascotEnvironment } from './mascot-environment.js';

export class DesignerMascot {
  constructor() {
    this.element = null;
    this.environment = null;
    this.currentState = 'idle';
    this.lastInteraction = Date.now();
    this.hideTimeout = null;
    this.restTimeout = null;
    this.isHidden = false;
    this.mousePosition = { x: 0, y: 0 };
    this.interactionEndTimeout = null;
    
    // Configuration
    this.config = {
      hideDistance: 100, // pixels
      revealDelay: 2000, // milliseconds
      restDelay: 120000,  // 2 minutes of inactivity for sleepy mode
      mouseMoveThrottle: 100, // throttle mouse move events
      immediateResponseStates: ['excited', 'creating'], // States that respond immediately
      interactionEndDelay: 300, // Delay before returning to idle after interaction ends
    };
    
    this.init();
  }
  
  init() {
    this.createElement();
    this.createEnvironment();
    this.bindEvents();
    this.startBehaviorLoop();
    
    // Trigger page load sequence
    setTimeout(() => {
      this.onPageLoad();
    }, 500);
    
    console.log('🎭 Enhanced Designer Mascot initialized - Guilherme is ready with environmental elements!');
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
  
  createEnvironment() {
    try {
      // Initialize environmental elements system
      this.environment = new MascotEnvironment();
      console.log('🌟 Environmental elements system integrated successfully');
      console.log('🌟 Environment element:', this.environment.element);
      console.log('🌟 Environment current state:', this.environment.currentState);
    } catch (error) {
      console.error('❌ Failed to create environment:', error);
      this.environment = null;
    }
  }
  
  bindEvents() {
    // Mouse movement tracking for proximity detection
    let mouseMoveThrottled = this.throttle((e) => {
      this.mousePosition = { x: e.clientX, y: e.clientY };
      this.checkMouseProximity();
    }, this.config.mouseMoveThrottle);
    
    document.addEventListener('mousemove', mouseMoveThrottled);
    
    // Gallery specific events
    document.addEventListener('DOMContentLoaded', () => {
      this.bindGalleryEvents();
      this.bindNavigationEvents();
      this.bindSectionEvents();
    });
    
    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.setState('sleepy');
      } else {
        // Only wake up if was sleepy, don't force excited
        if (this.currentState === 'sleepy') {
          this.setState('idle');
          this.onUserInteraction('page-focus');
        }
      }
    });
  }
  
  bindGalleryEvents() {
    // Gallery item hover events with responsive interactions
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        // Clear any pending interaction end timeout
        if (this.interactionEndTimeout) {
          clearTimeout(this.interactionEndTimeout);
          this.interactionEndTimeout = null;
        }
        this.onProjectHover();
      });
      
      item.addEventListener('mouseleave', () => {
        // Immediate return to idle when interaction ends
        this.onInteractionEnd();
      });
      
      item.addEventListener('click', () => {
        this.onProjectClick();
      });
    });
    
    // Scroll loading events - removed excited trigger to prevent interruption
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Only trigger thinking state instead of excited to be less intrusive
          if (this.currentState === 'idle') {
            this.setState('thinking');
          }
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
  
  bindSectionEvents() {
    // Intersection Observer for section-based behaviors
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const sectionName = entry.target.dataset.section || 
                             entry.target.className.split(' ').find(cls => 
                               ['hero', 'work', 'about', 'contact'].includes(cls)
                             ) ||
                             entry.target.id;
          
          if (sectionName) {
            console.log(`🎭 Entering section: ${sectionName}`);
            this.onUserInteraction(`section-${sectionName}`);
          }
        }
      });
    }, {
      threshold: 0.5, // Trigger when 50% of section is visible
      rootMargin: '-10% 0px -10% 0px' // Small margins to avoid rapid triggering
    });
    
    // Observe all main sections
    const sections = document.querySelectorAll('[data-section], .hero, .work, .about, .contact, #hero, #work, #about, #contact');
    sections.forEach(section => {
      sectionObserver.observe(section);
    });
    
    console.log(`🎭 Observing ${sections.length} sections for mascot interactions`);
  }
  
  setState(newState, immediate = false) {
    if (this.currentState === newState) return;
    
    // Determine if this should be an immediate response
    const shouldBeImmediate = immediate || 
                             this.config.immediateResponseStates.includes(newState) ||
                             this.config.immediateResponseStates.includes(this.currentState);
    
    // Remove previous state class
    this.element.classList.remove(`mascot-${this.currentState}`);
    
    // Add new state class
    this.element.classList.add(`mascot-${newState}`);
    
    this.currentState = newState;
    console.log(`🎭 Mascot state changed to: ${newState} (immediate: ${immediate} → shouldBeImmediate: ${shouldBeImmediate})`);
    
    // Synchronize environment state
    if (this.environment) {
      console.log(`🎭 Calling environment.setState(${newState}, ${shouldBeImmediate})`);
      this.environment.setState(newState, shouldBeImmediate);
    } else {
      console.error(`🎭 ❌ Environment not available!`);
    }
    
    // Handle state-specific logic
    this.handleStateChange(newState);
  }
  
  handleStateChange(state) {
    switch (state) {
      case 'excited':
        // Clear rest timeout since user is active
        clearTimeout(this.restTimeout);
        // Return to idle after 10 seconds
        setTimeout(() => {
          if (this.currentState === 'excited') {
            this.setState('idle');
          }
        }, 10000);
        this.scheduleRestState();
        break;
        
      case 'dancing':
        // Dancing animation will handle positioning
        clearTimeout(this.restTimeout);
        setTimeout(() => {
          if (this.currentState === 'dancing') {
            this.setState('idle');
          }
        }, 10000); // 10 seconds for dancing
        this.scheduleRestState();
        break;
        
      case 'creating':
        // Return to idle after creating animation
        setTimeout(() => {
          if (this.currentState === 'creating') {
            this.setState('idle');
          }
        }, 10000); // 10 seconds for creating
        this.scheduleRestState();
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
        
      case 'thinking':
        // Thinking state - return to idle after 10 seconds
        setTimeout(() => {
          if (this.currentState === 'thinking') {
            this.setState('idle');
          }
        }, 10000);
        this.scheduleRestState();
        break;
        
      case 'coffee':
        // Coffee break time - return to idle after 10 seconds (was returning to excited before)
        setTimeout(() => {
          if (this.currentState === 'coffee') {
            this.setState('idle'); // Fixed: was going to 'excited' before
          }
        }, 10000);
        this.scheduleRestState();
        break;
    }
  }
  
  onUserInteraction(type) {
    this.lastInteraction = Date.now();
    
    // Log interaction for debugging
    console.log(`🎭 User interaction: ${type} (current state: ${this.currentState})`);
    
    // Clear rest timeout on any interaction
    clearTimeout(this.restTimeout);
    
    // Only trigger new animations if currently idle (prevent interrupting ongoing animations)
    if (this.currentState !== 'idle' && this.currentState !== 'sleepy') {
      console.log(`🎭 Skipping ${type} interaction - mascot busy in ${this.currentState} state`);
      this.scheduleRestState();
      return;
    }
    
    // Handle specific interaction types - only when idle or sleepy
    switch (type) {
      case 'gallery-hover':
        if (this.currentState !== 'hiding') {
          this.setState('thinking'); // Changed from excited to thinking
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
        // Only react if was sleepy, otherwise let natural cycle continue
        if (this.currentState === 'sleepy') {
          this.setState('idle');
        }
        break;
        
      case 'section-hero':
        this.setState('creating');
        break;
        
      case 'section-work':
        this.setState('coffee');
        break;
        
      case 'section-about':
        this.setState('dancing');
        break;
        
      case 'section-contact':
        this.setState('excited');
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
  
  // Enhanced periodic behaviors - more varied and less aggressive
  periodicBehavior() {
    const timeSinceInteraction = Date.now() - this.lastInteraction;
    
    // Only proceed if currently idle to allow natural cycling
    if (this.currentState !== 'idle') return;
    
    // Get sleepy after 2 minutes of inactivity
    if (timeSinceInteraction > this.config.restDelay) {
      this.setState('sleepy');
      return;
    }
    
    // Random behaviors while idle - more varied cycling
    const behaviors = [
      { state: 'thinking', chance: 0.25, minTime: 20000 }, // 25% chance after 20s
      { state: 'creating', chance: 0.3, minTime: 30000 },  // 30% chance after 30s
      { state: 'coffee', chance: 0.2, minTime: 45000 },    // 20% chance after 45s
      { state: 'dancing', chance: 0.15, minTime: 60000 },  // 15% chance after 60s
    ];
    
    // Check each behavior
    for (const behavior of behaviors) {
      if (timeSinceInteraction > behavior.minTime && Math.random() < behavior.chance) {
        console.log(`🎭 Periodic behavior: ${behavior.state} (${timeSinceInteraction/1000}s idle)`);
        this.setState(behavior.state);
        
        // Return to idle after a while - automatic return handled in handleStateChange now
        // No need for additional timeout here since each state handles its own return
        break;
      }
    }
    
    // Subtle idle variations occasionally
    if (Math.random() > 0.9) {
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

  // Enhanced hover response with variations - less aggressive
  onProjectHover() {
    // Only react if currently idle to avoid interrupting animations
    if (this.currentState !== 'idle') return;
    
    const responses = ['thinking', 'creating']; // Removed excited from hover responses
    
    // Occasionally show surprise for variety
    if (Math.random() > 0.9) {
      this.showSurprise();
      setTimeout(() => {
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.setState(randomResponse, true); // Immediate response for hover
      }, 600);
    } else {
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      this.setState(randomResponse, true); // Immediate response for hover
    }
  }

  onProjectClick() {
    // Only react if currently idle to avoid interrupting animations
    if (this.currentState !== 'idle') return;
    this.setState('creating', true); // Changed from excited to creating
  }

  onMenuOpen() {
    // Only react if currently idle to avoid interrupting animations
    if (this.currentState !== 'idle') return;
    this.setState('dancing'); // Changed from excited to dancing for menu
  }
  
  onInteractionEnd() {
    // Immediate return to idle when user interaction ends
    if (this.interactionEndTimeout) {
      clearTimeout(this.interactionEndTimeout);
    }
    
    // Small delay to avoid flickering, but much faster than before
    this.interactionEndTimeout = setTimeout(() => {
      if (this.config.immediateResponseStates.includes(this.currentState)) {
        this.setState('idle', true); // Immediate return to idle
        console.log('🎭 Interaction ended - returning to idle immediately');
      }
    }, this.config.interactionEndDelay);
  }

  onPageLoad() {
    // Start with a brief creating state as page loads
    this.setState('creating');
    
    // After creating, go to idle and let natural cycling begin
    setTimeout(() => {
      this.setState('idle');
      console.log('🎭 Page load complete - entering natural behavior cycle');
    }, 4000); // 4 seconds of creating, then idle
  }
  
  // Loading state for project pages
  setLoadingState(progress = 0) {
    this.element.classList.add('mascot-loading');
    
    // Update loading animation based on progress
    if (progress >= 100) {
      setTimeout(() => {
        this.element.classList.remove('mascot-loading');
        this.setState('creating'); // Changed from excited to creating
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
    // Clear all timeouts
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    if (this.restTimeout) clearTimeout(this.restTimeout);
    if (this.interactionEndTimeout) clearTimeout(this.interactionEndTimeout);
    
    // Destroy environment
    if (this.environment) {
      this.environment.destroy();
    }
    
    // Remove DOM element
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    console.log('🎭 Enhanced Designer Mascot destroyed');
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
    console.log('🎭 Mascot already initialized, returning existing instance');
    return mascotInstance;
  }
  
  console.log('🎭 Initializing Designer Mascot...');
  mascotInstance = new DesignerMascot();
  
  // Make available globally for debugging
  window.mascot = mascotInstance;
  
  return mascotInstance;
}

// Get current mascot instance
export function getMascot() {
  return mascotInstance;
}

// Export enhanced mascot manager class (for compatibility with test files)
export class MascotManager extends DesignerMascot {
  constructor() {
    super();
  }
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

// Note: Auto-initialization removed to prevent conflicts
// Initialization should be handled by the main app or explicitly called by test files
