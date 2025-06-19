# Portfolio Website Project Plan

**Project Name:** Minimalist Portfolio Website  
**Date Created:** June 17, 2025  
**Technology Stack:** HTML5, CSS3, ES6 JavaScript (Modular)  
**Approach:** Mobile-First, Progressive Enhancement  

---

## 🎯 Project Overview

A minimalist portfolio website focusing on content presentation through a clean, dynamic interface. The site will feature a homepage with a header section and thumbnail gallery, with individual pages for detailed content exploration.

### Core Principles
- **Minimalist Design:** Clean, content-focused aesthetic
- **Mobile-First:** Responsive design starting from mobile breakpoints
- **Modular Architecture:** ES6 modules for maintainable JavaScript
- **Easy Content Management:** Simple structure for adding new portfolio pieces
- **Performance-Focused:** Fast loading, optimized assets

---

## 🏗️ Technical Architecture

### Frontend Stack
- **HTML5:** Semantic markup with accessibility considerations
- **CSS3:** Modern CSS with Grid, Flexbox, and CSS Variables
- **ES6 JavaScript:** Modular architecture with import/export
- **No Framework:** Vanilla JS for lightweight performance

### Build Approach
- **No Build Process Initially:** Direct ES6 modules (supported in modern browsers)
- **Future Enhancement:** Optional Vite setup for optimization if needed

---

## 📁 Proposed Folder Structure

```
portfolio/
├── index.html                 # Homepage
├── css/
│   ├── main.css              # Main stylesheet
│   ├── components/           # Component-specific styles
│   │   ├── header.css
│   │   ├── gallery.css
│   │   ├── navigation.css
│   │   └── portfolio-item.css
│   └── utilities/            # Utility classes
│       ├── reset.css
│       ├── variables.css
│       └── responsive.css
├── js/
│   ├── main.js               # Main application entry point
│   ├── modules/              # ES6 modules
│   │   ├── gallery.js        # Gallery functionality
│   │   ├── navigation.js     # Navigation handling
│   │   ├── modal.js          # Modal/lightbox functionality
│   │   ├── lazy-loading.js   # Image lazy loading
│   │   └── utils.js          # Utility functions
│   └── config/
│       └── portfolio-data.js # Portfolio content configuration
├── assets/
│   ├── images/
│   │   ├── thumbnails/       # Gallery thumbnail images
│   │   ├── portfolio/        # Full-size portfolio images
│   │   └── graphics/         # Header graphics, icons, etc.
│   ├── videos/               # Video content
│   └── documents/            # PDFs, downloadable content
├── pages/                    # Individual portfolio pages
│   ├── project-1/
│   │   ├── index.html
│   │   ├── images/
│   │   └── videos/
│   ├── project-2/
│   │   └── index.html
│   └── [template]/           # Template for new pages
│       └── index.html
├── components/               # Reusable HTML components
│   ├── header.html
│   ├── navigation.html
│   └── footer.html
└── docs/
    ├── PROJECT-PLAN.md       # This file
    ├── CONTENT-GUIDE.md      # Guide for adding new content
    └── DEVELOPMENT-NOTES.md  # Development notes and decisions
```

---

## 🎨 Design System Specification

### Color Palette (Guilherme's Specification)
```css
:root {
  /* Base Colors */
  --color-background: #ffffff;   /* Pure white - primary background */
  --color-primary: #333333;      /* Dark gray - main text and black elements */
  --color-secondary: #C8C8BC;    /* Light gray-beige - separations, menu backgrounds */
  --color-tertiary: #808080;     /* Medium gray - subtitles, secondary text */
  
  /* Accent Colors */
  --color-accent-yellow: #EBC533; /* Yellow - hover, active, highlights */
  --color-accent-orange: #D66422; /* Orange - hover, active, highlights */
  
  /* Interactive States */
  --color-hover-yellow: rgba(235, 197, 51, 0.8);   /* Yellow with transparency */
  --color-hover-orange: rgba(214, 100, 34, 0.8);   /* Orange with transparency */
  --color-active-yellow: #EBC533;
  --color-active-orange: #D66422;
  
  /* Component Specific */
  --thumbnail-hover: rgba(235, 197, 51, 0.3);      /* Subtle yellow overlay */
  --thumbnail-active: rgba(214, 100, 34, 0.3);     /* Subtle orange overlay */
  --separator-color: var(--color-secondary);        /* #C8C8BC for dividers */
  --menu-background: var(--color-secondary);        /* #C8C8BC for menu backgrounds */
}
```

