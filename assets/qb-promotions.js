// assets/qb-promotions.js

// Utility: Vanilla debounce function
function debounce(func, wait) {
  let timeoutId;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeoutId);
      func(...args);
    };
    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, wait);
  };
}

// CAROUSEL CONTROLLER
class CarouselController {
  constructor(containerEl, config = {}) {
    this.container = containerEl;
    this.banners = Array.from(containerEl.querySelectorAll('[data-qb-banner]'));
    this.currentIndex = 0;
    this.autoAdvanceInterval = null;
    this.isAutoAdvancing = true;
    this.timers = [];

    this.config = {
      speed: parseInt(config.speed || '5000'),
      showTimers: config.showTimers !== false,
      ...config
    };

    this.init();
  }

  init() {
    if (this.banners.length === 0) return;

    // Setup banner timers
    this.banners.forEach((banner, index) => {
      const timerEl = banner.querySelector('[data-qb-timer]');
      const timerMinutes = parseInt(banner.dataset.qbTimerMinutes || '60');

      if (timerEl && this.config.showTimers) {
        const timer = new CountdownTimer(timerMinutes, timerEl);
        this.timers[index] = timer;
      }
    });

    // Setup navigation buttons
    const prevBtn = this.container.querySelector('[data-qb-carousel-prev]');
    const nextBtn = this.container.querySelector('[data-qb-carousel-next]');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    // Show first banner
    this.showBanner(0);

    // Start auto-advance
    this.startAutoAdvance();
  }

  showBanner(index) {
    // Hide all banners
    this.banners.forEach(b => b.classList.remove('active'));

    // Show target banner
    const banner = this.banners[index];
    banner.classList.add('active');
    this.currentIndex = index;

    // Reset timer for this banner
    if (this.timers[index]) {
      this.timers[index].reset();
      this.timers[index].start();
    }
  }

  prev() {
    this.pauseAutoAdvance();
    let newIndex = this.currentIndex - 1;
    if (newIndex < 0) newIndex = this.banners.length - 1;
    this.showBanner(newIndex);
    this.resumeAutoAdvance();
  }

  next() {
    this.pauseAutoAdvance();
    let newIndex = (this.currentIndex + 1) % this.banners.length;
    this.showBanner(newIndex);
    this.resumeAutoAdvance();
  }

  autoAdvance() {
    let newIndex = (this.currentIndex + 1) % this.banners.length;
    this.showBanner(newIndex);
  }

  startAutoAdvance() {
    if (this.autoAdvanceInterval) return;
    this.isAutoAdvancing = true;
    this.autoAdvanceInterval = setInterval(() => this.autoAdvance(), this.config.speed);
  }

  pauseAutoAdvance() {
    this.isAutoAdvancing = false;
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
      this.autoAdvanceInterval = null;
    }
  }

  resumeAutoAdvance() {
    setTimeout(() => this.startAutoAdvance(), 2000);
  }

  destroy() {
    this.pauseAutoAdvance();
    this.timers.forEach(timer => timer.stop());
    this.timers = [];
  }
}

// COUNTDOWN TIMER
class CountdownTimer {
  constructor(durationMinutes, displayEl) {
    this.durationMinutes = durationMinutes;
    this.displayEl = displayEl;
    this.endTime = null;
    this.updateInterval = null;
    this.onExpire = null;
  }

  reset() {
    this.stop();
    this.endTime = new Date(Date.now() + this.durationMinutes * 60 * 1000);
  }

