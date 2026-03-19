class QuickBeeCarousel {
  constructor(container, options = {}) {
    this.container = container;
    this.currentIndex = 0;
    this.autoPlay = options.autoPlay ?? true;
    this.autoPlayDelay = options.autoPlayDelay ?? 5000;
    this.visibleItems = options.visibleItems ?? 1;
    this.setup();
  }

  setup() {
    this.items = this.container.querySelectorAll('[data-carousel-item]');
    this.prevBtn = this.container.querySelector('[data-carousel-prev]');
    this.nextBtn = this.container.querySelector('[data-carousel-next]');

    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

    if (this.autoPlay) this.startAutoPlay();
    this.updateCarousel();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.updateCarousel();
    if (this.autoPlay) this.resetAutoPlay();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.updateCarousel();
    if (this.autoPlay) this.resetAutoPlay();
  }

  updateCarousel() {
    this.items.forEach((item, index) => {
      item.style.display = index === this.currentIndex ? 'block' : 'none';
      item.classList.toggle('carousel-active', index === this.currentIndex);
    });
  }

  startAutoPlay() {
    this.autoPlayTimer = setInterval(() => this.next(), this.autoPlayDelay);
  }

  resetAutoPlay() {
    clearInterval(this.autoPlayTimer);
    this.startAutoPlay();
  }

  destroy() {
    clearInterval(this.autoPlayTimer);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarousels);
} else {
  initCarousels();
}

function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    new QuickBeeCarousel(carousel);
  });
}
