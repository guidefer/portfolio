# Copilot Instructions - Guilherme Ferreira Portfolio Website

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## 🎯 Project Overview

This is a minimalist portfolio website for Guilherme Ferreira, Creative Director & Designer. The project focuses on clean, content-driven design with strategic interactive moments and a playful pixel art mascot character.

## 🏗️ Technical Guidelines

### Technology Stack
- **HTML5:** Semantic markup with accessibility considerations
- **CSS3:** Modern CSS with Grid, Flexbox, CSS Variables, and CSS animations
- **ES6 JavaScript:** Modular architecture using import/export (no build process initially)
- **No Frameworks:** Vanilla JS for lightweight performance

### Architecture Principles
- **Mobile-First:** All styles start from mobile breakpoints (320px+)
- **Progressive Enhancement:** Base functionality works without JS
- **Modular Design:** Separate CSS and JS modules for maintainability
- **Performance-First:** Optimize for smooth post-load experience

## 🎨 Design System

### Color Palette
```css
:root {
  /* Base Colors */
  --color-background: #ffffff;   /* Pure white - primary background */
  --color-primary: #333333;      /* Dark gray - main text */
  --color-secondary: #C8C8BC;    /* Light gray-beige - separations */
  --color-tertiary: #808080;     /* Medium gray - subtitles */
  
  /* Accent Colors */
  --color-accent-yellow: #EBC533; /* Yellow - highlights */
  --color-accent-orange: #D66422; /* Orange - highlights */
}
```

### Typography
- **Primary Font:** System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- **Display Font:** Georgia, serif (for name/title only)
- **Mobile-First Sizing:** Start with base 16px, scale up for larger screens

### Spacing Scale
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

## 🎭 Pixel Art Mascot Character

### Character Description
- **Represents:** Guilherme as a designer
- **Style:** Classic 8-bit platformer character (Mario-style)
- **Appearance:** Salt & pepper hair, salt & pepper beard, black t-shirt, jeans
- **Size:** 64x64px (desktop), 48x48px (mobile)
- **Position:** Fixed bottom-right corner
- **Personality:** Fun and cartoonish when interactive, observant when idle

### Animation States
1. **Idle:** Subtle breathing animation
2. **Resting:** Sleeping/sketching when user inactive (30s+)
3. **Excited:** Bouncing with creative tools on interactions
4. **Walking:** Moving across screen with design tools
5. **Hiding:** Spinning disappear when mouse too close

### Behavioral Triggers
- Page load, thumbnail hover, menu interactions, scroll events
- Mouse proximity detection, page transitions, project selections
- Inactivity switches to observant/resting state

## 🖼️ Gallery System

### Grid Layout
- **Initial Load:** 6 items (2 rows of 3)
- **Maximum Items:** 15 total
- **Loading:** Auto-load on scroll using Intersection Observer
- **Latest First:** New items automatically appear at top

### Hover Interactions
- Rich animations with yellow/orange accent overlays
- Transform: translateY(-8px) scale(1.02)
- Box shadow with accent colors

## 📄 Project Pages

### Structure
1. **Loading Screen:** With mascot animation and progress bar
2. **Hero Section:** Large image + title + description
3. **Process Section:** Step-by-step design process images
4. **Demo Video:** Autoplay on focus, muted by default
5. **See More:** 3 random project thumbnails

### Video Handling
- Autoplay when in viewport (Intersection Observer)
- Muted by default, user can enable sound
- Loop like GIFs, replay controls available
- Multiple formats (MP4, WebM) with poster images

## ⚡ Performance Strategy

### Loading System
- **Robust Preloading:** Load all critical assets during loading screen
- **Asset Priority:** Critical → Secondary → Deferred
- **Progress Tracking:** Visual progress bar with mascot animation
- **Smooth Reveal:** Fade in content only when fully loaded