### Color Usage Strategy
Following the minimalist approach, the color application will be:

**Primary Usage (90% of site):**
- **Background:** Pure white (#ffffff) for maximum content focus
- **Text:** Dark gray (#333333) for optimal readability
- **Separators/Structure:** Light gray-beige (#C8C8BC) for subtle divisions

**Secondary Usage (8% of site):**
- **Subtitles/Meta:** Medium gray (#808080) for hierarchy
- **Menu backgrounds:** Light gray-beige (#C8C8BC) for context

**Accent Usage (2% of site):**
- **Interactive highlights:** Yellow (#EBC533) and Orange (#D66422)
- **Thumbnail overlays:** Transparent versions of accent colors
- **Call-to-action elements:** Strategic accent placement

This restrained color palette ensures the content remains the primary focus while providing enough visual interest through the accent colors and mascot animation.

### Typography Scale
```css
:root {
  /* Font Families */
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-display: Georgia, 'Times New Roman', serif; /* For name/title */
  
  /* Font Sizes (Mobile First) */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### Spacing System
```css
:root {
  /* Spacing Scale */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
  
  /* Layout Specific */
  --container-padding: var(--space-md);
  --section-spacing: var(--space-2xl);
  --grid-gap: var(--space-lg);
}
```

### Responsive Breakpoints
```css
:root {
  /* Breakpoints */
  --bp-sm: 640px;    /* Small devices */
  --bp-md: 768px;    /* Medium devices */
  --bp-lg: 1024px;   /* Large devices */
  --bp-xl: 1280px;   /* Extra large devices */
}
```

---

## 📱 Mobile-First Responsive Strategy

### Breakpoint Strategy
1. **Mobile (Default):** 320px - 639px
   - Single column layout
   - Stacked navigation
   - Touch-optimized gallery grid (2x2 or 2x3)

2. **Tablet (640px+):** 640px - 1023px
   - Two-column potential for some sections
   - Horizontal navigation
   - Gallery grid (3x3 or 4x3)

3. **Desktop (1024px+):** 1024px+
   - Multi-column layouts
   - Hover interactions
   - Larger gallery grid (4x4 or more)

### Touch Interaction Considerations
- Minimum 44px touch targets
- Swipe gestures for gallery navigation
- Touch-friendly hover states (tap to activate)
- Scroll-based animations and reveals

---

## 🎭 Pixel Art Mascot System (8-bit Interactive Character)

### Character Concept
A pixel art 8-bit mascot with multiple behavioral states and interactive responses. The character remains fixed on screen (absolute positioning) and reacts to user interactions through body language animations.

### Positioning & Behavior
```css
/* Fixed Mascot Positioning */
.character-mascot {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 64px;
  height: 64px;
  z-index: 1000;
  pointer-events: none; /* Allow clicks through mascot */
  transition: transform 0.3s ease-out;
}

/* Responsive positioning */
@media (max-width: 640px) {
  .character-mascot {
    width: 48px;
    height: 48px;
    bottom: 15px;
    right: 15px;
  }
}
```

### Animation States & Behaviors

#### 1. **Idle State** (Default)
```css
.mascot-idle {
  animation: pixel-breathe 3s ease-in-out infinite;
}

@keyframes pixel-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
```

#### 2. **Resting State** (After period of inactivity)
```css
.mascot-resting {
  animation: pixel-sleep 4s ease-in-out infinite;
}

@keyframes pixel-sleep {
  0%, 80%, 100% { transform: translateY(0px) scaleY(1); }
  85%, 95% { transform: translateY(2px) scaleY(0.9); }
}
```

#### 3. **Excited State** (On page interactions)
```css
.mascot-excited {
  animation: pixel-bounce 0.8s ease-out;
}

@keyframes pixel-bounce {
  0% { transform: translateY(0px); }
  30% { transform: translateY(-8px) scaleX(1.1); }
  60% { transform: translateY(-4px) scaleX(0.95); }
  100% { transform: translateY(0px) scaleX(1); }
}
```

#### 4. **Walking Around** (Periodic movement)
```css
.mascot-walking {
  animation: pixel-walk 6s linear;
}

@keyframes pixel-walk {
  0% { right: 20px; transform: scaleX(1); }
  25% { right: 50%; transform: scaleX(-1); }
  50% { right: calc(100% - 84px); transform: scaleX(-1); }
  75% { right: 50%; transform: scaleX(1); }
  100% { right: 20px; transform: scaleX(1); }
}
```

#### 5. **Hide State** (Mouse proximity detection)
```css
.mascot-hiding {
  animation: pixel-hide 0.5s ease-in forwards;
}

.mascot-revealing {
  animation: pixel-reveal 0.8s ease-out forwards;
}

@keyframes pixel-hide {
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(0.5) rotate(180deg); opacity: 0.5; }
  100% { transform: scale(0) rotate(360deg); opacity: 0; }
}

@keyframes pixel-reveal {
  0% { transform: scale(0) rotate(-360deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(-180deg); opacity: 0.8; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
```

### Interactive Triggers
```javascript
// Mouse proximity detection
const HIDE_DISTANCE = 100; // pixels
const REVEAL_DELAY = 2000; // milliseconds

// Behavioral state management
const mascotStates = {
  idle: 'mascot-idle',
  resting: 'mascot-resting',
  excited: 'mascot-excited',
  walking: 'mascot-walking',
  hiding: 'mascot-hiding'
};
```

### Pixel Art Design Specifications
- **Size:** 64x64px (desktop), 48x48px (mobile)
- **Color Palette:** Limited to 4-6 colors from the site palette
- **Style:** Classic platformer character representing Guilherme as a designer
- **Character Elements:** Designer-themed accessories (stylus, color palette, creative tools)
- **Personality:** Fun and cartoonish with playful interactions
- **Body Language Focus:** Expressive posture and movement patterns
- **Sprite Sheets:** Individual frames for walking, tool-holding, and creative gestures

### Behavioral Triggers
1. **Page Load:** Brief excited animation with creative tool gesture
2. **Thumbnail Hover:** Playful bounce with design-focused animation
3. **Menu Open/Close:** Walking animation while "carrying" design tools
4. **Scroll Events:** Observant posture changes, occasional creative gestures
5. **Inactivity (30s):** Switch to observant/resting state, occasionally "sketching"
6. **Mouse Proximity:** Hide/reveal sequence with playful spin
7. **Page Transitions:** Excited walking or creative celebration animation
8. **Project Selection:** Celebration gesture with design tools

---

## 🏠 Homepage Structure

### Header Section
```html
<header class="site-header">
  <div class="header-content">
    <h1 class="name">Guilherme Ferreira</h1>
    <p class="title">Creative Director & Designer</p>
    <div class="header-visual">
      <div class="logo">
        <!-- Logo element -->
      </div>
      <div class="character-mascot">
        <!-- CSS-animated character/mascot -->
        <div class="mascot-container">
          <div class="mascot-body"></div>
          <div class="mascot-head"></div>
          <div class="mascot-eyes"></div>
          <div class="mascot-features"></div>
        </div>
      </div>
    </div>
  </div>
</header>
```

### Gallery Section (Auto-Loading Infinite Scroll)
```html
<main class="portfolio-gallery">
  <div class="gallery-grid" data-max-items="15" data-scroll-load="true">
    <!-- Dynamically generated from portfolio-data.js -->
    <!-- Initial load: 6 items, auto-load remaining 9 on scroll -->
    <article class="gallery-item" data-project="project-latest" data-order="1">
      <img src="assets/images/thumbnails/project-latest.jpg" alt="Latest Project" loading="lazy">
      <div class="item-overlay">
        <h3>Project Title</h3>
        <p>Design • 2025</p>
      </div>
    </article>
    <!-- Auto-generated grid continues... -->
  </div>
  
  <!-- Loading indicator for scroll-triggered content -->
  <div class="gallery-loading" aria-hidden="true">
    <div class="loading-spinner"></div>
    <p>Loading more work...</p>
  </div>
</main>
```

### Auto-Loading System
```javascript
// Infinite scroll with 15-item maximum
const MAX_PORTFOLIO_ITEMS = 15;
const INITIAL_LOAD_COUNT = 6;
const SCROLL_THRESHOLD = 0.8; // Load when 80% scrolled

// Intersection Observer for performance
const scrollLoadObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && hasMoreItems()) {
      loadNextBatch();
    }
  });
}, { threshold: SCROLL_THRESHOLD });
```

### Gallery Grid System
```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--grid-gap);
  margin: var(--section-spacing) 0;
}

/* Initial state: 2 rows of 3 (6 items) */
.gallery-item:nth-child(n+7) {
  display: none;
}

/* Rich hover interactions */
.gallery-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 4px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.gallery-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(235, 197, 51, 0.3);
}

