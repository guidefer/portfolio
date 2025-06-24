/* UNIFIED MASCOT SYSTEM - Complete Character + Environmental Control */
/* Merged from mascot.js + mascot-environment.js for perfect synchronization */

export class UnifiedMascot {
  constructor() {
    // Core properties
    this.currentState = 'idle';
    this.isInitialized = false;
    
    // Element references
    this.characterElement = null;
    this.environmentElement = null;
    
    // Animation management
    this.contextualAnimationActive = false;
    this.contextualQueue = null;
    this.lastContextualTrigger = 0;
    this.lastInteraction = Date.now();
    this.autoCycleInterval = null;
    this.sleepTimeout = null;
    this.contextualTimeout = null;
    
    // Mouse tracking
    this.mousePosition = { x: 0, y: 0 };
    
    // Configuration
    this.config = {
      contextualCooldown: 1000,
      sleepyDelay: 120000 // 2 minutes
    };
    
    // Section mapping for contextual animations
    this.sectionAnimationMap = {
      'hero': 'excited',
      'work': 'creating', 
      'about': 'coffee',
      'contact': 'dancing'
    };
    
    this.init();
  }
  
  init() {
    console.log('🎭 Initializing Unified Mascot System...');
    
    this.createCharacterElement();
    this.createEnvironmentElement();
    this.bindEvents();
    
    // Start in idle state - CSS loading states will handle the entrance animation
    this.setState('idle');
    this.startAutoCycle();
    this.exposeDebugMethods(); // Add debug methods
    
    // Mark as initialized
    this.isInitialized = true;
    console.log('🎭 ✅ Unified Mascot System initialized successfully');
  }
  
  createCharacterElement() {
    // Create the mascot HTML structure with individual body parts
    this.characterElement = document.createElement('div');
    this.characterElement.className = 'character-mascot';
    this.characterElement.innerHTML = `
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
    document.body.appendChild(this.characterElement);
    console.log('🎭 Character element created');
  }
  
  createEnvironmentElement() {
    // Create environmental container with all possible elements
    this.environmentElement = document.createElement('div');
    this.environmentElement.className = 'mascot-environment';
    this.environmentElement.innerHTML = `
      <!-- Excited State Elements -->
      <div class="env-excited">
        <div class="confetti"></div>
        <div class="confetti"></div>
        <div class="confetti"></div>
        <div class="confetti"></div>
      </div>
      
      <!-- Dancing State Elements -->
      <div class="env-dancing">
        <div class="music-note"></div>
        <div class="music-note"></div>
        <div class="music-note"></div>
      </div>
      
      <!-- Thinking/Creating State Elements -->
      <div class="env-thinking">
        <div class="thought-bubble">
          <div class="question-mark"></div>
          <div class="lightbulb"></div>
        </div>
      </div>
      
      <!-- Creating State Elements -->
      <div class="env-creating">
        <div class="creative-font">Aa</div>
        <div class="creative-font">Bb</div>
        <div class="creative-font">Cc</div>
        <div class="color-swatch"></div>
        <div class="color-swatch"></div>
        <div class="color-swatch"></div>
        <div class="design-cursor"></div>
      </div>
      
      <!-- Coffee State Elements -->
      <div class="env-coffee">
        <div class="coffee-cup"></div>
        <div class="steam"></div>
        <div class="steam"></div>
      </div>
      
      <!-- Sleepy State Elements -->
      <div class="env-sleepy">
        <div class="zzz"></div>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(this.environmentElement);
    console.log('🎭 Environment element created');
  }
  
  bindEvents() {
    // Entrance animation completion listener
    if (this.characterElement) {
      this.characterElement.addEventListener('animationend', (event) => {
        if (event.animationName === 'mascotEntrance') {
          console.log('🐾 Mascot entrance animation complete - adding entrance-complete class');
          this.characterElement.classList.add('entrance-complete');
          // Start normal behavior after entrance
          this.setState('idle');
        }
      });
    }
    
    // Mouse movement tracking for proximity detection
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
      console.log('🎭 DOM already loaded - binding section and navigation events');
      this.bindSectionEvents();
      this.bindNavigationEvents();
    }
    
    // Page focus/blur handling
    window.addEventListener('focus', () => {
      console.log('🎭 Page focus detected - waking up from sleepy state');
      this.onPageFocus();
    });
    
    window.addEventListener('blur', () => {
      console.log('🎭 Page blur detected - will enter sleepy state if idle');
      this.onPageBlur();
    });
    
