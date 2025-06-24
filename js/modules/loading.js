/**
 * Cherry Blossom Loading Controller
 * Handles asset preloading and beautiful cherry blossom loading screen
 */

class LoadingController {
  constructor() {
    this.loadingScreen = null;
    this.loadingText = null;
    this.progressBarFill = null;
    this.assetQueue = [];
    this.loadedAssets = 0;
    this.totalAssets = 0;
    this.isComplete = false;
    this.navigationTriggered = false; // Track if navigation has been triggered
    this.minLoadingTime = 2000; // Reduced to 2 seconds for better UX
    this.loadingStartTime = 0;
    this.currentProgress = 0;
    
    this.loadingMessages = [
      "Loading portfolio...",
      "Preparing gallery...",
      "Setting up animations...",
      "Almost ready...",
      "Welcome!"
    ];
    
    this.init();
  }

  init() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingText = document.getElementById('loading-text');
    this.progressBarFill = document.getElementById('loading-bar-fill');
    
    if (!this.loadingScreen) {
      console.warn('Loading screen not found - skipping loading sequence');
      return;
    }
    
    console.log('🌸 Cherry blossom loading controller initialized');
  }

  async start() {
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