/* Auto-reorganization on new items */
.gallery-item[data-order="1"] {
  order: -1;
  grid-column: 1;
  grid-row: 1;
}
```

---

## 📄 Individual Portfolio Pages

### Project Page Structure (Hero + Process + Video)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Project Name] - Guilherme Ferreira</title>
  <link rel="stylesheet" href="../../css/main.css">
</head>
<body>
  <!-- Loading Screen -->
  <div class="loading-screen" id="loadingScreen">
    <div class="loading-content">
      <div class="mascot-loading"></div>
      <h2>Loading Project...</h2>
      <div class="loading-progress"></div>
    </div>
  </div>

  <!-- Page Content (hidden until loaded) -->
  <div class="page-content" id="pageContent" style="opacity: 0;">
    <nav class="page-navigation">
      <a href="../../" class="back-link">← Back to Portfolio</a>
    </nav>
    
    <main class="project-content">
      <!-- Hero Section -->
      <header class="project-hero">
        <div class="hero-image">
          <img src="images/hero.jpg" alt="[Project Title] Hero Image" loading="eager">
        </div>
        <div class="hero-content">
          <h1 class="project-title">[Project Title]</h1>
          <p class="project-meta">[Year] • [Type] • [Medium]</p>
          <div class="project-description">
            <p>[Brief project description and context]</p>
          </div>
        </div>
      </header>
      
      <!-- Process Documentation -->
      <section class="project-process">
        <h2>Design Process</h2>
        <div class="process-grid">
          <div class="process-step">
            <img src="images/process-1.jpg" alt="Process Step 1" loading="lazy">
            <h3>Research & Discovery</h3>
            <p>Process description...</p>
          </div>
          <div class="process-step">
            <img src="images/process-2.jpg" alt="Process Step 2" loading="lazy">
            <h3>Ideation & Concept</h3>
            <p>Process description...</p>
          </div>
          <!-- Additional process steps... -->
        </div>
      </section>
      
      <!-- Functionality Video -->
      <section class="project-demo" id="demoSection">
        <h2>In Action</h2>
        <div class="video-container">
          <video 
            id="projectVideo"
            muted
            loop
            preload="metadata"
            poster="images/video-poster.jpg">
            <source src="videos/demo.mp4" type="video/mp4">
            <source src="videos/demo.webm" type="video/webm">
          </video>
          <div class="video-controls">
            <button class="replay-btn">Replay</button>
            <button class="sound-toggle">🔊</button>
          </div>
        </div>
      </section>
    </main>
    
    <!-- "See More" Section -->
    <section class="see-more-projects">
      <h2>See More Work</h2>
      <div class="random-projects-grid">
        <!-- 3 random project thumbnails (excluding current project) -->
        <article class="mini-project-item" data-project="random-1">
          <img src="../../assets/images/thumbnails/random-1.jpg" alt="Random Project 1">
          <h3>Project Title</h3>
          <p>Project Type</p>
        </article>
        <!-- 2 more random projects... -->
      </div>
    </section>
  </div>
</body>
</html>
```

