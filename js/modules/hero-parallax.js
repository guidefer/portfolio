/**
 * Hero Parallax Controller
 * Creates mouse-based parallax effects for graphics in the hero section
 */

class HeroParallaxController {
  constructor() {
    this.heroSection = null;
    this.parallaxElements = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.isInitialized = false;
    this.animationFrame = null;
    
    // Store bound resize handler for cleanup
    this.boundResizeHandler = null;
    
    // Parallax settings for different elements
    this.elementConfigs = {
      owl: {
        selector: '.parallax-owl',
        intensity: 18, // How much the element moves (pixels)
        smoothing: 0.1, // Easing factor (0.1 = smooth, 1 = instant)
        offsetX: 0, // Centered horizontally (CSS handles base centering)
        offsetY: -220 // Above the name - adjusted for smaller size
      },
      cloud1: {
        selector: '.parallax-cloud-1',
        intensity: 10,
        smoothing: 0.08,
        offsetX: 600, // Further right to avoid text overlap
        offsetY: -120 // Upper right area
      },
      cloud2: {
        selector: '.parallax-cloud-2',
        intensity: 12,
        smoothing: 0.12,
        offsetX: -600, // Further left to avoid text overlap
        offsetY: -80 // Upper left area
      },
      cloud3: {
        selector: '.parallax-cloud-3',
        intensity: 8,
        smoothing: 0.06,
        offsetX: 500, // Right side but not too far
        offsetY: 300 // Lower area well below the button
      }
    };
    
    // Delay initialization to ensure DOM is ready
    setTimeout(() => {
      this.init();
    }, 100);
  }

  init() {
    console.log('🦉 Initializing hero parallax controller...');
    
    this.heroSection = document.querySelector('.hero-section');
    
    if (!this.heroSection) {
      console.warn('Hero section not found - skipping parallax initialization');
      return;
    }

    console.log('🦉 Hero section found:', this.heroSection);

    this.createParallaxElements();
    this.setupEventListeners();
    this.startAnimation();
    
    this.isInitialized = true;
    console.log('🦉 Hero parallax controller initialized successfully');
  }

  createParallaxElements() {
    const heroContainer = this.heroSection.querySelector('.hero-container');
    
    if (!heroContainer) {
      console.warn('Hero container not found');
      return;
    }

    console.log('🦉 Creating parallax container...');

    // Create parallax container
    const parallaxContainer = document.createElement('div');
    parallaxContainer.className = 'hero-parallax-container';
    // Remove aria-hidden to prevent CSS hiding
    // parallaxContainer.setAttribute('aria-hidden', 'true'); // Decorative elements
    
    // Instead, use role="presentation" for accessibility
    parallaxContainer.setAttribute('role', 'presentation');
    
    console.log('🦉 Parallax container created, adding elements...');
    
    // Create each parallax element
    this.createParallaxElement(parallaxContainer, 'owl', 'assets/images/graphics/Owl.png', 'Decorative owl illustration');
    this.createParallaxElement(parallaxContainer, 'cloud-1', 'assets/images/graphics/Cloud-1.png', 'Decorative cloud');
    this.createParallaxElement(parallaxContainer, 'cloud-2', 'assets/images/graphics/Cloud-2.png', 'Decorative cloud');
    this.createParallaxElement(parallaxContainer, 'cloud-3', 'assets/images/graphics/Cloud-3.png', 'Decorative cloud');
    
    // Insert parallax container as first child of hero container
    heroContainer.insertBefore(parallaxContainer, heroContainer.firstChild);
    
    console.log('🦉 Parallax container inserted into DOM with', this.parallaxElements.length, 'elements');
  }

  createParallaxElement(container, name, src, alt) {
    console.log(`🖼️ Creating parallax element: ${name} with src: ${src}`);
    
    const element = document.createElement('div');
    element.className = `parallax-element parallax-${name}`;
    
    const img = document.createElement('img');
    img.src = src;
    img.alt = ''; // Empty alt for decorative images
    img.setAttribute('role', 'presentation'); // Explicitly mark as decorative
    img.loading = 'eager'; // Changed from lazy to eager for debugging
    
    // Handle image load errors gracefully
    img.onerror = () => {
      console.warn(`❌ Failed to load parallax image: ${src}`);
      element.style.display = 'none';
    };
    
    img.onload = () => {
      console.log(`✅ Loaded parallax image: ${src}`);
    };
    
    element.appendChild(img);
    container.appendChild(element);
    
    console.log(`📦 Added ${name} element to container`);
    
    // Store reference for animation
    this.parallaxElements.push({
      element,
      config: this.elementConfigs[name.replace('-', '')],
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0
    });
  }

  setupEventListeners() {
    // Mouse move for parallax effect
    this.heroSection.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });

    // Mouse leave to reset positions
    this.heroSection.addEventListener('mouseleave', () => {
      this.resetPositions();
    });

    // Handle window resize
    this.boundResizeHandler = () => {
      this.handleResize();
    };
    window.addEventListener('resize', this.boundResizeHandler);

    // Handle reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.disable();
    }
  }

  handleMouseMove(event) {
    const rect = this.heroSection.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate mouse position relative to center (-1 to 1)
    this.mouseX = (event.clientX - rect.left - centerX) / centerX;
    this.mouseY = (event.clientY - rect.top - centerY) / centerY;
    
    // Clamp values to prevent extreme movements
    this.mouseX = Math.max(-1, Math.min(1, this.mouseX));
    this.mouseY = Math.max(-1, Math.min(1, this.mouseY));
    
    // Update target positions for all elements
    this.updateTargetPositions();
  }

  updateTargetPositions() {
    this.parallaxElements.forEach(item => {
      if (!item.config) return;
      
      // Calculate target position based on mouse and intensity
      item.targetX = this.mouseX * item.config.intensity;
      item.targetY = this.mouseY * item.config.intensity;
    });
  }

  resetPositions() {
    this.parallaxElements.forEach(item => {
      item.targetX = 0;
      item.targetY = 0;
    });
  }

  startAnimation() {
    const animate = () => {
      this.updateElementPositions();
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }

  updateElementPositions() {
    this.parallaxElements.forEach(item => {
      if (!item.config || !item.element) return;
      
      // Smooth interpolation to target position
      item.currentX += (item.targetX - item.currentX) * item.config.smoothing;
      item.currentY += (item.targetY - item.currentY) * item.config.smoothing;
      
      // Apply transform with initial offset
      const finalX = item.config.offsetX + item.currentX;
      const finalY = item.config.offsetY + item.currentY;
      
      item.element.style.transform = `translate(${finalX}px, ${finalY}px)`;
    });
  }

  handleResize() {
    // Reset positions on resize to prevent layout issues
    this.resetPositions();
  }

  disable() {
    // Disable parallax for users who prefer reduced motion
    this.parallaxElements.forEach(item => {
      if (item.element) {
        item.element.style.transform = `translate(${item.config.offsetX}px, ${item.config.offsetY}px)`;
      }
    });
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  destroy() {
    // Remove resize listener
    if (this.boundResizeHandler) {
      window.removeEventListener('resize', this.boundResizeHandler);
      this.boundResizeHandler = null;
    }
    
    // Cancel animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Remove parallax container
    const parallaxContainer = this.heroSection?.querySelector('.hero-parallax-container');
    if (parallaxContainer) {
      parallaxContainer.remove();
    }
    
    // Reset state
    this.parallaxElements = [];
    this.isInitialized = false;
    this.heroSection = null;
    this.mouseX = 0;
    this.mouseY = 0;
  }
}

export default HeroParallaxController;
