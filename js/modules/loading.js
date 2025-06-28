/**
 * Smart Cherry Blossom Loading Controller
 * Handles intelligent loading with user preferences and caching
 * @class
 */

class LoadingController {
  constructor() {
    this.loadingScreen = null;
    this.loadingText = null;
    this.progressBarFill = null;
    this.petalsContainer = null;
    this.skipButton = null;
    this.assetQueue = [];
    this.loadedAssets = 0;
    this.totalAssets = 0;
    this.isComplete = false;
    this.minLoadingTime = 2000; // Minimum loading time for first-time visitors
    this.loadingStartTime = 0;
    this.currentProgress = 0;
    this.isSkipped = false;
    
    // Smart loading preferences
    this.hasVisitedBefore = localStorage.getItem('portfolio-visited') === 'true';
    this.hasSeenThisSession = sessionStorage.getItem('loading-seen') === 'true';
    
    this.loadingMessages = [
      "Beauty is worth a brief wait...",
      "Let the blossoms fall into place...",
      "Every petal is being placed thoughtfully...",
      "Preparing your creative experience...",
      "Welcome!"
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
    
    // Create skip button for returning visitors
    this.createSkipButton();
    
    // Generate petals if they don't exist
    this.generatePetalsIfNeeded();
    
    console.log('🌸 Smart loading controller initialized', {
      hasVisitedBefore: this.hasVisitedBefore,
      hasSeenThisSession: this.hasSeenThisSession
    });
  }

  /**
   * Create skip button for returning visitors
   */
  createSkipButton() {
    if (!this.hasVisitedBefore) {
      return; // No skip button for first-time visitors
    }
    
    this.skipButton = document.createElement('button');
    this.skipButton.className = 'loading-skip-btn';
    this.skipButton.innerHTML = 'Skip intro';
    this.skipButton.setAttribute('aria-label', 'Skip loading animation');
    
    // Add to loading screen
    this.loadingScreen.appendChild(this.skipButton);
    
    // Handle skip button click
    this.skipButton.addEventListener('click', () => {
      this.skipLoading();
    });
    
    // Show skip button after 1 second
    setTimeout(() => {
      if (!this.isComplete && !this.isSkipped) {
        this.skipButton.style.opacity = '1';
        this.skipButton.style.pointerEvents = 'auto';
      }
    }, 1000);
    
    console.log('⏭️ Skip button created for returning visitor');
  }

  /**
   * Skip loading animation
   */
  skipLoading() {
    if (this.isSkipped || this.isComplete) return;
    
    this.isSkipped = true;
    console.log('⏭️ Loading skipped by user');
    
    // Fast complete
    this.updateProgress(100);
    setTimeout(() => {
      this.complete();
    }, 300);
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
   * Smart loading - decides whether to show loading based on user history
   */
  async start() {
    // Check if we should skip loading entirely
    if (this.hasSeenThisSession) {
      console.log('🏃‍♂️ Skipping loading - already seen this session');
      this.skipToComplete();
      return;
    }
    
    this.loadingStartTime = Date.now();
    this.dispatchEvent('loading:start');
    
    console.log('🚀 Starting smart loading sequence...', {
      isFirstVisit: !this.hasVisitedBefore,
      showSkipButton: this.hasVisitedBefore
    });
    
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
    
    // Only ensure minimum time for first-time visitors
    if (!this.hasVisitedBefore && !this.isSkipped) {
      await this.ensureMinimumLoadTime();
    }
    
    console.log('✅ Smart loading sequence complete');
    
    // Mark as visited and seen
    localStorage.setItem('portfolio-visited', 'true');
    sessionStorage.setItem('loading-seen', 'true');
    
    // Auto-complete
    await this.complete();
  }

  /**
   * Skip directly to complete for session-cached visitors
   */
  skipToComplete() {
    this.isComplete = true;
    document.body.classList.remove('loading');
    document.body.classList.add('loading-complete');
    this.dispatchEvent('loading:complete');
    console.log('🎉 Loading skipped - direct to portfolio');
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
    
    console.log('🎉 Loading complete - welcome to the portfolio!');
    
    // Dispatch completion event
    this.dispatchEvent('loading:complete');
  }

  showLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('loading-active');
      this.loadingScreen.setAttribute('aria-hidden', 'false');
      document.body.classList.add('loading');
      
      // Initial message
      if (this.loadingText) {
        this.loadingText.textContent = this.loadingMessages[0];
      }
      
      console.log('🌸 Loading screen shown');
    }
  }

  async hideLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('loading-fade-out');
      
      // Wait for fade out animation
      await this.delay(1000);
      
