import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace confirmPayment function to trigger class addition after a delay
old_func = """  function confirmPayment() {
    goTo(5); // Go to loading screen
    const loader = document.querySelector('.payment-loader');
    const loadingText = document.getElementById('loading-text');
    
    // Reset state
    loader.className = 'payment-loader loading';
    loadingText.textContent = 'Ödeme alınıyor...';
    
    // After 1.8s
    setTimeout(() => {
      loader.className = 'payment-loader success';
      loadingText.textContent = 'Ödeme onaylandı!';
      
      // Go to screen 6 after checkmark shows
      setTimeout(() => {
        goTo(6);
      }, 1000);
    }, 1800);
  }"""

new_func = """  function confirmPayment() {
    goTo(5); // Go to loading screen
    const loader = document.querySelector('.payment-loader');
    const loadingText = document.getElementById('loading-text');
    
    // Reset state
    loader.className = 'payment-loader';
    loadingText.textContent = 'Ödeme alınıyor...';
    
    // Trigger animation after screen becomes visible (200ms)
    setTimeout(() => {
      loader.className = 'payment-loader loading';
      
      // After 1.8s
      setTimeout(() => {
        loader.className = 'payment-loader success';
        loadingText.textContent = 'Ödeme onaylandı!';
        
        // Go to screen 6 after checkmark shows
        setTimeout(() => {
          goTo(6);
        }, 1200);
      }, 1800);
    }, 200);
  }"""

content = content.replace(old_func, new_func)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
