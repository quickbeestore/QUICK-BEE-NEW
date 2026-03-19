/* ============================================
   FLASH DEALS PAGE - JAVASCRIPT FUNCTIONALITY
   ============================================ */

/**
 * FlashDealsPage
 * Manages carousel, countdown timers, add-to-cart functionality,
 * and stock indicators for the Flash Deals page
 */
class FlashDealsPage {
  constructor() {
    this.carouselIndex = 0;
    this.carouselItems = [];
    this.carouselAutoplayInterval = null;
    this.countdownIntervals = new Map();
    this.isCarouselPaused = false;
    this.init();
  }

  /**
   * Initialize all components
   */
  init() {
    this.setupCarousel();
    this.setupCountdownTimers();
    this.setupStockIndicators();
    this.setupEventListeners();
  }

  /* ========================================
     CAROUSEL METHODS
     ======================================== */

  /**
   * Setup carousel functionality
   */
  setupCarousel() {
    const carouselContainer = document.querySelector('.flash-deals-carousel-container');
    const carouselWrapper = document.querySelector('.flash-deals-carousel-wrapper');

    if (!carouselContainer) return;

    // Get all carousel items
    this.carouselItems = Array.from(document.querySelectorAll('.flash-deals-carousel-item'));

    if (this.carouselItems.length === 0) return;

    // Initialize display
    this.updateCarouselDisplay();

    // Start autoplay
    this.startCarouselAutoplay();

    // Setup navigation buttons
    const prevBtn = document.querySelector('.carousel-arrow[data-direction="prev"]');
    const nextBtn = document.querySelector('.carousel-arrow[data-direction="next"]');

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.prevCarousel();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.nextCarousel();
      });
    }

    // Setup dot indicators
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToCarouselSlide(index);
      });
    });

    // Pause on hover, resume on leave
    if (carouselWrapper) {
      carouselWrapper.addEventListener('mouseenter', () => {
        this.pauseCarouselAutoplay();
      });

      carouselWrapper.addEventListener('mouseleave', () => {
        if (!this.isCarouselPaused) {
          this.startCarouselAutoplay();
        }
      });
    }
  }

  /**
   * Start carousel autoplay (5 second interval)
   */
  startCarouselAutoplay() {
    if (this.carouselAutoplayInterval) return;

    this.carouselAutoplayInterval = setInterval(() => {
      this.nextCarousel();
    }, 5000);
  }

  /**
   * Pause carousel autoplay
   */
  pauseCarouselAutoplay() {
    if (this.carouselAutoplayInterval) {
      clearInterval(this.carouselAutoplayInterval);
      this.carouselAutoplayInterval = null;
    }
  }

  /**
   * Navigate to next carousel slide
   */
  nextCarousel() {
    if (this.carouselItems.length === 0) return;

    this.carouselIndex = (this.carouselIndex + 1) % this.carouselItems.length;
    this.updateCarouselDisplay();
  }

  /**
   * Navigate to previous carousel slide
   */
  prevCarousel() {
    if (this.carouselItems.length === 0) return;

    this.carouselIndex = (this.carouselIndex - 1 + this.carouselItems.length) % this.carouselItems.length;
    this.updateCarouselDisplay();
  }

  /**
   * Go to specific carousel slide by index
   */
  goToCarouselSlide(index) {
    if (index < 0 || index >= this.carouselItems.length) return;

    this.carouselIndex = index;
    this.updateCarouselDisplay();

    // Reset autoplay
    this.pauseCarouselAutoplay();
    this.startCarouselAutoplay();
  }

  /**
   * Update carousel display based on current index
   */
  updateCarouselDisplay() {
    if (this.carouselItems.length === 0) return;

    const carouselContainer = document.querySelector('.flash-deals-carousel-container');
    if (!carouselContainer) return;

    // Calculate offset based on items per view
    const itemsPerView = this.getItemsPerView();
    const offset = -this.carouselIndex * (100 / itemsPerView);

    carouselContainer.style.transform = `translateX(${offset}%)`;

    // Update dot indicators
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.carouselIndex);
    });
  }

  /**
   * Get number of items to show per view based on screen size
   */
  getItemsPerView() {
    if (window.innerWidth >= 768) {
      return 2;
    }
    return 1;
  }

  /* ========================================
     COUNTDOWN TIMER METHODS
     ======================================== */

  /**
   * Setup countdown timers for all deals
   */
  setupCountdownTimers() {
    const elements = document.querySelectorAll('[data-deal-end-time]');

    elements.forEach((element) => {
      const endTimeString = element.getAttribute('data-deal-end-time');
      this.updateCountdown(element, endTimeString);

      // Create a unique interval for each countdown
      const intervalId = setInterval(() => {
        this.updateCountdown(element, endTimeString);
      }, 1000);

      // Store interval for cleanup
      this.countdownIntervals.set(element, intervalId);
    });
  }

  /**
   * Update countdown timer for a specific element
   */
  updateCountdown(element, endTimeString) {
    // Parse end time
    let endTime;
    try {
      endTime = new Date(endTimeString);
    } catch (e) {
      element.textContent = 'INVALID TIME';
      return;
    }

    // Check if date is valid
    if (isNaN(endTime.getTime())) {
      element.textContent = 'INVALID TIME';
      return;
    }

    // Calculate time remaining
    const now = new Date();
    const timeRemaining = endTime - now;

    // If time has expired
    if (timeRemaining <= 0) {
      element.textContent = 'DEAL ENDED';
      element.classList.remove('urgent', 'critical');

      // Clear this specific interval
      const intervalId = this.countdownIntervals.get(element);
      if (intervalId) {
        clearInterval(intervalId);
        this.countdownIntervals.delete(element);
      }
      return;
    }

    // Convert to hours, minutes, seconds
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // Format as HH:MM:SS LEFT
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} LEFT`;
    element.textContent = formattedTime;

    // Add urgency classes based on time remaining
    if (timeRemaining < 30 * 60 * 1000) {
      // Less than 30 minutes
      element.classList.add('critical', 'urgent');
    } else if (timeRemaining < 60 * 60 * 1000) {
      // Less than 1 hour
      element.classList.add('urgent');
      element.classList.remove('critical');
    } else {
      // More than 1 hour
      element.classList.remove('urgent', 'critical');
    }
  }

  /* ========================================
     STOCK INDICATOR METHODS
     ======================================== */

  /**
   * Setup stock indicators
   * Add "low-stock" class when stock < 5
   */
  setupStockIndicators() {
    const stockElements = document.querySelectorAll('[data-stock-left]');

    stockElements.forEach((element) => {
      const stock = parseInt(element.getAttribute('data-stock-left'), 10);

      if (!isNaN(stock) && stock < 5) {
        element.classList.add('low-stock');
      }
    });
  }

  /* ========================================
     EVENT LISTENERS & ADD TO CART
     ======================================== */

  /**
   * Setup event listeners for buttons and interactions
   */
  setupEventListeners() {
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('[data-add-to-cart]');
    addToCartButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const variantId = button.getAttribute('data-variant-id');
        this.addToCart(variantId, button);
      });
    });
  }

  /**
   * Add product to cart using Shopify Cart API
   */
  addToCart(variantId, button) {
    if (!variantId) {
      this.showErrorMessage('Unable to add to cart: Missing variant ID');
      return;
    }

    // Disable button during request
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Adding...';

    // Prepare cart data
    const cartData = {
      items: [
        {
          id: variantId,
          quantity: 1,
        },
      ],
    };

    // Make API call to /cart/add.js
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Success
        button.textContent = originalText;
        button.disabled = false;
        this.showSuccessMessage('Added to cart!');
        this.updateCartDisplay();
      })
      .catch((error) => {
        // Error
        console.error('Add to cart error:', error);
        button.textContent = originalText;
        button.disabled = false;
        this.showErrorMessage('Failed to add to cart. Please try again.');
      });
  }

  /**
   * Update cart display (e.g., cart count in header)
   */
  updateCartDisplay() {
    // Fetch current cart to update any cart count displays
    fetch('/cart.js')
      .then((response) => response.json())
      .then((data) => {
        // Update cart count in header or any cart-related UI
        const cartCountElements = document.querySelectorAll('[data-cart-count]');
        cartCountElements.forEach((element) => {
          element.textContent = data.item_count;
        });
      })
      .catch((error) => {
        console.error('Error updating cart display:', error);
      });
  }

  /**
   * Show success notification toast
   */
  showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'flash-deals-toast flash-deals-toast-success';
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    toast.textContent = message;

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Show error notification toast
   */
  showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'flash-deals-toast flash-deals-toast-error';
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.textContent = message;

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }

  /* ========================================
     CLEANUP METHODS
     ======================================== */

  /**
   * Cleanup - remove all intervals and event listeners
   */
  destroy() {
    // Clear carousel autoplay
    if (this.carouselAutoplayInterval) {
      clearInterval(this.carouselAutoplayInterval);
      this.carouselAutoplayInterval = null;
    }

    // Clear all countdown intervals
    this.countdownIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.countdownIntervals.clear();

    // Note: Event listeners attached via addEventListener are automatically
    // removed when the page unloads, but if needed, you can add removal here
  }
}

/* ========================================
   INITIALIZATION & PAGE UNLOAD HANDLING
   ======================================== */

// Initialize on DOM ready
let flashDealsPage = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    flashDealsPage = new FlashDealsPage();
  });
} else {
  // DOM already loaded
  flashDealsPage = new FlashDealsPage();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (flashDealsPage) {
    flashDealsPage.destroy();
  }
});

// Also handle page hide (for browser tab switching)
document.addEventListener('visibilitychange', () => {
  if (flashDealsPage) {
    if (document.hidden) {
      // Pause autoplay when tab is hidden
      flashDealsPage.pauseCarouselAutoplay();
    } else {
      // Resume autoplay when tab is visible
      flashDealsPage.startCarouselAutoplay();
    }
  }
});

/* ========================================
   TOAST STYLING (Injected inline for immediate availability)
   ======================================== */

// Add toast styles if not already present
if (!document.querySelector('#flash-deals-toast-styles')) {
  const style = document.createElement('style');
  style.id = 'flash-deals-toast-styles';
  style.textContent = `
    .flash-deals-toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 16px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      max-width: 300px;
      z-index: 10000;
      opacity: 0;
      transform: translateY(20px);
      transition: all 300ms ease-out;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .flash-deals-toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    .flash-deals-toast-success {
      background: #4CAF50;
      color: white;
    }

    .flash-deals-toast-error {
      background: #FF5252;
      color: white;
    }

    @media (max-width: 767px) {
      .flash-deals-toast {
        bottom: 12px;
        right: 12px;
        left: 12px;
        max-width: none;
      }
    }
  `;
  document.head.appendChild(style);
}