### Rich Interaction Zones
- **Loading Transitions:** Rich page reveals and transitions
- **Project Selection:** Exciting selection animations
- **Menu Interactions:** Smooth slide-in/out with easing
- **Content Browsing:** Minimal, smooth transitions

## 📱 Responsive Behavior

### Breakpoints
```css
--bp-sm: 640px;    /* Small devices */
--bp-md: 768px;    /* Medium devices */
--bp-lg: 1024px;   /* Large devices */
--bp-xl: 1280px;   /* Extra large devices */
```

### Mobile Priorities
- Touch-optimized interactions (44px minimum touch targets)
- Simplified navigation
- Reduced mascot size (48x48px)
- Optimized asset loading for mobile connections

## 🗂️ File Organization

### CSS Structure
```
css/
├── main.css              # Main stylesheet import
├── components/           # Component-specific styles
│   ├── header.css
│   ├── gallery.css
│   ├── navigation.css
│   ├── mascot.css       # Pixel character animations
│   └── portfolio-item.css
└── utilities/            # Base styles
    ├── reset.css
    ├── variables.css
    └── responsive.css
```

### JavaScript Modules
```
js/
├── main.js               # Entry point
├── modules/              # Feature modules
│   ├── gallery.js        # Gallery functionality
│   ├── navigation.js     # Navigation handling
│   ├── mascot.js         # Mascot behavior system
│   ├── loader.js         # Asset loading system
│   └── utils.js          # Utility functions
└── config/
    └── portfolio-data.js # Content configuration
```

## 🎯 Coding Best Practices

### CSS Guidelines
- Use CSS Custom Properties for all values
- Mobile-first media queries
- Semantic class names (BEM methodology preferred)
- Hardware-accelerated animations (transform, opacity)
- Avoid layout thrashing

### JavaScript Guidelines
- ES6 modules with clear imports/exports
- Event delegation for performance
- Intersection Observer for scroll-based features
- requestAnimationFrame for smooth animations
- Error handling for media loading

### Performance Considerations
- Lazy load images with loading="lazy"
- Preload critical assets
- Use WebP with JPEG fallback
- Minimize reflows and repaints
- Debounce scroll and resize events

## 🎨 Animation Principles

### Base Interactions (Minimal)
- 0.2s-0.4s duration
- ease-out or ease-in-out timing
- Subtle transforms and opacity changes

### Rich Interactions (Strategic)
- 0.6s-1.2s duration
- Custom cubic-bezier timing functions
- Complex transforms with spring-like easing
- Used only for focused moments (menus, transitions, selections)

### Mascot Animations
- CSS-only animations for performance
- Sprite-based approach for complex movements
- State management via CSS classes
- Triggered by JavaScript events

## 🔧 Development Workflow

### Phase 1: Foundation
1. Set up folder structure and base files
2. Implement CSS design system and variables
3. Create HTML templates and structure
4. Build mascot character and basic animations

### Phase 2: Core Features
1. Gallery grid with auto-loading
2. Project page templates
3. Loading system implementation
4. Navigation and routing

### Phase 3: Enhancement
1. Advanced mascot behaviors
2. Rich interaction animations
3. Video integration and controls
4. Performance optimization

### Phase 4: Polish
1. Cross-browser testing
2. Accessibility improvements
3. SEO optimization
4. Final performance audit

## 🚨 Important Notes

- **Content is King:** All design decisions should prioritize content visibility
- **Minimalist Approach:** Use restraint - less is more
- **Strategic WOW:** Save rich interactions for decision points
- **Mobile Experience:** Never compromise mobile performance
- **Mascot Personality:** Keep it fun but not distracting from content
- **Loading Strategy:** Better to load fully than show broken experience

## 🎯 Success Criteria

- Lighthouse score 90+ across all categories
- Smooth 60fps interactions post-load
- Intuitive navigation and content discovery
- Delightful mascot interactions without distraction
- Fast loading with engaging loading experience
- Accessible to all users (WCAG AA compliance)

---

*Always refer to this document when making decisions about the portfolio website implementation.*
