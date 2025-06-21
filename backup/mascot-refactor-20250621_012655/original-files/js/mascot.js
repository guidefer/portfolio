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
    this.contextualAnimationActive = false; // Track if contextual animation is active
    this.lastContextualTrigger = 0; // Timestamp of last contextual animation
    this.contextualTimeout = null; // Timeout for contextual animations
    this.contextualQueue = null; // Queue for pending contextual animations
    this.currentSection = null; // Track current section to avoid duplicate triggers
    
    // Configuration
    this.config = {
      hideDistance: 100, // pixels
      revealDelay: 2000, // milliseconds
      restDelay: 120000,  // 2 minutes of inactivity for sleepy mode (was 120000)
      mouseMoveThrottle: 100, // throttle mouse move events
      immediateResponseStates: ['excited', 'creating'], // States that respond immediately
      interactionEndDelay: 300, // Delay before returning to idle after interaction ends
      sectionContextDuration: 10000, // How long section-based animations last (increased to 10s)
      autoCycleInterval: 30000, // Auto-cycle every 30 seconds when idle (increased to avoid conflicts)
      contextualCooldown: 2000, // Minimum time between contextual animations (reduced from 5000)
      contextualBuffer: 1000, // Buffer time before processing new contextual requests
      sectionChangeBuffer: 500, // Buffer for rapid section changes
    };
    
    this.init();
  }
  
  init() {
    console.log('🎭 🚀 Starting mascot initialization...');
    console.log('🎭 🚀 Document ready state:', document.readyState);
    
    this.createElement();
    this.createEnvironment();
    this.bindEvents();
    this.startBehaviorLoop();
    
    // Make globally accessible for debugging
    this.makeGlobal();
    
    // Trigger page load sequence
    setTimeout(() => {
      console.log('🎭 🚀 Triggering page load sequence...');
      this.onPageLoad();
    }, 500);
    
    console.log('🎭 🚀 Enhanced Designer Mascot initialized - Guilherme is ready with environmental elements!');
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
    // Mouse movement tracking for proximity detection (keep this for hide behavior)
    let mouseMoveThrottled = this.throttle((e) => {
      this.mousePosition = { x: e.clientX, y: e.clientY };
      this.checkMouseProximity();
    }, this.config.mouseMoveThrottle);
    
    document.addEventListener('mousemove', mouseMoveThrottled);
    
    // Section-based events and navigation - bind immediately or when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('🎭 DOM loaded - binding section and navigation events');
        this.bindSectionEvents();
        this.bindNavigationEvents();
      });
    } else {
      // DOM is already loaded, bind immediately
      console.log('🎭 DOM already loaded - binding section and navigation events immediately');
      setTimeout(() => {
        this.bindSectionEvents();
        this.bindNavigationEvents();
      }, 100);
    }
    
    // Page visibility changes - fixed focus trigger
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page hidden - go to sleepy faster
        this.setState('sleepy');
      } else {
        // Page visible again - wake up from sleepy
        this.onPageFocus();
      }
    });
    
    // Window focus/blur events for better sleepy state handling
    window.addEventListener('focus', () => {
      this.onPageFocus();
    });
    
    window.addEventListener('blur', () => {
      // Page lost focus - go to sleepy
      this.setState('sleepy');
    });
  }
  
  bindNavigationEvents() {
    // Navigation links should trigger contextual animations
    // Wait a bit to ensure DOM is fully loaded
    setTimeout(() => {
      const navLinks = document.querySelectorAll('.nav-link, .hero-cta, a[href^="#"]');
      console.log(`🎭 🔗 Looking for navigation links... found ${navLinks.length}`);
      
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        console.log(`🎭 🔗 Found nav link: "${link.textContent.trim()}" → ${href}`);
        
        link.addEventListener('click', (e) => {
          if (href && href.startsWith('#')) {
            const sectionName = href.substring(1); // Remove #
            console.log(`🎭 🔗 ⚡ NAVIGATION CLICK: ${sectionName} from element: "${link.textContent.trim()}"`);
            
            // Force immediate contextual animation trigger with navigation priority
            console.log(`🎭 🔗 ⚡ Forcing immediate contextual trigger for: ${sectionName}`);
            
            // Clear cooldown for navigation clicks (they have priority)
            this.lastContextualTrigger = 0;
            
            // Immediate trigger for navigation clicks - they have priority
            this.triggerContextualAnimation(sectionName, true);
          }
        });
      });
      
      console.log(`🎭 🔗 ✅ Successfully bound ${navLinks.length} navigation links:`, 
        Array.from(navLinks).map(l => `"${l.textContent.trim()}" → ${l.getAttribute('href')}`));
    }, 100);
  }
  
  bindSectionEvents() {
    // Wait for DOM to be fully ready
    setTimeout(() => {
      // Intersection Observer for section-based contextual animations
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const sectionName = this.getSectionName(entry.target);
          console.log(`🎭 👁️ Section observer: ${sectionName}, intersecting: ${entry.isIntersecting}, ratio: ${entry.intersectionRatio.toFixed(2)}, contextual: ${this.contextualAnimationActive}`);
          
          // More responsive triggering - lower threshold and buffered response
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            if (sectionName) {
              console.log(`🎭 👁️🎯 SECTION DETECTED: ${sectionName} - current state: ${this.currentState}`);
              
              // Add buffer to prevent rapid section changes from causing chaos
              setTimeout(() => {
                // Double-check that we're still in this section
                const currentlyVisible = entry.isIntersecting && entry.intersectionRatio > 0.3;
                if (currentlyVisible) {
                  console.log(`🎭 👁️🎯 SECTION CONFIRMED: ${sectionName} after buffer`);
                  this.triggerContextualAnimation(sectionName, false);
                } else {
                  console.log(`🎭 👁️🎯 SECTION CANCELLED: ${sectionName} no longer visible after buffer`);
                }
              }, this.config.sectionChangeBuffer);
            }
          }
        });
      }, {
        threshold: [0.1, 0.2, 0.3, 0.5], // Higher minimum threshold to reduce noise
        rootMargin: '-10% 0px -10% 0px' // Add margins to prevent edge triggering
      });
      
      // Observe all main sections - updated selectors
      const sections = document.querySelectorAll(
        '#home, #work, #about, #contact, .hero-section, .gallery-section, .about-section, .contact-section'
      );
      
      console.log(`🎭 👁️ Found sections to observe:`, Array.from(sections).map(s => ({
        id: s.id, 
        class: s.className,
        element: s
      })));
      
      if (sections.length === 0) {
        console.warn('🎭 👁️ ⚠️ No sections found to observe! Retrying in 1 second...');
        setTimeout(() => this.bindSectionEvents(), 1000);
        return;
      }
      
      sections.forEach(section => {
        sectionObserver.observe(section);
        console.log(`🎭 👁️ Observing section: ${section.id || section.className}`);
      });
      
      console.log(`🎭 👁️ ✅ Successfully observing ${sections.length} sections for contextual animations`);
    }, 100);
  }
  
  getSectionName(element) {
    // Try multiple ways to determine section name
    if (element.id) {
      // Map home to hero for consistency
      return element.id === 'home' ? 'hero' : element.id;
    }
    
    // Check class names
    if (element.classList.contains('hero-section')) return 'hero';
    if (element.classList.contains('gallery-section')) return 'work';
    if (element.classList.contains('about-section')) return 'about';
    if (element.classList.contains('contact-section')) return 'contact';
    
    // Fallback to data attribute
    return element.dataset.section || null;
  }
  
  triggerContextualAnimation(sectionName, isNavigation = false) {
    // If we're already in this section, don't trigger again
    if (this.currentSection === sectionName && !isNavigation) {
      console.log(`🎭 🎯 Already in section ${sectionName}, skipping duplicate trigger`);
      return;
    }
    
    // Map sections to contextual animations
    const sectionAnimations = {
      'hero': 'creating',    // Hero area - show mascot creating
      'home': 'creating',    // Same as hero
      'work': 'coffee',      // Work section - coffee break  
      'about': 'dancing',    // About section - dancing
      'contact': 'excited'   // Contact section - excited
    };
    
    const animation = sectionAnimations[sectionName];
    if (!animation) {
      console.log(`🎭 🎯 ❌ No animation mapping found for section: ${sectionName}`);
      return;
    }
    
    // Update current section
    this.currentSection = sectionName;
    
    // Navigation clicks have immediate priority
    if (isNavigation) {
      console.log(`🎭 🎯 🔗 NAVIGATION PRIORITY: ${sectionName} → ${animation}`);
      this.executeContextualAnimation(sectionName, animation);
      return;
    }
    
    // For scroll-based triggers, use queuing system
    if (this.contextualAnimationActive) {
      // Queue the new section (replace any existing queue - we only care about the latest)
      this.contextualQueue = { sectionName, animation };
      console.log(`🎭 🎯 📋 QUEUED: ${sectionName} → ${animation} (current: ${this.currentState})`);
      
      // Always update environment immediately even if mascot is busy
      if (this.environment && typeof this.environment.setState === 'function') {
        console.log(`🎭 🎯 🌍 ENVIRONMENT UPDATE: Setting environment to ${animation} while mascot finishes current animation`);
        this.environment.setState(animation, true);
      }
      return;
    }
    
    // Execute immediately if not busy
    this.executeContextualAnimation(sectionName, animation);
  }
  
  executeContextualAnimation(sectionName, animation) {
    const now = Date.now();
    
    console.log(`🎭 🎯 🔧 executeContextualAnimation called: ${sectionName} → ${animation}`);
    console.log(`🎭 🎯 🔧 Current state: ${this.currentState}, contextualActive: ${this.contextualAnimationActive}`);
    
    // Check cooldown (but allow navigation to bypass)
    if (now - this.lastContextualTrigger < this.config.contextualCooldown) {
      console.log(`🎭 🎯 ⏱️ Cooldown active for ${sectionName} (${this.config.contextualCooldown - (now - this.lastContextualTrigger)}ms remaining)`);
      return;
    }
    
    console.log(`🎭 🎯 ✅ EXECUTING CONTEXTUAL: Section ${sectionName} → ${animation} animation (was ${this.currentState})`);
    
    // Mark contextual animation as active
    this.contextualAnimationActive = true;
    this.lastContextualTrigger = now;
    
    // Clear any existing queue since we're executing
    this.contextualQueue = null;
    
    console.log(`🎭 🎯 🔧 About to call setState(${animation})`);
    this.setState(animation);
    console.log(`🎭 🎯 🔧 setState(${animation}) completed, current state: ${this.currentState}`);
    
    // Update interaction timer to keep system active
    this.lastInteraction = now;
    
    // Clear any existing contextual timeout
    if (this.contextualTimeout) {
      clearTimeout(this.contextualTimeout);
    }
    
    // Always update environment state
    if (this.environment && typeof this.environment.setState === 'function') {
      console.log(`🎭 🎯 🌍 ENVIRONMENT: Setting environment to ${animation} state for section ${sectionName}`);
      this.environment.setState(animation, true);
    }
    
    // Return to idle after animation duration
    this.contextualTimeout = setTimeout(() => {
      if (this.currentState === animation && this.contextualAnimationActive) {
        console.log(`🎭 🎯 ✅ CONTEXTUAL COMPLETE: ${animation} animation finished`);
        this.contextualAnimationActive = false;
        
        // Check if there's a queued animation
        if (this.contextualQueue) {
          const { sectionName: queuedSection, animation: queuedAnimation } = this.contextualQueue;
          console.log(`🎭 🎯 📋 PROCESSING QUEUE: ${queuedSection} → ${queuedAnimation}`);
          
          // Small delay to prevent jarring transitions
          setTimeout(() => {
            this.executeContextualAnimation(queuedSection, queuedAnimation);
          }, this.config.contextualBuffer);
        } else {
          // No queue, return to idle
          console.log(`🎭 🎯 ✅ Returning to idle, resuming auto-cycle`);
          this.setState('idle');
          this.resumeAutoCycle();
        }
      }
    }, this.config.sectionContextDuration);
  }
  
  onPageFocus() {
    // Only wake up from sleepy state when page gets focus
    if (this.currentState === 'sleepy') {
      console.log('🎭 Page focus detected - waking up from sleepy state');
      this.setState('idle');
      this.lastInteraction = Date.now(); // Reset interaction timer
      this.resumeAutoCycle();
    }
  }
  
  setState(newState, immediate = false) {
    console.log(`🎭 ⚙️ setState called: ${this.currentState} → ${newState} (immediate: ${immediate})`);
    
    if (this.currentState === newState) {
      console.log(`🎭 ⚙️ setState skipped: already in state ${newState}`);
      return;
    }
    
    // Determine if this should be an immediate response
    const shouldBeImmediate = immediate || 
                             this.config.immediateResponseStates.includes(newState) ||
                             this.config.immediateResponseStates.includes(this.currentState);
    
    console.log(`🎭 ⚙️ setState processing: ${this.currentState} → ${newState}, shouldBeImmediate: ${shouldBeImmediate}`);
    
    // Remove previous state class
    if (this.element) {
      this.element.classList.remove(`mascot-${this.currentState}`);
      console.log(`🎭 ⚙️ Removed class: mascot-${this.currentState}`);
      console.log(`🎭 ⚙️ Element classes after removal: ${this.element.className}`);
    } else {
      console.error(`🎭 ❌ setState: element not available!`);
    }
    
    // Add new state class
    if (this.element) {
      this.element.classList.add(`mascot-${newState}`);
      console.log(`🎭 ⚙️ Added class: mascot-${newState}`);
      console.log(`🎭 ⚙️ Element classes after addition: ${this.element.className}`);
      
      // Double-check that the class was actually added
      if (this.element.classList.contains(`mascot-${newState}`)) {
        console.log(`🎭 ✅ Class mascot-${newState} confirmed present`);
      } else {
        console.error(`🎭 ❌ Class mascot-${newState} NOT found after addition!`);
      }
      
      // Check if the container exists and log its animation status
      const container = this.element.querySelector('.mascot-container');
      if (container) {
        const computedStyle = getComputedStyle(container);
        console.log(`🎭 🎬 Container animation after state change: ${computedStyle.animationName}`);
        console.log(`🎭 🎬 Container animation duration: ${computedStyle.animationDuration}`);
      } else {
        console.error(`🎭 ❌ .mascot-container not found in element structure!`);
      }
    }
    
    this.currentState = newState;
    console.log(`🎭 ✅ Mascot state changed to: ${newState} (immediate: ${immediate} → shouldBeImmediate: ${shouldBeImmediate})`);
    
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
        // Return to idle after 10 seconds
        setTimeout(() => {
          if (this.currentState === 'excited') {
            this.setState('idle');
          }
        }, 10000);
        break;
        
      case 'dancing':
        // Return to idle after 10 seconds  
        setTimeout(() => {
          if (this.currentState === 'dancing') {
            this.setState('idle');
          }
        }, 10000);
        break;
        
      case 'creating':
        // Return to idle after 10 seconds
        setTimeout(() => {
          if (this.currentState === 'creating') {
            this.setState('idle');
          }
        }, 10000);
        break;
        
      case 'thinking':
        // Return to idle after 10 seconds
        setTimeout(() => {
          if (this.currentState === 'thinking') {
            this.setState('idle');
          }
        }, 10000);
        break;
        
      case 'coffee':
        // Return to idle after 10 seconds
        setTimeout(() => {
          if (this.currentState === 'coffee') {
            this.setState('idle');
          }
        }, 10000);
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
        // Stay sleepy until page focus or interaction
        console.log('🎭 Entering sleepy state - will wake on page focus');
        break;
    }
  }
  
  onUserInteraction(type) {
    // Log interaction for debugging
    console.log(`🎭 User interaction: ${type} (current state: ${this.currentState}, contextual: ${this.contextualAnimationActive})`);
    
    // Don't interfere with contextual animations for gallery interactions
    if (this.contextualAnimationActive && ['gallery-hover', 'gallery-click', 'gallery-load'].includes(type)) {
      console.log(`🎭 Ignoring ${type} - contextual animation active`);
      return;
    }
    
    this.lastInteraction = Date.now();
    
    // Clear rest timeout on any interaction
    clearTimeout(this.restTimeout);
    
    // Handle minimal interaction types - mainly section-based now
    switch (type) {
      case 'page-focus':
        // Wake up from sleepy state
        if (this.currentState === 'sleepy') {
          this.setState('idle');
        }
        break;
        
      case 'mouse-proximity':
        // Only handle hide/reveal behavior
        // Handled in checkMouseProximity method
        break;
        
      case 'page-load':
        // Initial page load - let contextual system handle it
        console.log(`🎭 Page load interaction - contextual system will handle`);
        break;
        
      case 'navigation':
        // Navigation interactions - let contextual system handle
        console.log(`🎭 Navigation interaction - contextual system will handle`);
        break;
    }
    
    // Only resume auto-cycling for non-gallery interactions when not in contextual mode
    if (!this.contextualAnimationActive && !['gallery-hover', 'gallery-click', 'gallery-load'].includes(type)) {
      this.resumeAutoCycle();
    }
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
  
  // Behavior loop for auto-cycling and sleepy detection
  startBehaviorLoop() {
    // Check for sleepy state every 30 seconds
    setInterval(() => {
      this.checkSleepyState();
    }, 30000);
    
    // Auto-cycle animations when idle
    setInterval(() => {
      this.autoCycleBehavior();
    }, this.config.autoCycleInterval);
  }
  
  checkSleepyState() {
    const timeSinceInteraction = Date.now() - this.lastInteraction;
    
    // Go sleepy after 2 minutes of inactivity
    if (timeSinceInteraction > this.config.restDelay && this.currentState !== 'sleepy') {
      console.log('🎭 Going sleepy after 2 minutes of inactivity');
      this.setState('sleepy');
    }
  }
  
  autoCycleBehavior() {
    // Only auto-cycle when idle and not sleepy and no contextual animation is active
    if (this.currentState !== 'idle' || this.contextualAnimationActive) {
      console.log(`🎭 Auto-cycle skipped: state=${this.currentState}, contextual=${this.contextualAnimationActive}`);
      return;
    }
    
    const timeSinceInteraction = Date.now() - this.lastInteraction;
    
    // Don't auto-cycle if close to sleepy time
    if (timeSinceInteraction > (this.config.restDelay - 30000)) {
      console.log(`🎭 Auto-cycle skipped: close to sleepy time (${timeSinceInteraction}ms since interaction)`);
      return;
    }
    
    // Don't auto-cycle if recent contextual animation
    const timeSinceContextual = Date.now() - this.lastContextualTrigger;
    if (timeSinceContextual < this.config.contextualCooldown * 2) {
      console.log(`🎭 Auto-cycle skipped: recent contextual animation (${timeSinceContextual}ms ago)`);
      return;
    }
    
    // Cycle through different animations
    const cycleAnimations = ['thinking', 'creating', 'coffee'];
    const randomAnimation = cycleAnimations[Math.floor(Math.random() * cycleAnimations.length)];
    
    console.log(`🎭 🔄 AUTO-CYCLE: ${randomAnimation} (no contextual activity)`);
    this.setState(randomAnimation);
    
    // Return to idle after animation completes
    setTimeout(() => {
      if (this.currentState === randomAnimation && !this.contextualAnimationActive) {
        console.log(`🎭 🔄 AUTO-CYCLE: ${randomAnimation} complete, returning to idle`);
        this.setState('idle');
      }
    }, 10000);
  }
  
  resumeAutoCycle() {
    // Reset interaction timer to resume auto-cycling
    this.lastInteraction = Date.now();
    console.log('🎭 Auto-cycle resumed');
  }

  // Add subtle idle variations
  addIdleVariation() {
    this.element.classList.add('mascot-idle-variation');
    setTimeout(() => {
      this.element.classList.remove('mascot-idle-variation');
    }, 6000);
  }

  onPageLoad() {
    // Start with creating animation as page loads and we're in hero section
    console.log('🎭 📄 Page load - starting with creating animation');
    this.contextualAnimationActive = true; // Mark as contextual (page load)
    this.currentSection = 'hero'; // Set initial section
    this.setState('creating');
    
    // After creating animation, go to idle and start auto-cycling
    setTimeout(() => {
      console.log('🎭 📄 Page load complete - entering idle state');
      this.contextualAnimationActive = false;
      this.setState('idle');
      this.resumeAutoCycle();
    }, this.config.sectionContextDuration); // 10 seconds of creating, then idle
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
  
  // DEBUG AND TESTING METHODS
  // Make mascot globally accessible for testing
  makeGlobal() {
    window.mascot = this;
    window.testContextual = (section) => this.triggerContextualAnimation(section);
    window.testState = (state) => this.setState(state);
    window.getMascotInfo = () => ({
      currentState: this.currentState,
      contextualActive: this.contextualAnimationActive,
      currentSection: this.currentSection,
      lastContextualTrigger: this.lastContextualTrigger,
      lastInteraction: this.lastInteraction,
      timeSinceLastContextual: Date.now() - this.lastContextualTrigger,
      timeSinceLastInteraction: Date.now() - this.lastInteraction,
      contextualQueue: this.contextualQueue
    });
    console.log('🎭 🧪 Mascot made globally accessible. Try: window.testContextual("work") or window.getMascotInfo()');
  }
  
  // Debug method to log current state
  logDebugInfo() {
    console.log('🎭 🧪 DEBUG INFO:', {
      currentState: this.currentState,
      contextualActive: this.contextualAnimationActive,
      currentSection: this.currentSection,
      contextualQueue: this.contextualQueue,
      lastContextualTrigger: new Date(this.lastContextualTrigger).toLocaleTimeString(),
      lastInteraction: new Date(this.lastInteraction).toLocaleTimeString(),
      timeSinceLastContextual: Date.now() - this.lastContextualTrigger,
      timeSinceLastInteraction: Date.now() - this.lastInteraction,
      element: this.element,
      environment: this.environment
    });
  }
  
  // Debug methods for testing and troubleshooting
  debugSetState(state) {
    console.log(`🎭 🐛 DEBUG: Manually setting state to ${state}`);
    this.setState(state, true);
  }
  
  debugInspectElement() {
    if (!this.element) {
      console.error('🎭 🐛 DEBUG: No element found');
      return;
    }
    
    console.log('🎭 🐛 DEBUG: Element inspection');
    console.log('  - Element:', this.element);
    console.log('  - Classes:', this.element.className);
    console.log('  - ClassList:', [...this.element.classList]);
    
    const container = this.element.querySelector('.mascot-container');
    if (container) {
      console.log('  - Container found:', container);
      const computedStyle = getComputedStyle(container);
      console.log('  - Container animation:', computedStyle.animationName);
      console.log('  - Container duration:', computedStyle.animationDuration);
      console.log('  - Container transform:', computedStyle.transform);
    } else {
      console.error('  - ❌ Container not found!');
    }
  }
  
  debugTestAllStates() {
    const states = ['idle', 'excited', 'dancing', 'coffee', 'coding', 'creating'];
    let index = 0;
    
    const testNext = () => {
      if (index < states.length) {
        const state = states[index];
        console.log(`🎭 🐛 DEBUG: Testing state ${index + 1}/${states.length}: ${state}`);
        this.setState(state, true);
        index++;
        setTimeout(testNext, 3000);
      } else {
        console.log('🎭 🐛 DEBUG: All states tested, returning to idle');
        this.setState('idle', true);
      }
    };
    
    testNext();
  }

}

// Make the class globally available for debugging
window.DesignerMascot = DesignerMascot;

// MascotController wrapper for main app
class MascotController {
  constructor() {
    this.mascot = null;
    this.initialize();
  }
  
  initialize() {
    try {
      this.mascot = new DesignerMascot();
      if (this.mascot) {
        console.log('✅ MascotController initialized successfully');
        
        // Make available globally for debugging
        if (typeof window !== 'undefined') {
          window.mascot = this.mascot;
        }
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
  if (typeof window !== 'undefined') {
    window.mascot = mascotInstance;
    console.log('🎭 Mascot available globally as window.mascot');
  }
  
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
