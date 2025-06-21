// MASCOT ENVIRONMENT CONTROLLER - INTEGRATED WITH MAIN MASCOT
// Works with existing mascot.js state management

export class MascotEnvironment {
  constructor() {
    this.element = null;
    this.currentState = 'idle';
    this.mascotElement = null;
    
    this.init();
  }
  
  init() {
    this.createElement();
    this.findMascot();
    console.log('🌟 Mascot Environment (CSS-integrated) initialized');
  }
  
  findMascot() {
    // Wait for mascot element to be created
    const findMascotInterval = setInterval(() => {
      this.mascotElement = document.querySelector('.character-mascot');
      if (this.mascotElement) {
        console.log('🎭 Found mascot element for environment integration');
        clearInterval(findMascotInterval);
      }
    }, 100);
  }
  
  createElement() {
    // Create environmental container with all possible elements
    this.element = document.createElement('div');
    this.element.className = 'mascot-environment';
    this.element.innerHTML = `
      <!-- Creating State Elements -->
      <div class="env-creating">
        <div class="env-element font-aa">Aa</div>
        <div class="env-element font-serif">Aa</div>
        <div class="env-element color-dot"></div>
        <div class="env-element color-dot-2"></div>
        <div class="env-element design-tool"></div>
      </div>
      
      <!-- Thinking State Elements -->
      <div class="env-thinking">
        <div class="env-element thought-bubble"></div>
        <div class="env-element question-mark">?</div>
        <div class="env-element lightbulb">💡</div>
      </div>
      
      <!-- Coffee State Elements -->
      <div class="env-coffee">
        <div class="env-element coffee-cup">☕</div>
        <div class="env-element steam"></div>
        <div class="env-element steam steam-2"></div>
        <div class="env-element steam steam-3"></div>
      </div>
      
      <!-- Sleepy State Elements -->
      <div class="env-sleepy">
        <div class="env-element zzz">z</div>
        <div class="env-element zzz zzz-2">Z</div>
        <div class="env-element zzz zzz-3">Z</div>
        <div class="env-element moon">🌙</div>
      </div>
      
      <!-- Excited State Elements -->
      <div class="env-excited">
        <div class="env-element confetti confetti-1"></div>
        <div class="env-element confetti confetti-2"></div>
        <div class="env-element confetti confetti-3"></div>
        <div class="env-element confetti confetti-4"></div>
        <div class="env-element star">✨</div>
      </div>
      
      <!-- Dancing State Elements -->
      <div class="env-dancing">
        <div class="env-element music-note note-1">♪</div>
        <div class="env-element music-note note-2">♫</div>
        <div class="env-element music-note note-3">♪</div>
      </div>
    `;
    
    // Append to body
    document.body.appendChild(this.element);
  }
  
  // State management - apply state classes to environment element
  setState(newState, immediate = false) {
    if (this.currentState === newState) return;
    
    console.log(`🌟 Environment state: ${this.currentState} → ${newState}`);
    
    // Remove previous state class from environment
    this.element.classList.remove(`state-${this.currentState}`);
    
    // Add new state class to environment
    this.element.classList.add(`state-${newState}`);
    
    this.currentState = newState;
    
    // CSS will automatically show/hide elements based on state classes
  }
  
  // Cleanup method
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export default MascotEnvironment;