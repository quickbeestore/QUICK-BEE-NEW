// Speed-First Product Page - Main JavaScript

(function() {
  'use strict';

  // ===== COUNTDOWN TIMER =====
  class CountdownTimer {
    constructor(elementId, offerEndTime) {
      this.element = document.getElementById(elementId);
      if (!this.element) return;

      this.endTime = new Date(offerEndTime);
      this.announcedMilestones = new Set();

      this.init();
    }

    init() {
      this.update();
      setInterval(() => this.update(), 60000);
    }

    update() {
      const now = new Date();
      const timeLeft = this.endTime - now;

      if (timeLeft <= 0) {
        this.element.classList.add('expired');
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      const text = `Free delivery expires in ${hours}h ${minutes}m`;
      const textEl = this.element.querySelector('.countdown-text');
      if (textEl) textEl.textContent = text;

      if (timeLeft < 5 * 60 * 1000 && !this.announcedMilestones.has('5min')) {
        this.announcedMilestones.add('5min');
        this.announce(`Urgent: ${text}`);
      } else if (timeLeft < 30 * 60 * 1000 && !this.announcedMilestones.has('30min')) {
        this.announcedMilestones.add('30min');
        this.announce(`Only 30 minutes left for free delivery!`);
      }

      if (timeLeft < 30 * 60 * 1000) {
        this.element.classList.add('expiring-soon');
      } else {
        this.element.classList.remove('expiring-soon');
      }
    }

    announce(message) {
      const liveRegion = this.element.getAttribute('aria-live');
      if (liveRegion) {
        const textEl = this.element.querySelector('.countdown-text');
        if (textEl) textEl.textContent = message;
      }
    }
  }

  // ===== IMAGE GALLERY =====
  class ImageGallery {
    constructor(containerSelector) {
      this.container = document.querySelector(containerSelector);
      if (!this.container) return;

      this.currentIndex = 0;
      this.images = this.container.querySelectorAll('img');
      this.init();
    }

    init() {
      const prevBtn = this.container.querySelector('.gallery-prev');
      const nextBtn = this.container.querySelector('.gallery-next');

      if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
      if (nextBtn) nextBtn.addEventListener('click', () => this.next());

      this.setupSwipeGestures();
    }

    next() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.updateDisplay();
    }

    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.updateDisplay();
    }

    updateDisplay() {
      this.images.forEach((img, i) => {
        img.style.display = i === this.currentIndex ? 'block' : 'none';
      });

      const counter = this.container.querySelector('.gallery-counter');
      if (counter) {
        counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
      }
    }

    setupSwipeGestures() {
      let startX = 0;

      this.container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      });

      this.container.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) this.next();
        if (endX - startX > 50) this.prev();
      });
    }
  }

  // ===== TOAST NOTIFICATIONS =====
  function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#22c55e',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      zIndex: '999',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    });

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, duration);
  }

  // ===== VARIANT SELECTOR =====
  function setupVariantSelector() {
    const select = document.getElementById('variant-select');
    if (!select) return;

    select.addEventListener('change', function() {
      const variantId = this.value;
      const selectedOption = this.options[this.selectedIndex];

      const form = document.querySelector('form[action="/cart/add"]') ||
                   document.querySelector('#quantity-form');
      if (form) {
        const idInput = form.querySelector('input[name="id"]');
        if (idInput) idInput.value = variantId;
      }

      const priceEl = document.querySelector('.current-price');
      if (priceEl && selectedOption.dataset.price) {
        priceEl.textContent = selectedOption.dataset.price;
      }
    });
  }

  // ===== COLLAPSIBLE SECTIONS =====
  function setupCollapsibleSections() {
    const headers = document.querySelectorAll('.collapsible-header');

    headers.forEach(header => {
      header.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        const content = this.nextElementSibling;

        if (!content) return;

        if (isExpanded) {
          content.style.display = 'none';
          this.setAttribute('aria-expanded', 'false');
        } else {
          content.style.display = 'block';
          this.setAttribute('aria-expanded', 'true');
        }
      });

      header.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          header.click();
        }
      });
    });
  }

  // ===== MODAL FUNCTIONALITY =====
  function setupModal() {
    const modal = document.getElementById('quantity-selector-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    const addToCartBtn = document.getElementById('add-to-cart-button');

    const closeModal = () => modal.classList.remove('active');
    const openModal = () => modal.classList.add('active');

    if (addToCartBtn) addToCartBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // ===== UTILITY FUNCTIONS =====
  function formatMoney(cents) {
    if (typeof cents === 'string') {
      cents = parseInt(cents.replace(/\D/g, ''));
    }
    return '$' + (cents / 100).toFixed(2);
  }

  // ===== INITIALIZE ALL =====
  document.addEventListener('DOMContentLoaded', function() {
    setupVariantSelector();
    setupCollapsibleSections();
    setupModal();

    new ImageGallery('.product-image-section');
    new CountdownTimer('delivery-countdown', new Date(Date.now() + 2.25 * 60 * 60 * 1000));
  });

  window.showToast = showToast;
  window.formatMoney = formatMoney;
})();