      this.loadingScreen.classList.remove('loading-active', 'loading-fade-out');
      this.loadingScreen.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('loading');
      document.body.classList.add('loading-complete');
      
      console.log('🌸 Loading screen hidden');
    }
  }

  gatherAssets() {
    this.assetQueue = [];
    
    // Gather all images
    const images = document.querySelectorAll('img[src], img[data-src]');
    images.forEach(img => {
      const src = img.getAttribute('src') || img.getAttribute('data-src');
      if (src && !src.startsWith('data:')) {
        this.assetQueue.push({
          url: src,
          type: 'image',
          element: img
        });
      }
    });
    
    // Gather CSS background images
    const elementsWithBg = document.querySelectorAll('[style*="background-image"]');
    elementsWithBg.forEach(el => {
      const style = el.getAttribute('style');
      const matches = style.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/);
      if (matches && matches[1] && !matches[1].startsWith('data:')) {
        this.assetQueue.push({
          url: matches[1],
          type: 'background',
          element: el
        });
      }
    });
    
    this.totalAssets = this.assetQueue.length;
    console.log(`📦 Gathered ${this.totalAssets} assets to preload`);
  }

  async preloadAssets() {
    if (this.totalAssets === 0) {
      console.log('📦 No assets to preload');
      return;
    }
    
    console.log(`📦 Starting preload of ${this.totalAssets} assets...`);
    
    const preloadPromises = this.assetQueue.map(asset => this.preloadAsset(asset));
    
    try {
      await Promise.allSettled(preloadPromises);
      console.log('📦 All assets preloaded');
    } catch (error) {
      console.warn('📦 Some assets failed to preload:', error);
    }
  }

  async preloadAsset(asset) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      if (asset.type === 'image') {
        const img = new Image();
        
        img.onload = () => {
          this.loadedAssets++;
          const loadTime = Date.now() - startTime;
          console.log(`✅ Loaded: ${asset.url} (${loadTime}ms)`);
          resolve();
        };
        
        img.onerror = () => {
          this.loadedAssets++;
          console.warn(`❌ Failed to load: ${asset.url}`);
          reject(new Error(`Failed to load image: ${asset.url}`));
        };
        
        img.src = asset.url;
      } else {
        // For other asset types, just resolve quickly
        this.loadedAssets++;
        resolve();
      }
    });
  }

  async simulateProgress() {
    const targetProgress = 95; // Leave 5% for final completion
    const increment = 2;
    const baseDelay = 60;
    
    for (let progress = 0; progress <= targetProgress; progress += increment) {
      if (this.isSkipped) break;
      
      const delay = baseDelay + Math.random() * 40;
      await this.delay(delay);
      this.updateProgress(progress);
    }
  }

  updateProgress(percentage) {
    this.currentProgress = Math.min(percentage, 100);
    
    if (this.progressBarFill) {
      this.progressBarFill.style.width = `${this.currentProgress}%`;
    }
    
    // Update loading message based on progress
    const messageIndex = Math.min(
      Math.floor((this.currentProgress / 100) * (this.loadingMessages.length - 1)),
      this.loadingMessages.length - 1
    );
    
    if (this.loadingText) {
      this.loadingText.textContent = this.loadingMessages[messageIndex];
    }
  }

  async ensureMinimumLoadTime() {
    const elapsed = Date.now() - this.loadingStartTime;
    const remaining = this.minLoadingTime - elapsed;
    
    if (remaining > 0) {
      console.log(`⏱️ Ensuring minimum load time: ${remaining}ms remaining`);
      await this.delay(remaining);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
    console.log(`📡 Event dispatched: ${eventName}`, detail);
  }

  /**
   * Hide petals and minimal UI elements for better browsing performance
   */
  hideForBrowsing() {
    // This method is for hiding petals during browsing, but since we removed
    // internal loading screens, we can make this a no-op or just hide petals
    console.log('📱 Optimizing for browsing performance');
    
    // If loading screen is still visible, keep it as-is
    // This method is called after loading completion for performance optimization
    if (this.petalsContainer && this.isComplete) {
      this.petalsContainer.style.display = 'none';
    }
  }

  // Simplified public API - no navigation loading
  getState() {
    return {
      isComplete: this.isComplete,
      currentProgress: this.currentProgress,
      totalAssets: this.totalAssets,
      loadedAssets: this.loadedAssets,
      hasVisitedBefore: this.hasVisitedBefore,
      hasSeenThisSession: this.hasSeenThisSession
    };
  }

  destroy() {
    // Clean up skip button
    if (this.skipButton) {
      this.skipButton.remove();
    }
    
    console.log('🌸 Loading controller destroyed');
  }
}

export default LoadingController;