    console.log('🎭 Event bindings completed');
  }
  
  // UNIFIED STATE MANAGEMENT - Controls BOTH character AND environment
  setState(newState, immediate = false) {
    if (!this.characterElement || !this.environmentElement) {
      console.error('🎭 ❌ setState: Elements not available!');
      return;
    }
    
    // Don't allow state changes during loading (except initial idle setup)
    if (document.body.classList.contains('loading') && newState !== 'idle') {
      console.log(`🎭 setState blocked during loading: ${newState}`);
      return;
    }
    
    // Don't allow state changes during entrance animation (except to idle initially)
    if (!this.characterElement.classList.contains('entrance-complete') && 
        this.currentState !== '' && newState !== 'idle') {
      console.log(`🎭 setState blocked during entrance: ${newState}`);
      return;
    }
    
    if (this.currentState === newState) {
      console.log(`🎭 State already ${newState}, skipping`);
      return;
    }
    
    console.log(`🎭 ⚙️ UNIFIED setState: ${this.currentState} → ${newState}`);
    
    // Remove previous state class from BOTH elements
    this.characterElement.classList.remove(`mascot-${this.currentState}`);
    this.environmentElement.classList.remove(`mascot-${this.currentState}`);
    console.log(`🎭 ⚙️ Removed classes: mascot-${this.currentState}`);
    
    // Add new state class to BOTH elements
    this.characterElement.classList.add(`mascot-${newState}`);
    this.environmentElement.classList.add(`mascot-${newState}`);
    console.log(`🎭 ⚙️ Added classes: mascot-${newState}`);
    
    // Verify classes were applied
    if (this.characterElement.classList.contains(`mascot-${newState}`) && 
        this.environmentElement.classList.contains(`mascot-${newState}`)) {
      console.log(`🎭 ✅ State changed to: ${newState} (BOTH character AND environment)`);
    } else {
      console.error(`🎭 ❌ State change failed for: ${newState}`);
    }
    
    this.currentState = newState;
    
    // Check animations are active
    setTimeout(() => {
      this.verifyAnimations();
    }, 100);
    
    // Handle state-specific logic
    this.handleStateChange(newState, immediate);
  }
  
  verifyAnimations() {
    const characterContainer = this.characterElement?.querySelector('.mascot-container');
    if (characterContainer) {
      const computedStyle = getComputedStyle(characterContainer);
      console.log(`🎭 🎬 Character animation: ${computedStyle.animationName} (${computedStyle.animationDuration})`);
    }
    
    const environmentVisible = this.environmentElement?.querySelector(`.env-${this.currentState.replace('mascot-', '')}`);
    if (environmentVisible) {
      console.log(`🎭 🌍 Environment visible: .env-${this.currentState.replace('mascot-', '')}`);
    }
  }
  
  handleStateChange(newState, immediate) {
    // Update interaction timer
    this.lastInteraction = Date.now();
    
    // Clear any existing timeouts
    if (this.contextualTimeout) {
      clearTimeout(this.contextualTimeout);
    }
    
    if (this.sleepTimeout) {
      clearTimeout(this.sleepTimeout);
    }
    
    // Handle specific state transitions
    if (newState === 'revealing') {
      // After revealing, go to idle
      setTimeout(() => {
        this.setState('idle');
      }, 2000);
      return;
    }
    
    if (newState === 'hiding') {
      // Don't set timeout for hiding state
      return;
    }
    
    if (newState === 'sleepy') {
      // Don't auto-return from sleepy
      return;
    }
    
    // For all other states, return to idle after 10 seconds
    this.contextualTimeout = setTimeout(() => {
      if (this.currentState === newState) {
        console.log(`🎭 ⏰ State timeout - returning to idle from ${newState}`);
        this.setState('idle');
        this.contextualAnimationActive = false;
        
        // Check for queued animations
        this.checkAnimationQueue();
      }
    }, 10000);
  }
  
  // CONTEXTUAL ANIMATION SYSTEM
  triggerContextualAnimation(sectionName, animation, immediate = false) {
    const now = Date.now();
    
    console.log(`🎭 🎯 triggerContextualAnimation: ${sectionName} → ${animation} (immediate: ${immediate})`);
    
    // Navigation clicks have immediate priority
    if (immediate) {
      console.log(`🎭 🎯 🚀 IMMEDIATE TRIGGER: ${sectionName} → ${animation}`);
      this.executeContextualAnimation(sectionName, animation);
      return;
    }
    
    // For scroll-based triggers, use queuing system
    if (this.contextualAnimationActive) {
      // Queue the new section (replace any existing queue - we only care about the latest)
      this.contextualQueue = { sectionName, animation };
      console.log(`🎭 🎯 📋 QUEUED: ${sectionName} → ${animation} (current: ${this.currentState})`);
      return;
    }
    
    // Execute immediately if not busy
    this.executeContextualAnimation(sectionName, animation);
  }
  
  executeContextualAnimation(sectionName, animation = null) {
    const now = Date.now();
    
    // If no animation specified, look it up from section mapping
    if (!animation) {
      animation = this.sectionAnimationMap[sectionName] || 'excited';
    }
    
    console.log(`🎭 🎯 🔧 executeContextualAnimation called: ${sectionName} → ${animation}`);
    console.log(`🎭 🎯 📊 Section mapping check: sectionAnimationMap[${sectionName}] = ${this.sectionAnimationMap[sectionName]}`);
    
    // DEBUG: Log if this is specifically the "creating" animation
    if (animation === 'creating') {
      console.log(`🎭 🎨 ✨ CREATING ANIMATION TRIGGERED! Section: ${sectionName}`);
    }
    
    // Check cooldown (but allow navigation to bypass)
    if (now - this.lastContextualTrigger < this.config.contextualCooldown) {
      console.log(`🎭 🎯 ⏱️ Cooldown active for ${sectionName}`);
      return;
    }
    
    console.log(`🎭 🎯 ✅ EXECUTING CONTEXTUAL: Section ${sectionName} → ${animation} animation`);
    
    // Mark contextual animation as active
    this.contextualAnimationActive = true;
    this.lastContextualTrigger = now;
    
    // Clear any existing queue since we're executing
    this.contextualQueue = null;
    
    // Execute unified state change
    this.setState(animation);
    
    // Update interaction timer to keep system active
    this.lastInteraction = now;
  }
  
  checkAnimationQueue() {
    if (this.contextualQueue && !this.contextualAnimationActive) {
      console.log(`🎭 🎯 📋 Processing queued animation: ${this.contextualQueue.sectionName} → ${this.contextualQueue.animation}`);
      const { sectionName, animation } = this.contextualQueue;
      this.contextualQueue = null;
      this.executeContextualAnimation(sectionName, animation);
    }
  }
  
  bindSectionEvents() {
    // Bind section-based contextual animations
    const sections = document.querySelectorAll('section, .hero, .gallery, .about, .contact');
    if (sections.length === 0) {
      console.warn('🎭 No sections found for contextual animations');
      return;
    }
    
    console.log(`🎭 📍 Found ${sections.length} sections for animation binding`);
    
    sections.forEach(section => {
      const sectionId = section.id || section.className.split(' ')[0];
      console.log(`🎭 📍 Binding section: ${sectionId} (id: ${section.id}, classes: ${section.className})`);
      
      // Create intersection observer for this section
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.executeContextualAnimation(sectionId);
          }
        });
      }, {
        threshold: 0.3,
        rootMargin: '-10% 0px -10% 0px'
      });
      
      observer.observe(section);
    });
    
    console.log('🎭 Section events bound for contextual animations');
  }
  
  bindNavigationEvents() {
    // Bind navigation-related events
    const navLinks = document.querySelectorAll('nav a, .nav-link, .header a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.onUserInteraction('navigation');
      });
    });
    
    console.log('🎭 Navigation events bound');
  }
  
  onPageFocus() {
    if (this.currentState === 'sleepy') {
      this.setState('idle');
    }
    this.lastInteraction = Date.now();
  }
  
  onPageBlur() {
    // Go sleepy immediately when window loses focus
    if (this.currentState === 'idle') {
      console.log('🎭 Window lost focus - going sleepy immediately');
      this.setState('sleepy');
    }
  }
  
  startSleepyTimer() {
    if (this.sleepTimeout) {
      clearTimeout(this.sleepTimeout);
    }
    
    this.sleepTimeout = setTimeout(() => {
      if (this.currentState === 'idle') {
        this.setState('sleepy');
      }
    }, this.config.sleepyDelay);
  }
  
  // === AUTO-CYCLE SYSTEM ===
  
  startAutoCycle() {
    // Start the behavior loop with intervals
    this.startBehaviorLoop();
    console.log('🎭 Auto-cycle system started');
  }
  
  startBehaviorLoop() {
    // Check for sleepy state every 30 seconds
    setInterval(() => {
      this.checkSleepyState();
    }, 30000);
    
    // Auto-cycle animations when idle
    this.autoCycleInterval = setInterval(() => {
      this.autoCycleBehavior();
    }, 30000); // 30 seconds
  }
  
  autoCycleBehavior() {
    // Don't auto-cycle until entrance is complete
    if (!this.characterElement.classList.contains('entrance-complete')) {
      console.log('🎭 Auto-cycle skipped: entrance not complete');
      return;
    }
    
    // Only auto-cycle when idle and not sleepy and no contextual animation is active
    if (this.currentState !== 'idle' || this.contextualAnimationActive) {
      console.log(`🎭 Auto-cycle skipped: state=${this.currentState}, contextual=${this.contextualAnimationActive}`);
      return;
    }
    
    const timeSinceInteraction = Date.now() - this.lastInteraction;
    
    // Don't auto-cycle if close to sleepy time
    if (timeSinceInteraction > (this.config.sleepyDelay - 30000)) {
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
    const cycleAnimations = ['thinking', 'creating', 'coffee', 'excited'];
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
  
  checkSleepyState() {
    const timeSinceInteraction = Date.now() - this.lastInteraction;
    
    // Go sleepy after 2 minutes of inactivity
    if (timeSinceInteraction > this.config.sleepyDelay && this.currentState !== 'sleepy') {
      console.log('🎭 Going sleepy after 2 minutes of inactivity');
      this.setState('sleepy');
    }
  }
  
  // MOUSE PROXIMITY DETECTION
  checkMouseProximity() {
    if (!this.characterElement) return;
    
    const rect = this.characterElement.getBoundingClientRect();
    const distance = Math.sqrt(
      Math.pow(this.mousePosition.x - (rect.left + rect.width / 2), 2) +
      Math.pow(this.mousePosition.y - (rect.top + rect.height / 2), 2)
    );
    
    // Hide if mouse too close (within 80px)
    if (distance < 80 && this.currentState !== 'hiding' && this.currentState !== 'hidden') {
      console.log('🎭 🐭 Mouse too close - hiding');
      this.setState('hiding');
      
      // Show again after mouse moves away
      setTimeout(() => {
        const newRect = this.characterElement.getBoundingClientRect();
        const newDistance = Math.sqrt(
          Math.pow(this.mousePosition.x - (newRect.left + newRect.width / 2), 2) +
          Math.pow(this.mousePosition.y - (newRect.top + newRect.height / 2), 2)
        );
        
        if (newDistance > 120) {
          console.log('🎭 🐭 Mouse moved away - revealing');
          this.setState('revealing');
        }
      }, 1000);
    }
  }
  
  // === COMPATIBILITY METHODS ===
  
  onInteraction(type) {
    // Compatibility method for main.js calls
    console.log(`🎭 onInteraction called: ${type}`);
    this.onUserInteraction(type);
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
    
    // Clear sleep timeout on any interaction
    if (this.sleepTimeout) {
      clearTimeout(this.sleepTimeout);
      this.sleepTimeout = null;
    }
    
    // Handle interaction types
    switch (type) {
      case 'page-focus':
        // Wake up from sleepy state
        if (this.currentState === 'sleepy') {
          this.setState('idle');
        }
        break;
        
      case 'mouse-proximity':
        // Only handle hide/reveal behavior
        this.checkMouseProximity();
        break;
        
      case 'page-load':
        // Initial page load
        console.log(`🎭 Page load interaction - triggering excited state`);
        this.executeContextualAnimation('hero');
        break;
        
      case 'navigation':
        // Navigation interactions
        console.log(`🎭 Navigation interaction`);
        this.setState('excited');
        break;
        
      case 'gallery-hover':
      case 'gallery-click':
      case 'gallery-load':
        // Gallery interactions
        if (!this.contextualAnimationActive) {
          this.setState('creating');
        }
        break;
        
      case 'menu-toggle':
        // Menu toggle
        this.setState('dancing');
        break;
    }
  }
  
  checkMouseProximity() {
    // Simple proximity check - if needed
    const rect = this.characterElement.getBoundingClientRect();
    const distance = Math.sqrt(
      Math.pow(this.mousePosition.x - (rect.left + rect.width / 2), 2) +
      Math.pow(this.mousePosition.y - (rect.top + rect.height / 2), 2)
    );
    
    if (distance < 100 && this.currentState !== 'hiding') {
      this.setState('hiding');
    } else if (distance >= 150 && this.currentState === 'hiding') {
      this.setState('revealing');
    }
  }

  // === DEBUG METHODS ===
  
  debugSetState(state) {
    console.log(`🎭 🐛 DEBUG: Manually setting state to ${state}`);
    this.setState(state, true);
  }
  
  debugInspectElement() {
    if (!this.characterElement || !this.environmentElement) {
      console.error('🎭 🐛 DEBUG: Elements not available');
      return;
    }
    
    console.log('🎭 🐛 DEBUG: Element inspection');
    console.log('  - Character element:', this.characterElement);
    console.log('  - Character classes:', this.characterElement.className);
    console.log('  - Environment element:', this.environmentElement);
    console.log('  - Environment classes:', this.environmentElement.className);
    
    const container = this.characterElement.querySelector('.mascot-container');
    if (container) {
      const computedStyle = getComputedStyle(container);
      console.log('  - Container animation:', computedStyle.animationName);
      console.log('  - Container duration:', computedStyle.animationDuration);
    }
  }
  
  debugTestAllStates() {
    const states = ['idle', 'excited', 'dancing', 'coffee', 'creating', 'thinking', 'sleepy'];
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
  
  // DEBUG: Add a method to manually test the creating animation
  testCreatingAnimation() {
    console.log('🎭 🧪 MANUAL TEST: Triggering creating animation (artistic movements + creative elements)');
    this.setState('creating');
  }
  
  testThinkingAnimation() {
    console.log('🎭 🧪 MANUAL TEST: Triggering thinking animation (contemplative pose + dark thought bubble)');
    this.setState('thinking');
  }
  
  testCoffeeAnimation() {
    console.log('🎭 🧪 MANUAL TEST: Triggering coffee animation (relaxed pose + coffee cup with steam)');
    this.setState('coffee');
  }
  
  // DEBUG: Add to window for testing
  exposeDebugMethods() {
    if (typeof window !== 'undefined') {
      window.mascotDebug = {
        testCreating: () => this.testCreatingAnimation(),
        testThinking: () => this.testThinkingAnimation(),
        testCoffee: () => this.testCoffeeAnimation(),
        currentState: () => this.currentState,
        sectionMap: this.sectionAnimationMap
      };
      console.log('🎭 🧪 Debug methods exposed: window.mascotDebug');
      console.log('🎭 🧪 - testCreating(): Artistic movements + fonts/swatches/cursor');
      console.log('🎭 🧪 - testThinking(): Contemplative pose + dark thought bubble');
      console.log('🎭 🧪 - testCoffee(): Relaxed pose + coffee cup with steam');
    }
  }
  
  // === ANIMATION VERIFICATION ===
  
  verifyAnimationState(state) {
    console.log(`🎭 🔍 Verifying animation state: ${state}`);
    console.log('  - Character element:', this.characterElement);
    console.log('  - Character classes:', this.characterElement.className);
    console.log('  - Environment element:', this.environmentElement);
    console.log('  - Environment classes:', this.environmentElement.className);
    
    const container = this.characterElement.querySelector('.mascot-container');
    if (container) {
      const computedStyle = getComputedStyle(container);
      console.log('  - Container animation:', computedStyle.animationName);
      console.log('  - Container duration:', computedStyle.animationDuration);
    }
    
    // Check if CSS is loaded
    const testElement = document.createElement('div');
    testElement.className = 'mascot-idle';
    document.body.appendChild(testElement);
    const testStyles = getComputedStyle(testElement);
    console.log('  - CSS loaded test:', testStyles.animationName || 'NO ANIMATION');
    document.body.removeChild(testElement);
  }
  
  // === UTILITY METHODS ===
  
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }
  
  // === EVENT BINDING ===
}

// INITIALIZATION AND EXPORTS

let mascotInstance = null;

export function initMascot() {
  if (mascotInstance) {
    console.log('🎭 Mascot already initialized');
    return mascotInstance;
  }
  
  console.log('🎭 Initializing Unified Mascot System...');
  mascotInstance = new UnifiedMascot();
  
  // Make available globally for debugging
  if (typeof window !== 'undefined') {
    window.mascot = mascotInstance;
    console.log('🎭 Unified Mascot available globally as window.mascot');
  }
  
  return mascotInstance;
}

// Get current mascot instance
export function getMascot() {
  return mascotInstance;
}

// Export the class for compatibility
export { UnifiedMascot as Mascot };

// Default export
export default UnifiedMascot;
