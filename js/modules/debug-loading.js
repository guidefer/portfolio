/**
 * Debug helper for enhanced loading system
 * Add this script to your page to debug the loading system
 */

// Add debug logging to window for easy testing
window.debugLoading = {
  testNavigation: () => {
    console.log('🔧 Testing enhanced navigation...');
    const app = window.portfolioApp;
    if (!app) {
      console.error('❌ Portfolio app not found');
      return;
    }
    
    const loading = app.getLoading();
    const navigation = app.getNavigation();
    
    console.log('📊 Loading Controller State:', loading?.getState());
    console.log('📊 Navigation State:', navigation?.getNavigationState());
    
    // Test navigation loading
    if (loading) {
      console.log('🔄 Testing navigation loading...');
      loading.startNavigation('#test');
    }
  },
  
  testPetals: () => {
    console.log('🌸 Testing petal controls...');
    const app = window.portfolioApp;
    const loading = app?.getLoading();
    
    if (!loading) {
      console.error('❌ Loading controller not found');
      return;
    }
    
    console.log('Current state:', loading.getState());
    
    // Test petal controls
    setTimeout(() => {
      console.log('⏸️ Pausing petals...');
      loading.pausePetals();
      
      setTimeout(() => {
        console.log('▶️ Resuming petals...');
        loading.resumePetals();
        
        setTimeout(() => {
          console.log('👻 Hiding petals...');
          loading.hidePetals();
          
          setTimeout(() => {
            console.log('👀 Showing petals...');
            loading.resumePetals();
          }, 2000);
        }, 2000);
      }, 2000);
    }, 1000);
  },
  
  inspectPetals: () => {
    const container = document.querySelector('.petals-container');
    const petals = document.querySelectorAll('.petal');
    const loadingScreen = document.getElementById('loading-screen');
    
    console.log('🔍 Petal inspection:');
    console.log('- Container:', container);
    console.log('- Petal count:', petals.length);
    console.log('- Loading screen classes:', loadingScreen?.className);
    console.log('- Container opacity:', container ? getComputedStyle(container).opacity : 'N/A');
    
    if (petals.length > 0) {
      const firstPetal = petals[0];
      console.log('- First petal animation-play-state:', getComputedStyle(firstPetal).animationPlayState);
      console.log('- First petal animation-name:', getComputedStyle(firstPetal).animationName);
    }
  },
  
  forceNavigation: () => {
    console.log('🚀 Forcing enhanced navigation test...');
    const app = window.portfolioApp;
    const navigation = app?.getNavigation();
    const loading = app?.getLoading();
    
    if (navigation && loading) {
      console.log('📊 Before navigation - Loading state:', loading.getState());
      console.log('📊 Before navigation - Nav state:', navigation.getNavigationState());
      
      // Call startNavigation directly to test
      loading.startNavigation('test-section').then(() => {
        console.log('✅ Direct navigation test complete');
        console.log('📊 After navigation - Loading state:', loading.getState());
      });
    } else {
      console.error('❌ Navigation or Loading controller not found');
    }
  },

  testDirectNavigation: () => {
    console.log('🎯 Testing direct navigation loading...');
    const app = window.portfolioApp;
    const loading = app?.getLoading();
    
    if (loading) {
      console.log('Current petals state before test:');
      window.debugLoading.inspectPetals();
      
      // Test just the navigation loading
      loading.startNavigation('#work');
    }
  }
};

// Auto-run inspection after a delay
setTimeout(() => {
  console.log('🔧 Enhanced Loading Debug Helper Ready!');
  console.log('Available commands:');
  console.log('- debugLoading.testNavigation()');
  console.log('- debugLoading.testPetals()');
  console.log('- debugLoading.inspectPetals()');
  console.log('- debugLoading.forceNavigation()');
  console.log('- debugLoading.testDirectNavigation()');
  
  // Auto-inspect on load
  window.debugLoading.inspectPetals();
}, 2000);

export default window.debugLoading;