  start() {
    if (this.updateInterval) return;

    this.updateDisplay();
    this.updateInterval = setInterval(() => this.updateDisplay(), 1000);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  getTimeRemaining() {
    if (!this.endTime) return { minutes: 0, seconds: 0, expired: true };

    const now = new Date();
    const diff = this.endTime - now;

    if (diff <= 0) {
      return { minutes: 0, seconds: 0, expired: true };
    }

    return {
      minutes: Math.floor(diff / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false
    };
  }

  updateDisplay() {
    const time = this.getTimeRemaining();
    const display = `${time.minutes}:${String(time.seconds).padStart(2, '0')}`;

    if (this.displayEl) {
      this.displayEl.textContent = display;
    }

    if (time.expired) {
      this.stop();
      if (this.onExpire) this.onExpire();
    }
  }
}

// POPUP MANAGER
class PopupManager {
  constructor(config = {}) {
    this.config = {
      trigger: 'time_delay', // 'time_delay', 'scroll_percent', 'disabled'
      triggerValue: 15000, // ms for time_delay, % for scroll
      enabled: true,
      autoClose: true,
      ...config
    };

    this.popupEl = null;
    this.overlayEl = null;
    this.timerEl = null;
    this.timer = null;
    this.isShown = false;
    this.scrollListener = null;

    this.init();
  }

  init() {
    if (!this.config.enabled) return;

    // Create popup HTML
    this.createPopup();

    // Setup trigger
    if (this.config.trigger === 'time_delay') {
      setTimeout(() => this.show(), this.config.triggerValue);
    } else if (this.config.trigger === 'scroll_percent') {
      this.setupScrollTrigger();
    }
  }

  createPopup() {
    // Create overlay
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'qb-popup-overlay';
    this.overlayEl.setAttribute('role', 'dialog');
    this.overlayEl.setAttribute('aria-modal', 'true');

    // Create content
    const content = document.createElement('div');
    content.className = 'qb-popup-content';
    content.innerHTML = `
      <button class="qb-popup-close" aria-label="Close offer popup">×</button>
      <h3 class="qb-popup-headline" id="qb-popup-headline">Exclusive Offer</h3>
      <p class="qb-popup-desc" id="qb-popup-desc">Limited time offer</p>
      <div class="qb-popup-timer" id="qb-popup-timer" aria-live="polite" role="status">01:00</div>
      <a href="/" class="qb-cta-btn" id="qb-popup-cta">Get Offer</a>
    `;

    this.overlayEl.appendChild(content);
    this.overlayEl.setAttribute('aria-labelledby', 'qb-popup-headline');

    document.body.appendChild(this.overlayEl);

    // Setup event listeners
    const closeBtn = this.overlayEl.querySelector('.qb-popup-close');
    closeBtn.addEventListener('click', () => this.close());

    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) this.close();
    });

    // Escape key closes popup
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isShown) this.close();
    });

    this.timerEl = this.overlayEl.querySelector('#qb-popup-timer');

    // Focus trap for accessibility - cycle focus only between Close and CTA buttons
    this.overlayEl.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusableElements = this.overlayEl.querySelectorAll('button, a[href]');
        if (focusableElements.length < 2) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  show() {
    if (this.isShown) return;

    // Check sessionStorage
    const storeKey = `qb_popup_shown_${window.location.hostname.split('.')[0]}`;
    if (sessionStorage.getItem(storeKey)) return;

    this.isShown = true;
    sessionStorage.setItem(storeKey, 'true');

    this.overlayEl.classList.add('active');

    // Start timer
    const timerMinutes = parseInt(this.overlayEl.dataset.qbTimerMinutes || '1');
    this.timer = new CountdownTimer(timerMinutes, this.timerEl);
    this.timer.onExpire = () => {
      if (this.config.autoClose) this.close();
    };
    this.timer.start();

    // Auto-focus close button for accessibility
    const closeBtn = this.overlayEl.querySelector('.qb-popup-close');
    setTimeout(() => closeBtn.focus(), 100);
  }

  close() {
    if (!this.isShown) return;

    this.isShown = false;
    this.overlayEl.classList.remove('active');

    if (this.timer) {
      this.timer.stop();
    }

    // Remove scroll listener if exists
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
    }
  }

  setupScrollTrigger() {
    const triggerPercent = this.config.triggerValue;

    const checkScroll = debounce(() => {
      if (this.isShown) return;

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight < 100) {
        // Short page fallback
        if (!this.scrollListener) {
          setTimeout(() => this.show(), 15000);
          window.removeEventListener('scroll', this.scrollListener);
        }
        return;
      }

      const scrollPercent = (window.scrollY / scrollHeight) * 100;
      if (scrollPercent >= triggerPercent) {
        this.show();
        window.removeEventListener('scroll', this.scrollListener);
      }
    }, 100);

    this.scrollListener = checkScroll;
    window.addEventListener('scroll', checkScroll);
  }

  destroy() {
    this.close();
    if (this.overlayEl && this.overlayEl.parentElement) {
      this.overlayEl.parentElement.removeChild(this.overlayEl);
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize carousels
  // NOTE: Liquid templates must include role="region" and aria-label="Promotional banner carousel"
  // on the [data-qb-carousel] container for proper accessibility labeling
  const carousels = document.querySelectorAll('[data-qb-carousel]');
  carousels.forEach(carousel => {
    const speed = parseInt(carousel.dataset.qbSpeed || '5000');
    const showTimers = carousel.dataset.qbShowTimers !== 'false';
    new CarouselController(carousel, { speed, showTimers });
  });

  // Initialize popup
  const popupConfig = window.qbPopupConfig || {};
  if (popupConfig.enabled !== false) {
    new PopupManager(popupConfig);
  }
});