### Auto-Focus Video System
```javascript
// Video autoplay on focus with Intersection Observer
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target;
    if (entry.isIntersecting) {
      // Video comes into focus
      video.play().catch(e => console.log('Autoplay prevented:', e));
      // Trigger mascot excited animation
      triggerMascotState('excited');
    } else {
      // Video out of focus
      video.pause();
    }
  });
}, { threshold: 0.5 });

// GIF-like looping behavior
document.getElementById('projectVideo').addEventListener('ended', function() {
  this.currentTime = 0;
  this.play();
});
```

---

## ⚡ JavaScript Module Architecture

### Main Application Entry Point (`js/main.js`)
```javascript
import { initializeGallery } from './modules/gallery.js';
import { initializeNavigation } from './modules/navigation.js';
import { initializeLazyLoading } from './modules/lazy-loading.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeGallery();
  initializeNavigation();
  initializeLazyLoading();
});
```

### Gallery Module (`js/modules/gallery.js`)
- Portfolio data loading
- Grid layout management
- Item interaction handling
- Modal/lightbox functionality

### Navigation Module (`js/modules/navigation.js`)
- Page transitions
- Back/forward navigation
- Smooth scrolling
- Mobile menu handling

### Lazy Loading Module (`js/modules/lazy-loading.js`)
- Image lazy loading
- Video lazy loading
- Performance optimization

