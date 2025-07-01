/**
 * Fast Loading Controller
 * Minimal loading management for responsive website experience
 */

export class LoadingController {
  static init() {
    // Remove any loading states immediately for fast experience
    document.body.classList.remove('loading');
    
    // Remove loading screen if it exists (legacy cleanup)
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.remove();
    }
    
    console.log('⚡ Fast loading initialized - no loading screen needed');
  }
  
  static hide() {
    // Legacy compatibility method
    document.body.classList.remove('loading');
  }
  
  static isLoading() {
    return document.body.classList.contains('loading');
  }
}

// Auto-initialize for immediate fast loading
LoadingController.init();