// Auto-inject empty cart state on cart page
(function() {
  if (window.location.pathname !== '/cart') return;

  const cartEmptyHTML = '<div class="cart-empty"><div class="empty-icon">🐝</div><h1 class="empty-title">Your Hive is Empty</h1><p class="empty-text">Time to fill your basket with delicious goodies!</p><a href="/collections/all" class="empty-button">Start Shopping</a></div>';

  function injectEmpty() {
    const w = document.querySelector('.cart-wrapper');
    if (w && !w.querySelector('.cart-empty') && !w.querySelector('.cart-layout')) {
      w.insertAdjacentHTML('beforeend', cartEmptyHTML);
      return true;
    }
    return false;
  }

  // Immediate attempts
  injectEmpty();

  // Timeout attempts
  setTimeout(injectEmpty, 100);
  setTimeout(injectEmpty, 300);
  setTimeout(injectEmpty, 500);
  setTimeout(injectEmpty, 800);

  // Observer for async DOM changes
  const observer = new MutationObserver(() => {
    if (injectEmpty()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 2000);
})();