---

## 📊 Content Management System

### Portfolio Data Configuration (`js/config/portfolio-data.js`)
```javascript
export const portfolioItems = [
  {
    id: 'project-1',
    title: 'Project Title',
    type: 'Photography',
    year: '2025',
    thumbnail: 'assets/images/thumbnails/project-1.jpg',
    path: 'pages/project-1/',
    tags: ['photography', 'portrait'],
    featured: true
  },
  // ... more projects
];
```

### Content Addition Workflow
1. Create new folder in `pages/`
2. Copy template structure with loading system
3. Add hero image, process images, and demo video
4. Update `portfolio-data.js` with project metadata
5. Generate optimized thumbnails (WebP + JPEG fallback)
6. Configure video encoding (multiple formats/sizes)
7. Test loading performance and smooth transitions
8. Verify random project selection excludes current project

---

## 🚀 Performance Optimization Strategy

### Robust Loading System (Mobile-First Approach)
```javascript
// Comprehensive asset preloading with progress tracking
class ProjectLoader {
  constructor() {
    this.totalAssets = 0;
    this.loadedAssets = 0;
    this.loadingScreen = document.getElementById('loadingScreen');
    this.progressBar = document.querySelector('.loading-progress');
  }

  async loadProject() {
    // Calculate total assets needed
    this.calculateAssets();
    
    // Load critical assets first
    await this.loadCriticalAssets();
    
    // Load secondary assets
    await this.loadSecondaryAssets();
    
    // Smooth transition to content
    this.completeLoading();
  }

  loadCriticalAssets() {
    return Promise.all([
      this.loadImage('hero-image'),
      this.loadCSS('critical-styles'),
      this.loadJS('core-interactions')
    ]);
  }

  loadSecondaryAssets() {
    return Promise.all([
      this.loadImages('process-images'),
      this.preloadVideo('demo-video'),
      this.loadJS('enhanced-interactions')
    ]);
  }

  updateProgress() {
    this.loadedAssets++;
    const progress = (this.loadedAssets / this.totalAssets) * 100;
    this.progressBar.style.width = `${progress}%`;
    
    // Update mascot animation based on progress
    this.updateMascotLoadingState(progress);
  }
}
```

