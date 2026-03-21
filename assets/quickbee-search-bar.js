/**
 * QuickBEE Search Bar Component
 * Implements 6 features:
 * 1. Live product search
 * 2. Autocomplete suggestions
 * 3. Dropdown results
 * 4. Rotating placeholders
 * 5. Search filters (category, price)
 * 6. Search history
 */

class QuickBeeSearchBar {
  // Constants
  static SEARCH_HISTORY_KEY = 'qb_search_history';
  static MAX_HISTORY_ITEMS = 10;
  static DEBOUNCE_DELAY = 300;
  static FILTER_DEBOUNCE_DELAY = 500;
  static PLACEHOLDER_INTERVAL = 3000;
  static MAX_RESULTS = 8;
  static MAX_SUGGESTIONS = 5;

  // Rotating placeholder texts
  #rotatingPlaceholders = [
    'Search products…',
    'Find groceries…',
    'Browse deals…',
    'Search by name…',
    'Discover items…'
  ];

  // State
  #searchState = {
    query: '',
    selectedCategory: '',
    priceMin: 0,
    priceMax: 999,
    results: [],
    suggestions: []
  };

  // DOM elements (will be populated via refs)
  #elements = {
    container: null,
    searchInput: null,
    placeholderText: null,
    dropdown: null,
    filtersSection: null,
    categoryFilter: null,
    priceMin: null,
    priceMax: null,
    priceDisplay: null,
    historySection: null,
    historyItems: null,
    suggestionsSection: null,
    suggestionItems: null,
    resultsSection: null,
    resultItems: null,
    emptyMessage: null
  };

  // Timers
  #placeholderIndex = 0;
  #placeholderInterval = null;
  #searchDebounceTimer = null;
  #filterDebounceTimer = null;

  constructor(containerElement) {
    if (!containerElement) {
      console.error('QuickBeeSearchBar: container element not found');
      return;
    }

    this.#elements.container = containerElement;

    // Get all required elements using ref attributes
    this.#mapElements();

    // Validate required elements
    if (!this.#validateElements()) {
      console.error('QuickBeeSearchBar: required elements not found');
      return;
    }

    // Initialize
    this.#init();
  }

  /**
   * Map DOM elements using ref attributes
   */
  #mapElements() {
    const refs = {
      searchInput: 'qbSearchInput',
      dropdown: 'qbSearchDropdown',
      filtersSection: 'qbSearchFilters',
      categoryFilter: 'qbCategoryFilter',
      priceMin: 'qbPriceMin',
      priceMax: 'qbPriceMax',
      priceDisplay: 'qb-price-range',
      historySection: 'qbSearchHistory',
      historyItems: 'history items container',
      suggestionsSection: 'qbSearchSuggestions',
      suggestionItems: 'suggestion items container',
      resultsSection: 'qbSearchResults',
      resultItems: 'result items container',
      emptyMessage: 'qbSearchEmpty'
    };

    for (const [key, id] of Object.entries(refs)) {
      const el = this.#elements.container.querySelector(`[id="${id}"]`);
      if (el) {
        this.#elements[key] = el;
      }
    }

    // Map container items directly
    this.#elements.historyItems = this.#elements.container.querySelector('.qb-history-items');
    this.#elements.suggestionItems = this.#elements.container.querySelector('.qb-suggestion-items');
    this.#elements.resultItems = this.#elements.container.querySelector('.qb-result-items');

    // Map placeholder text span
    this.#elements.placeholderText = this.#elements.container.querySelector('.qb-search-placeholder-text');
  }

  /**
   * Validate that all required elements are present
   */
  #validateElements() {
    const required = ['searchInput', 'dropdown', 'filtersSection', 'categoryFilter', 'historyItems', 'suggestionItems', 'resultItems'];
    for (const key of required) {
      if (!this.#elements[key]) {
        console.warn(`QuickBeeSearchBar: missing element: ${key}`);
      }
    }
    return this.#elements.searchInput && this.#elements.dropdown;
  }

  /**
   * Initialize the search bar
   */
  #init() {
    this.#attachEventListeners();
    this.#startPlaceholderRotation();
    this.#positionDropdown();
    window.addEventListener('resize', () => this.#positionDropdown());
  }

  /**
   * Attach all event listeners
   */
  #attachEventListeners() {
    // Input event - live search with debounce
    this.#elements.searchInput.addEventListener('input', (e) => {
      this.#onSearchInput(e.target.value);
    });

    // Focus/blur for placeholder rotation and dropdown visibility
    this.#elements.searchInput.addEventListener('focus', () => {
      this.#stopPlaceholderRotation();
      if (this.#elements.placeholderText) {
        this.#elements.placeholderText.style.display = 'none';
      }
      this.#showDropdown();
      if (!this.#elements.searchInput.value) {
        this.#showHistory();
      }
    });

    this.#elements.searchInput.addEventListener('blur', () => {
      // Delay hide to allow click handlers to fire
      setTimeout(() => {
        this.#hideDropdown();
        if (this.#elements.placeholderText && !this.#elements.searchInput.value) {
          this.#elements.placeholderText.style.display = 'inline-block';
        }
        this.#startPlaceholderRotation();
      }, 200);
    });

    // Enter key - submit search
    this.#elements.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.#onSearchSubmit(this.#elements.searchInput.value);
      }
    });

    // Category filter change
    this.#elements.categoryFilter.addEventListener('change', (e) => {
      this.#onFilterChange();
    });

    // Price range filters
    if (this.#elements.priceMin && this.#elements.priceMax) {
      this.#elements.priceMin.addEventListener('input', () => this.#onFilterChange());
      this.#elements.priceMax.addEventListener('input', () => this.#onFilterChange());
    }

    // Click outside dropdown to close
    document.addEventListener('click', (e) => {
      if (!this.#elements.container.contains(e.target)) {
        this.#hideDropdown();
      }
    });
  }

  /**
   * Handle search input - debounced
   */
  #onSearchInput(query) {
    // Hide placeholder text when user types
    if (this.#elements.placeholderText) {
      this.#elements.placeholderText.style.display = query.length > 0 ? 'none' : 'inline-block';
    }

    if (this.#searchDebounceTimer) {
      clearTimeout(this.#searchDebounceTimer);
    }

    this.#searchDebounceTimer = setTimeout(() => {
      if (query.length < 2) {
        this.#showHistory();
        return;
      }

      this.#searchProducts(query);
    }, QuickBeeSearchBar.DEBOUNCE_DELAY);
  }

  /**
   * Handle search submission (Enter key)
   */
  #onSearchSubmit(query) {
    if (query.length >= 2) {
      this.#addToHistory(query);
      window.location = `${window.__QUICKBEE_SEARCH_DATA__.searchRoute}?q=${encodeURIComponent(query)}`;
    }
  }

  /**
   * Handle filter changes - debounced
   */
  #onFilterChange() {
    if (this.#filterDebounceTimer) {
      clearTimeout(this.#filterDebounceTimer);
    }

    this.#filterDebounceTimer = setTimeout(() => {
      // Update filter state
      this.#searchState.selectedCategory = this.#elements.categoryFilter.value;
      this.#searchState.priceMin = parseFloat(this.#elements.priceMin.value) || 0;
      this.#searchState.priceMax = parseFloat(this.#elements.priceMax.value) || 999;

      // Update price display
      if (this.#elements.priceDisplay) {
        this.#elements.priceDisplay.textContent = `$${this.#searchState.priceMin} - $${this.#searchState.priceMax}`;
      }

      // Re-apply search with new filters
      if (this.#searchState.query.length >= 2) {
        this.#searchProducts(this.#searchState.query);
      }
    }, QuickBeeSearchBar.FILTER_DEBOUNCE_DELAY);
  }

  /**
   * Fetch and display search results
   */
  async #searchProducts(query) {
    this.#searchState.query = query;

    try {
      // Fetch from Shopify's search endpoint
      const response = await fetch(`/search.json?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();

      // Apply filters
      let filtered = (data.results || []).filter(product => {
        const meetsCategory = !this.#searchState.selectedCategory ||
          (product.type && product.type.includes(this.#searchState.selectedCategory));

        const price = product.price ? Math.floor(product.price / 100) : 0;
        const meetsPriceMin = price >= this.#searchState.priceMin;
        const meetsPriceMax = price <= this.#searchState.priceMax;

        return meetsCategory && meetsPriceMin && meetsPriceMax;
      });

      // Store and render
      this.#searchState.results = filtered.slice(0, QuickBeeSearchBar.MAX_RESULTS);
      this.#generateSuggestions(query);
      this.#renderResults();
    } catch (error) {
      console.error('Search error:', error);
      this.#showEmptyMessage('Search failed. Please try again.');
    }
  }

  /**
   * Generate autocomplete suggestions from results and categories
   */
  #generateSuggestions(query) {
    const normalized = this.#normalizeString(query);
    const suggestions = new Set();

    // Add matching product titles (first word only)
    this.#searchState.results.forEach(product => {
      if (product.title) {
        const titleLower = this.#normalizeString(product.title);
        if (titleLower.includes(normalized)) {
          const firstWord = product.title.split(' ')[0];
          suggestions.add(firstWord);
        }
      }
    });

    // Add matching categories
    const categories = window.__QUICKBEE_SEARCH_DATA__.categories || [];
    categories.forEach(cat => {
      if (this.#normalizeString(cat).includes(normalized)) {
        suggestions.add(cat);
      }
    });

    this.#searchState.suggestions = Array.from(suggestions).slice(0, QuickBeeSearchBar.MAX_SUGGESTIONS);
  }

  /**
   * Render search results in dropdown
   */
  #renderResults() {
    const { results, suggestions } = this.#searchState;

    // Hide history and suggestions if we have results
    if (results.length > 0) {
      this.#elements.historySection.hidden = true;
    }

    // Render suggestions
    this.#elements.suggestionItems.innerHTML = '';
    if (suggestions.length > 0) {
      this.#elements.suggestionsSection.hidden = false;
      suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'qb-suggestion-item';
        div.textContent = suggestion;
        div.addEventListener('click', () => {
          this.#elements.searchInput.value = suggestion;
          this.#searchProducts(suggestion);
        });
        this.#elements.suggestionItems.appendChild(div);
      });
    } else {
      this.#elements.suggestionsSection.hidden = true;
    }

    // Render product results
    this.#elements.resultItems.innerHTML = '';
    if (results.length > 0) {
      this.#elements.resultsSection.hidden = false;
      this.#elements.emptyMessage.hidden = true;

      results.forEach(product => {
        const div = document.createElement('div');
        div.className = 'qb-result-item';

        // Get image URL
        const imageUrl = product.featured_image?.url || product.image?.src || '';
        const imageSrc = imageUrl ? this.#normalizeImageUrl(imageUrl) : '';

        // Format price
        const price = product.price ? `$${(product.price / 100).toFixed(2)}` : 'N/A';

        div.innerHTML = `
          ${imageSrc ? `<img src="${imageSrc}" alt="${product.title}" class="qb-result-image">` : '<div class="qb-result-image"></div>'}
          <div class="qb-result-info">
            <h4 class="qb-result-title">${this.#escapeHtml(product.title || '')}</h4>
            <p class="qb-result-price">${price}</p>
          </div>
        `;

        div.addEventListener('click', () => {
          this.#addToHistory(this.#searchState.query);
          window.location = product.url;
        });

        this.#elements.resultItems.appendChild(div);
      });
    } else if (this.#searchState.query.length >= 2) {
      this.#elements.resultsSection.hidden = true;
      this.#elements.emptyMessage.hidden = false;
      this.#elements.suggestionsSection.hidden = true;
    }

    this.#showDropdown();
  }

  /**
   * Show search history (when input is empty)
   */
  #showHistory() {
    this.#elements.suggestionsSection.hidden = true;
    this.#elements.resultsSection.hidden = true;
    this.#elements.emptyMessage.hidden = true;

    const history = this.#getHistory();
    this.#elements.historyItems.innerHTML = '';

    if (history.length > 0) {
      this.#elements.historySection.hidden = false;
      history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'qb-history-item';

        const text = document.createElement('span');
        text.textContent = item;
        div.appendChild(text);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'qb-remove-history';
        removeBtn.textContent = '✕';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.#removeFromHistory(item);
          this.#showHistory();
        });
        div.appendChild(removeBtn);

        div.addEventListener('click', () => {
          this.#elements.searchInput.value = item;
          this.#searchProducts(item);
        });

        this.#elements.historyItems.appendChild(div);
      });
    } else {
      this.#elements.historySection.hidden = true;
    }

    this.#showDropdown();
  }

  /**
   * Show empty message
   */
  #showEmptyMessage(message) {
    this.#elements.historySection.hidden = true;
    this.#elements.suggestionsSection.hidden = true;
    this.#elements.resultsSection.hidden = true;
    this.#elements.emptyMessage.hidden = false;
    this.#elements.emptyMessage.textContent = message;
    this.#showDropdown();
  }

  /**
   * Add search query to history
   */
  #addToHistory(query) {
    if (!query || query.length < 2) return;

    let history = this.#getHistory();
    // Remove duplicate if exists
    history = history.filter(item => item !== query);
    // Add to front
    history.unshift(query);
    // Limit size
    history = history.slice(0, QuickBeeSearchBar.MAX_HISTORY_ITEMS);

    localStorage.setItem(QuickBeeSearchBar.SEARCH_HISTORY_KEY, JSON.stringify(history));
  }

  /**
   * Get search history from localStorage
   */
  #getHistory() {
    try {
      const stored = localStorage.getItem(QuickBeeSearchBar.SEARCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to read search history:', error);
      return [];
    }
  }

  /**
   * Remove item from history
   */
  #removeFromHistory(item) {
    let history = this.#getHistory();
    history = history.filter(h => h !== item);
    localStorage.setItem(QuickBeeSearchBar.SEARCH_HISTORY_KEY, JSON.stringify(history));
  }

  /**
   * Start rotating placeholders
   */
  #startPlaceholderRotation() {
    if (this.#placeholderInterval) return;

    // Set initial placeholder
    if (this.#elements.placeholderText) {
      this.#elements.placeholderText.textContent = this.#rotatingPlaceholders[this.#placeholderIndex];
    }

    this.#placeholderInterval = setInterval(() => {
      if (document.activeElement !== this.#elements.searchInput && this.#elements.placeholderText) {
        this.#placeholderIndex = (this.#placeholderIndex + 1) % this.#rotatingPlaceholders.length;
        this.#elements.placeholderText.textContent = this.#rotatingPlaceholders[this.#placeholderIndex];
      }
    }, QuickBeeSearchBar.PLACEHOLDER_INTERVAL);
  }

  /**
   * Stop rotating placeholders
   */
  #stopPlaceholderRotation() {
    if (this.#placeholderInterval) {
      clearInterval(this.#placeholderInterval);
      this.#placeholderInterval = null;
    }
  }

  /**
   * Show dropdown
   */
  #showDropdown() {
    if (this.#elements.dropdown) {
      this.#elements.dropdown.hidden = false;
      this.#positionDropdown();
    }
  }

  /**
   * Hide dropdown
   */
  #hideDropdown() {
    if (this.#elements.dropdown) {
      this.#elements.dropdown.hidden = true;
    }
  }

  /**
   * Position dropdown below search input
   */
  #positionDropdown() {
    if (!this.#elements.dropdown || !this.#elements.searchInput) return;

    const rect = this.#elements.searchInput.getBoundingClientRect();
    const containerRect = this.#elements.container.getBoundingClientRect();

    this.#elements.dropdown.style.position = 'fixed';
    this.#elements.dropdown.style.top = `${rect.bottom + 8}px`;
    this.#elements.dropdown.style.left = `${containerRect.left}px`;
    this.#elements.dropdown.style.right = 'auto';
    this.#elements.dropdown.style.width = `${rect.width}px`;
  }

  /**
   * Normalize string for comparison
   */
  #normalizeString(str) {
    return (str || '').toLowerCase().trim();
  }

  /**
   * Normalize image URL for Shopify
   */
  #normalizeImageUrl(url) {
    if (!url) return '';
    // Add size parameter for optimization
    if (url.includes('?')) {
      return url.replace('?', '?width=100&height=100&crop=center&');
    }
    return `${url}?width=100&height=100&crop=center`;
  }

  /**
   * Escape HTML to prevent XSS
   */
  #escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for module usage
export default QuickBeeSearchBar;
