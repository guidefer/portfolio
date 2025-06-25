/**
 * Cherry Blossom Loading Controller
 * Handles asset preloading and beautiful cherry blossom loading screen
 * Enhanced with pause/resume functionality for internal navigation
 */

class LoadingController {
  constructor() {
    this.loadingScreen = null;
    this.loadingText = null;
    this.progressBarFill = null;
    this.petalsContainer = null;
    this.assetQueue = [];
    this.loadedAssets = 0;
    this.totalAssets = 0;
    this.isComplete = false;
    this.navigationTriggered = false; // Track if navigation has been triggered
    this.minLoadingTime = 2000; // Reduced to 2 seconds for better UX
    this.loadingStartTime = 0;
    this.currentProgress = 0;
    this.isInitialLoad = true; // Track if this is the first load
    this.petalsPaused = false; // Track petal animation state
    this.petalsHidden = false; // Track petal visibility state
    
    this.loadingMessages = [
      "Loading portfolio...",
      "Preparing gallery...",
      "Setting up animations...",
      "Almost ready...",
      "Welcome!"
    ];

    this.navigationMessages = [
      "Loading...",
      "Preparing content...",
      "Almost ready..."
    ];
    
    this.init();
  }

  init() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingText = document.getElementById('loading-text');
    this.progressBarFill = document.getElementById('loading-bar-fill');
    this.petalsContainer = document.querySelector('.petals-container');
    
    if (!this.loadingScreen) {
      console.warn('Loading screen not found - skipping loading sequence');
      return;
    }
    
    // Generate petals if they don't exist
    this.generatePetalsIfNeeded();
    