### Smart Asset Management
```css
/* Critical assets loaded immediately */
.critical-assets {
  /* Hero images, essential CSS, core JS */
  preload: true;
  priority: high;
}

/* Secondary assets loaded during loading screen */
.secondary-assets {
  /* Process images, videos, enhanced interactions */
  loading: lazy;
  priority: medium;
}

/* Deferred assets loaded after page reveal */
.deferred-assets {
  /* Random project thumbnails, non-essential elements */
  loading: lazy;
  priority: low;
}
```

### Loading Screen with Mascot Animation
```css
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.8s ease-out;
}

.mascot-loading {
  width: 80px;
  height: 80px;
  animation: mascot-loading-dance 2s ease-in-out infinite;
}

@keyframes mascot-loading-dance {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(5deg) scale(1.1); }
  50% { transform: translateY(0px) rotate(0deg) scale(1); }
  75% { transform: translateY(-5px) rotate(-5deg) scale(1.05); }
}

.loading-progress {
  width: 200px;
  height: 4px;
  background: var(--color-secondary);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 20px;
}

.loading-progress::after {
  content: '';
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-yellow), var(--color-accent-orange));
  width: 0%;
  transition: width 0.3s ease-out;
}
```

### Image Optimization
- WebP format with JPEG fallback
- Multiple sizes for responsive images
- Lazy loading implementation
- Thumbnail compression

### Loading Strategy
- Critical CSS inline
- Progressive enhancement
- Preload key assets
- Intersection Observer for animations

### Caching Strategy
- Service Worker for offline functionality (future enhancement)
- Browser caching headers
- Asset versioning

---

## 🔄 Development Workflow

### Phase 1: Foundation
1. Set up folder structure
2. Create HTML templates
3. Implement CSS design system
4. Basic JavaScript modules

### Phase 2: Core Functionality
1. Gallery grid implementation
2. Page navigation
3. Responsive behavior
4. Basic animations

### Phase 3: Enhancement
1. Advanced interactions
2. Performance optimization
3. Accessibility improvements
4. Content loading system

### Phase 4: Polish
1. Cross-browser testing
2. Performance auditing
3. SEO optimization
4. Documentation completion

---

## 🎛️ Customization Options

### Easy Modifications
- Color scheme via CSS variables
- Typography changes
- Grid layout adjustments
- Animation preferences

### Strategic Rich Interaction Zones
**Smooth Experience + Focused WOW Moments:**

#### 1. **Loading Transitions** (Rich)
```css
/* Page entrance after loading */
.page-reveal {
  animation: page-reveal 1.2s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes page-reveal {
  0% { 
    transform: translateY(40px) scale(0.95); 
    opacity: 0; 
  }
  100% { 
    transform: translateY(0) scale(1); 
    opacity: 1; 
  }
}
```

#### 2. **Project Selection** (Rich)
```css
.gallery-item-select {
  animation: item-select 0.6s ease-out;
}

@keyframes item-select {
  0% { transform: scale(1); }
  50% { transform: scale(1.05) rotate(1deg); }
  100% { transform: scale(1) rotate(0deg); }
}
```

#### 3. **Menu Interactions** (Rich)
```css
.menu-slide-reveal {
  animation: menu-reveal 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes menu-reveal {
  0% { 
    transform: translateX(-100%) scale(0.8); 
    opacity: 0; 
  }
  100% { 
    transform: translateX(0) scale(1); 
    opacity: 1; 
  }
}
```

