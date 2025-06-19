/**
 * Loading Controller
 * Handles asset preloading and loading screen animations
 */

class LoadingController {
  constructor() {
    this.loadingScreen = null;
    this.loadingText = null;
    this.progressBar = null;
    this.assetQueue = [];
    this.loadedAssets = 0;
    this.totalAssets = 0;
    this.isComplete = false;
    this.minLoadingTime = 2000; // Minimum 2 seconds for smooth experience
    this.loadingStartTime = 0;
    
    this.init();
  }

  init() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingText = this.loadingScreen?.querySelector('.loading-text');
    
    if (!this.loadingScreen) {
      console.warn('Loading screen not found - skipping loading sequence');
      return;
    }
    
    this.createProgressBar();
    console.log('⏳ Loading controller initialized');
  }

  createProgressBar() {
    // Create progress bar element
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'loading-progress';
    this.progressBar.innerHTML = `
      <div class="loading-progress-bar">
        <div class="loading-progress-fill"></div>
      </div>
      <div class="loading-percentage">0%</div>
    `;
    
    const loadingContent = this.loadingScreen.querySelector('.loading-content');
    if (loadingContent) {
      loadingContent.appendChild(this.progressBar);
    }
  }

  async start() {
    this.loadingStartTime = Date.now();
    this.dispatchEvent('loading:start');
    
    console.log('🚀 Starting loading sequence...');
    
    // Show loading screen
    this.showLoadingScreen();
    
    // Gather all assets to preload
    this.gatherAssets();
    
    // Start preloading
    await this.preloadAssets();
    
    // Ensure minimum loading time has passed
    await this.ensureMinimumLoadTime();
    
    console.log('✅ Loading sequence complete');
  }

  async complete() {
    if (this.isComplete) return;
    
    this.isComplete = true;
    this.updateProgress(100);
    
    await this.delay(500); // Brief pause at 100%
    
    // Hide loading screen with animation
    await this.hideLoadingScreen();
    
    this.dispatchEvent('loading:complete');
    console.log('🎉 Loading complete - content revealed');
  }

  showLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.style.display = 'flex';
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
      this.loadingScreen.classList.add('loading-fade-out');
      
      setTimeout(() => {
        this.loadingScreen.style.display = 'none';
        this.loadingScreen.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('loading');
        document.body.classList.add('loading-complete');
        resolve();
      }, 800); // Match CSS animation duration
    });
  }

  gatherAssets() {
    this.assetQueue = [];
    
    // Critical CSS files (already loaded via <link> tags)
    // We'll just simulate their loading
    
    // JavaScript modules (already loading)
    // We'll just simulate their loading
    
    // Hero section images
    const heroImages = this.findImageAssets('.hero-section img');
    this.assetQueue.push(...heroImages);
    
    // Gallery placeholder/critical images
    const galleryImages = this.findImageAssets('.gallery-grid img');
    this.assetQueue.push(...galleryImages.slice(0, 6)); // Only first 6 for initial load
    
    // Icon and logo assets
    const iconAssets = this.findImageAssets('[src*="icon"], [src*="logo"]');
    this.assetQueue.push(...iconAssets);
    
    // Critical background images from CSS
    const bgImages = this.findBackgroundImages();
    this.assetQueue.push(...bgImages);
    
    // Add some simulated assets for demo purposes
    this.assetQueue.push(
      { type: 'script', url: 'js/main.js' },
      { type: 'style', url: 'css/main.css' },
      { type: 'font', url: 'System Fonts' },
      { type: 'data', url: 'Portfolio Data' }
    );
    
    this.totalAssets = this.assetQueue.length;
    console.log(`📦 Found ${this.totalAssets} assets to preload`);
  }

  findImageAssets(selector) {
    const images = document.querySelectorAll(selector);
    return Array.from(images).map(img => ({
      type: 'image',
      url: img.src || img.getAttribute('data-src'),
      element: img
    })).filter(asset => asset.url);
  }

  findBackgroundImages() {
    // This would normally parse CSS for background-image URLs
    // For now, return empty array
    return [];
  }

  async preloadAssets() {
    const loadPromises = this.assetQueue.map((asset, index) => 
      this.preloadAsset(asset, index)
    );
    
    try {
      await Promise.all(loadPromises);
    } catch (error) {
      console.warn('Some assets failed to load:', error);
    }
  }

  async preloadAsset(asset, index) {
    return new Promise((resolve) => {
      // Simulate loading time based on asset type
      const loadTime = this.getSimulatedLoadTime(asset.type);
      
      setTimeout(() => {
        this.onAssetLoaded(asset, index);
        resolve();
      }, loadTime);
    });
  }

  getSimulatedLoadTime(type) {
    const baseTimes = {
      image: 300,
      script: 200,
      style: 150,
      font: 400,
      data: 100
    };
    
    const baseTime = baseTimes[type] || 200;
    // Add random variation
    return baseTime + Math.random() * 200;
  }

  onAssetLoaded(asset, index) {
    this.loadedAssets++;
    const progress = Math.round((this.loadedAssets / this.totalAssets) * 100);
    
    this.updateProgress(progress);
    this.updateLoadingText(asset);
    
    console.log(`📁 Loaded ${asset.type}: ${asset.url} (${this.loadedAssets}/${this.totalAssets})`);
  }

  updateProgress(percentage) {
    if (!this.progressBar) return;
    
    const progressFill = this.progressBar.querySelector('.loading-progress-fill');
    const progressText = this.progressBar.querySelector('.loading-percentage');
    
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${percentage}%`;
    }
    
    // Update ARIA attributes for accessibility
    this.loadingScreen?.setAttribute('aria-valuenow', percentage.toString());
  }

  updateLoadingText(asset) {
    if (!this.loadingText) return;
    
    const messages = {
      image: 'Loading images...',
      script: 'Loading scripts...',
      style: 'Loading styles...',
      font: 'Loading fonts...',
      data: 'Loading content...'
    };
    
    const message = messages[asset.type] || 'Loading...';
    this.loadingText.textContent = message;
  }

  async ensureMinimumLoadTime() {
    const elapsedTime = Date.now() - this.loadingStartTime;
    const remainingTime = this.minLoadingTime - elapsedTime;
    
    if (remainingTime > 0) {
      console.log(`⏱️ Waiting ${remainingTime}ms to ensure smooth loading experience`);
      await this.delay(remainingTime);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simulate loading for specific asset types
  async preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  async preloadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => resolve(script);
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      script.src = src;
      // Don't actually append to avoid duplicate loading
      resolve(script);
    });
  }

  // Public API methods
  setProgress(percentage) {
    this.updateProgress(Math.min(100, Math.max(0, percentage)));
  }

  setLoadingText(text) {
    if (this.loadingText) {
      this.loadingText.textContent = text;
    }
  }

  addAsset(asset) {
    this.assetQueue.push(asset);
    this.totalAssets++;
  }

  // Event system
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  // Cleanup
  destroy() {
    this.loadingScreen = null;
    this.loadingText = null;
    this.progressBar = null;
    this.assetQueue = [];
    
    console.log('⏳ Loading controller destroyed');
  }
}

export default LoadingController;