    console.log('🌸 Cherry blossom loading controller initialized');
  }

  /**
   * Generate petals if the container is empty
   */
  generatePetalsIfNeeded() {
    if (!this.petalsContainer) {
      console.warn('Petals container not found');
      return;
    }
    
    // Check if petals already exist (from HTML)
    const existingPetals = this.petalsContainer.querySelectorAll('.petal');
    if (existingPetals.length > 0) {
      console.log(`🌸 Found ${existingPetals.length} existing petals`);
      return;
    }
    
    // Generate 50 petals with different animations
    console.log('🌸 Generating petals for loading screen...');
    for (let i = 0; i < 50; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal';
      
      // Random positioning and timing
      petal.style.left = Math.random() * 100 + '%';
      petal.style.animationDelay = Math.random() * 10 + 's';
      petal.style.animationDuration = (8 + Math.random() * 4) + 's';
      
      // Random animation type
      const animations = ['fall-and-drift', 'fall-medium-wind', 'fall-slow-wind', 'fall-tree-burst'];
      petal.style.animationName = animations[Math.floor(Math.random() * animations.length)];
      
      this.petalsContainer.appendChild(petal);
    }
    
    console.log('🌸 Generated 50 petals for loading screen');
  }

  /**
   * Standard loading for initial page load
   */
  async start() {
    this.isInitialLoad = true;
    this.loadingStartTime = Date.now();
    this.dispatchEvent('loading:start');
    
    console.log('🚀 Starting cherry blossom loading sequence...');
    
    // Show loading screen
    this.showLoadingScreen();
    
    // Start progress simulation
    const progressPromise = this.simulateProgress();
    
    // Gather all assets to preload
    this.gatherAssets();
    
    // Start preloading assets in parallel
    const preloadPromise = this.preloadAssets();
    
    // Wait for both progress and preloading to complete
    await Promise.all([progressPromise, preloadPromise]);
    
    // Ensure minimum loading time has passed for cherry blossom enjoyment
    await this.ensureMinimumLoadTime();
    
    console.log('✅ Cherry blossom loading sequence complete');
    
    // Auto-complete when timing is right (not when modules are ready)
    await this.complete();
  }

  /**
   * Lightweight loading for internal navigation
   * Reuses existing petals and has faster transitions
   */
  async startNavigation(targetUrl = null) {
    console.log('🔄 Starting LIGHTWEIGHT navigation loading sequence...');
    console.log('📊 Current state before navigation:', this.getState());
    
    // IMPORTANT: Only do navigation loading if initial load is complete
    if (!this.isComplete) {
      console.warn('⚠️ Initial load not complete yet, skipping navigation loading');
      return;
    }
    
    // DON'T reset isComplete to false - this prevents full loading
    this.navigationTriggered = false;
    this.currentProgress = 0;
    
    // Ensure petals exist but DON'T regenerate them
    if (!this.petalsContainer || this.petalsContainer.children.length === 0) {
      this.generatePetalsIfNeeded();
    }
    
    // Resume petals from their current position (no restart)
    console.log('🌸 Resuming petals from current position...');
    this.resumePetals();
    
    // Show navigation loading screen (faster) - only for completed sites
    this.showNavigationLoadingScreen();
    
    // Short delay to ensure loading screen is visible
    await this.delay(50); // Reduced delay
    
    console.log('📊 State after resuming petals:', this.getState());
    
    // MUCH faster progress simulation for navigation
    const progressPromise = this.simulateNavigationProgress();
    
    // Wait for progress to complete
    await progressPromise;
    
    // Very short minimum time for navigation
    await this.delay(200); // Much shorter
    
    console.log('✅ LIGHTWEIGHT navigation loading sequence complete');
    
    // Complete navigation loading
    await this.completeNavigation();
  }

  /**
   * Pause petals animation to save resources
   */
  pausePetals() {
    if (this.loadingScreen && !this.petalsPaused) {
      this.loadingScreen.classList.add('petals-paused');
      this.petalsPaused = true;
      console.log('⏸️ Petals animation paused');
    }
  }

  /**
   * Hide petals completely while preserving their animation positions
   */
  hidePetals() {
    if (this.loadingScreen && !this.petalsHidden) {
      this.loadingScreen.classList.add('petals-hidden');
      this.petalsHidden = true;
      // Also pause when hidden to save resources
      if (!this.petalsPaused) {
        this.loadingScreen.classList.add('petals-paused');
        this.petalsPaused = true;
      }
      console.log('👻 Petals hidden and paused');
    }
  }

  /**
   * Resume petals animation and visibility WITHOUT restarting animations
   */
  resumePetals() {
    if (this.loadingScreen) {
      // Remove paused and hidden states
      this.loadingScreen.classList.remove('petals-paused', 'petals-hidden');
      
      // Add resume class for smooth transition
      this.loadingScreen.classList.add('petals-resumed');
      
      // Update state tracking
      this.petalsPaused = false;
      this.petalsHidden = false;
      
      // Remove resume class after transition to clean up
      setTimeout(() => {
        if (this.loadingScreen && this.loadingScreen.classList.contains('petals-resumed')) {
          this.loadingScreen.classList.remove('petals-resumed');
        }
      }, 400);
      
      console.log('▶️ Petals animation resumed from current position');
    }
  }

  /**
   * Show loading screen for navigation with faster styling
   */
  showNavigationLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('loading-active', 'navigation-loading');
      this.loadingScreen.setAttribute('aria-hidden', 'false');
      document.body.classList.add('loading');
      document.body.classList.remove('loading-complete');
      console.log('🔄 Navigation loading screen shown');
    }
  }

  /**
   * Faster progress simulation for navigation
   */
  async simulateNavigationProgress() {
    return new Promise((resolve) => {
      let progress = 0;
      const progressInterval = setInterval(() => {
        // Much faster increments for navigation
        progress += Math.random() * 40 + 20; // 20-60% increments
        
        if (progress >= 100) {
          this.currentProgress = 100;
          clearInterval(progressInterval);
          console.log('📊 FAST navigation progress simulation complete');
          resolve();
        }
        
        this.updateNavigationProgress(progress);
        
      }, 50 + Math.random() * 50); // Very fast: 50-100ms intervals
    });
  }

  /**
   * Update progress for navigation with different messages
   */
  updateNavigationProgress(progress) {
    progress = Math.min(100, Math.max(0, progress));
    
    if (this.progressBarFill) {
      this.progressBarFill.style.width = progress + '%';
    }
    
    // Use navigation-specific messages
    const messageIndex = Math.floor((progress / 100) * (this.navigationMessages.length - 1));
    if (this.loadingText && this.navigationMessages[messageIndex]) {
      this.loadingText.textContent = this.navigationMessages[messageIndex];
    }
    
    // Trigger navigation completion when progress reaches 100%
    if (progress >= 100 && !this.navigationTriggered) {
      this.navigationTriggered = true;
      console.log('🎯 Navigation progress complete');
    }
  }

  /**
   * Complete navigation loading
   */
  async completeNavigation() {
    // DON'T check isComplete - allow navigation to complete even if main loading is done
    
    this.updateNavigationProgress(100);
    
    await this.delay(100); // Very brief pause
    
    // Hide loading screen
    await this.hideNavigationLoadingScreen();
    
    // Pause petals after navigation to save resources
    setTimeout(() => this.pausePetals(), 1000);
    
    this.dispatchEvent('navigation:complete');
    console.log('🎉 LIGHTWEIGHT navigation loading complete');
  }

  /**
   * Hide navigation loading screen
   */
  async hideNavigationLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('loading-fade-out');
      
      // Much faster fade out for navigation
      await this.delay(200); // Reduced from 400ms
      
      this.loadingScreen.classList.remove('loading-active', 'navigation-loading', 'loading-fade-out');
      this.loadingScreen.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('loading');
      document.body.classList.add('loading-complete');
      
      console.log('🔄 FAST navigation loading screen hidden');
    }
  }

  /**
   * Preload navigation-specific assets
   */
  async preloadNavigationAssets(targetUrl) {
    // This could fetch and preload specific assets for the target page
    console.log(`🔄 Preloading assets for: ${targetUrl}`);
    // Implementation depends on your routing system
  }

  async complete() {
    if (this.isComplete) return;
    
    this.isComplete = true;
    
    // Don't allow external complete() calls to bypass our timing
    console.log('🎬 Loading complete requested');
    
    this.updateProgress(100);
    
    await this.delay(800); // Brief pause at 100% to enjoy the completion
    
    // Hide loading screen with animation
    await this.hideLoadingScreen();
    
    this.dispatchEvent('loading:complete');
    console.log('🎉 Loading complete - portfolio revealed');
  }

  showLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('loading-active');
      this.loadingScreen.setAttribute('aria-hidden', 'false');
      document.body.classList.add('loading');
      document.body.classList.remove('loading-complete');
    }
  }

  async hideLoadingScreen() {
    if (!this.loadingScreen) {
      // If no loading screen, just ensure content is visible
      document.body.classList.remove('loading');
      document.body.classList.add('loading-complete');
      return;
    }
    
    return new Promise((resolve) => {
      // Set up animation end listener for header to reset z-index
      const header = document.querySelector('.header');
      if (header) {
        const handleAnimationEnd = () => {
          console.log('🎭 Navigation slide-down animation complete');
          header.classList.add('slidedown-complete');
          header.removeEventListener('animationend', handleAnimationEnd);
        };
        header.addEventListener('animationend', handleAnimationEnd);
      }
      
      // Start fade out - navigation was already triggered when progress hit 100%
      this.loadingScreen.classList.add('loading-fade-out');
      console.log('🌸 Loading screen fade out started - navigation already triggered by progress bar');
      
      // Complete cleanup when transition fully ends
      setTimeout(() => {
        console.log('� Loading screen fade complete - final cleanup');
        
        // Remove loading screen from DOM and drop z-index
        this.loadingScreen.classList.remove('loading-active');
        this.loadingScreen.setAttribute('aria-hidden', 'true');
        this.loadingScreen.style.zIndex = '-1';
        
        resolve();
      }, 1000); // Full 1s transition duration
    });
  }

  async simulateProgress() {
    return new Promise((resolve) => {
      const progressInterval = setInterval(() => {
        // Simulate realistic loading progression - slower increments
        const increment = Math.random() * 2 + 0.5; // Random 0.5-2.5% increments (slower)
        this.currentProgress += increment;
        
        console.log(`📊 Progress: ${Math.round(this.currentProgress)}%`);
        
        if (this.currentProgress >= 100) {
          this.currentProgress = 100;
          clearInterval(progressInterval);
          console.log('📊 Progress simulation complete - reached 100%');
          resolve();
        }
        
        this.updateProgress(this.currentProgress);
        
      }, 200 + Math.random() * 150); // Faster timing: 200-350ms intervals
    });
  }

  updateProgress(progress) {
    progress = Math.min(100, Math.max(0, progress));
    
    if (this.progressBarFill) {
      this.progressBarFill.style.width = progress + '%';
      console.log(`🎯 Visual progress bar updated: ${Math.round(progress)}%`);
    }
    
    // Update loading text based on progress
    const messageIndex = Math.floor((progress / 100) * (this.loadingMessages.length - 1));
    if (this.loadingText && this.loadingMessages[messageIndex]) {
      this.loadingText.textContent = this.loadingMessages[messageIndex];
    }
    
    // TRIGGER NAVIGATION EXACTLY WHEN PROGRESS REACHES 100%
    if (progress >= 100 && !this.navigationTriggered) {
      this.navigationTriggered = true;
      console.log('🎯 Progress bar reached 100% - triggering navigation NOW!');
      
      // Trigger navigation immediately when progress hits 100%
      document.body.classList.remove('loading');
      document.body.classList.add('loading-complete');
      console.log('🚀 Added loading-complete class - navigation ready');
      
      // Dispatch event for module initialization
      this.dispatchEvent('progress:complete');
    }
  }

  gatherAssets() {
    this.assetQueue = [];
    
    // Hero section images
    const heroImages = this.findImageAssets('.hero-section img');
    this.assetQueue.push(...heroImages);
    
    // Gallery placeholder/critical images
    const galleryImages = this.findImageAssets('.gallery-grid img');
    this.assetQueue.push(...galleryImages.slice(0, 6)); // Only first 6 for initial load
    
    // Icon and logo assets
    const iconAssets = this.findImageAssets('[src*="icon"], [src*="logo"]');
    this.assetQueue.push(...iconAssets);
    
    // Add some simulated assets for realistic loading
    this.assetQueue.push(
      { type: 'script', src: 'js/main.js', critical: true },
      { type: 'style', src: 'css/main.css', critical: true },
      { type: 'font', src: 'fonts/system', critical: true }
    );
    
    this.totalAssets = this.assetQueue.length;
    console.log(`📦 Found ${this.totalAssets} assets to preload`);
  }

  findImageAssets(selector) {
    const images = document.querySelectorAll(selector);
    return Array.from(images).map(img => ({
      type: 'image',
      src: img.src || img.dataset.src || img.getAttribute('src'),
      element: img,
      critical: img.classList.contains('critical')
    })).filter(asset => asset.src);
  }

  async preloadAssets() {
    if (this.assetQueue.length === 0) {
      console.log('📦 No assets to preload');
      return;
    }
    
    console.log(`🔄 Preloading ${this.assetQueue.length} assets...`);
    
    const preloadPromises = this.assetQueue.map((asset, index) => 
      this.preloadAsset(asset, index)
    );
    
    await Promise.allSettled(preloadPromises);
  }

  async preloadAsset(asset, index) {
    try {
      if (asset.type === 'image') {
        await this.preloadImage(asset.src);
      } else {
        // Simulate loading time for other asset types
        await this.delay(this.getSimulatedLoadTime(asset.type));
      }
      
      this.onAssetLoaded(asset, index);
    } catch (error) {
      console.warn(`⚠️ Failed to load asset: ${asset.src}`, error);
      this.onAssetLoaded(asset, index); // Continue anyway
    }
  }

  getSimulatedLoadTime(type) {
    const times = {
      'script': 200 + Math.random() * 300,
      'style': 100 + Math.random() * 200,
      'font': 150 + Math.random() * 250,
      'data': 50 + Math.random() * 100
    };
    return times[type] || 100;
  }

  onAssetLoaded(asset, index) {
    this.loadedAssets++;
    const progress = (this.loadedAssets / this.totalAssets) * 100;
    
    console.log(`✅ Loaded asset ${index + 1}/${this.totalAssets}: ${asset.src}`);
    
    // Assets contribute to overall progress but progress simulation handles display
  }

  async ensureMinimumLoadTime() {
    const elapsed = Date.now() - this.loadingStartTime;
    if (elapsed < this.minLoadingTime) {
      const remaining = this.minLoadingTime - elapsed;
      console.log(`⏱️ Waiting ${remaining}ms more for cherry blossom enjoyment...`);
      await this.delay(remaining);
    }
  }

  /**
   * Public method to hide petals when page is fully loaded and user is browsing
   */
  hideForBrowsing() {
    if (!this.isInitialLoad) {
      this.hidePetals();
      console.log('🌸 Petals hidden for browsing - ready for quick navigation');
    }
  }

  /**
   * Public method to check if petals are ready for quick navigation
   */
  isPetalsReady() {
    return this.isComplete && (this.petalsHidden || this.petalsPaused || this.isInitialLoad === false);
  }

  /**
   * Public method to get loading state information
   */
  getState() {
    return {
      isInitialLoad: this.isInitialLoad,
      petalsPaused: this.petalsPaused,
      petalsHidden: this.petalsHidden,
      isComplete: this.isComplete
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }
}

// Export for module system
export default LoadingController;