#### 4. **Content Interactions** (Minimal)
```css
/* Smooth scrolling and subtle transitions */
.smooth-scroll {
  scroll-behavior: smooth;
  transition: all 0.3s ease-out;
}

.content-fade-in {
  animation: subtle-fade 0.4s ease-out;
}

@keyframes subtle-fade {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Post-Loading Experience Optimization
- **Immediate Responsiveness:** All interactions respond within 16ms
- **Smooth Scrolling:** Hardware-accelerated scroll with momentum
- **Lazy Asset Loading:** Non-critical content loads as needed
- **Rich Moments:** Focused on user decision points and transitions
- **Performance Monitoring:** Real-time tracking of interaction smoothness

### Content Types Supported
- **Primary:** Design work images (JPG, PNG, WebP)
- **Secondary:** Software/game demonstration videos (MP4, WebM)
- **Accent:** Animated GIFs for interaction demos
- **Text:** Minimal markdown-style content blocks
- **Mixed Media:** Combined image/video layouts for comprehensive project showcases

---

## 📋 Success Metrics

### Performance Targets
- **Lighthouse Score:** 90+ across all categories
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Mobile Usability:** 100%

### User Experience Goals
- Intuitive navigation
- Fast content discovery
- Smooth interactions
- Accessible to all users

---

## 🤔 Questions for Iteration

Before we proceed with implementation, please consider these remaining aspects:

1. **~~Header Graphic:~~** ✅ **DECIDED** - Logo + CSS animated mascot character

2. **~~Color Preferences:~~** ✅ **DECIDED** - White base, #333333 text, #C8C8BC secondary, yellow/orange accents

3. **~~Professional Title:~~** ✅ **DECIDED** - "Creative Director & Designer"

4. **~~Mascot Character Design:~~** ✅ **DECIDED** - Pixel-style (8-bit) with interactive behaviors

5. **~~Gallery Grid:~~** ✅ **DECIDED** - 6 items initially (2 rows of 3), auto-organize with latest first

6. **~~Content Types:~~** ✅ **DECIDED** - Design/software focused, primarily images with occasional videos/GIFs

7. **~~Animation Level:~~** ✅ **DECIDED** - Minimal base with rich interactions for menus, hovers, transitions

8. **~~Contact Information:~~** ✅ **DECIDED** - Simple footer text only (no contact section)

9. **~~Pixel Mascot Character Design:~~** ✅ **DECIDED** - Classic platformer character representing you as a designer

10. **~~Mascot Personality Traits:~~** ✅ **DECIDED** - Fun and cartoonish, playful when interacted with, observant during user inactivity

11. **~~Gallery Loading Behavior:~~** ✅ **DECIDED** - Auto-load on scroll (maximum 15 items total)

12. **~~Project Page Layouts:~~** ✅ **DECIDED** - Hero image + description + process images + functionality videos

13. **~~Video/GIF Integration:~~** ✅ **DECIDED** - Autoplay on focus, audio off by default, loop/rewatch options

14. **~~Navigation Structure:~~** ✅ **DECIDED** - Home → Project → "See More" with 3 random thumbnails

15. **~~Mobile Experience Priorities:~~** ✅ **DECIDED** - Robust loading system with smooth post-load experience

16. **~~Performance vs. Visual Balance:~~** ✅ **DECIDED** - Rich interactions for focused moments (menus, transitions, selections)

---

## 📝 Next Steps

1. **Review and Iterate:** Discuss this plan and make adjustments
2. **Finalize Design Decisions:** Color, typography, graphic direction
3. **Create Development Environment:** Set up the folder structure
4. **Start with Foundation:** HTML structure and CSS design system
5. **Implement Core Features:** Gallery and navigation
6. **Add Content:** Portfolio pieces and media
7. **Optimize and Polish:** Performance and cross-browser testing

---

*This project plan is a living document and will be updated as we iterate and refine the approach.*
