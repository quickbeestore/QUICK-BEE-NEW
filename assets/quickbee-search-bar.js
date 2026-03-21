/**
 * QuickBEE Search Bar Component
 * Simple & clean search with:
 * 1. Typing animation (rotating placeholders)
 * 2. Recent search history
 * Cache bust: 2026-03-22 12:16 UTC
 * 3. Search suggestions
 */

class QuickBeeSearchBar {
  // Constants
  static SEARCH_HISTORY_KEY = 'qb_search_history';
  static MAX_HISTORY_ITEMS = 10;
  static DEBOUNCE_DELAY = 300;
  static PLACEHOLDER_INTERVAL = 3000;
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
    suggestions: []
  };

  // DOM elements (will be populated via refs)
  #elements = {
    container: null,
    searchInput: null,
    placeholderText: null,
    dropdown: null,
    historySection: null,
    historyItems: null,
    suggestionsSection: null,
    suggestionItems: null,
    emptyMessage: null
  };

  // Timers
  #placeholderIndex = 0;
  #placeholderInterval = null;
  #searchDebounceTimer = null;

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
    // Map by ID
    this.#elements.searchInput = this.#elements.container.querySelector('#qbSearchInput');
    this.#elements.dropdown = this.#elements.container.querySelector('#qbSearchDropdown');

    // Map by class (fallback for sections that may not have IDs)
    this.#elements.historySection = this.#elements.container.querySelector('.qb-search-history');
    this.#elements.suggestionsSection = this.#elements.container.querySelector('.qb-search-suggestions');
    this.#elements.emptyMessage = this.#elements.container.querySelector('.qb-search-empty');

    // Map container items directly
    this.#elements.historyItems = this.#elements.container.querySelector('.qb-history-items');
    this.#elements.suggestionItems = this.#elements.container.querySelector('.qb-suggestion-items');

    // Map placeholder text span
    this.#elements.placeholderText = this.#elements.container.querySelector('.qb-search-placeholder-text');
  }

  /**
   * Validate that all required elements are present
   */
  #validateElements() {
    const required = ['searchInput', 'dropdown', 'historyItems', 'suggestionItems'];
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
      console.log('Search input focused');
      this.#stopPlaceholderRotation();
      if (this.#elements.placeholderText && !this.#elements.searchInput.value) {
        this.#elements.placeholderText.style.opacity = '0';
      }
      this.#showDropdown();
      if (!this.#elements.searchInput.value) {
        console.log('Input is empty, showing history or suggestions');
        const history = this.#getHistory();
        if (history.length > 0) {
          this.#showHistory();
        } else {
          // Show initial suggestions if no history
          this.#showInitialSuggestions();
        }
      }
    });

    this.#elements.searchInput.addEventListener('blur', () => {
      // Delay hide to allow click handlers to fire
      setTimeout(() => {
        this.#hideDropdown();
        if (this.#elements.placeholderText && !this.#elements.searchInput.value) {
          this.#elements.placeholderText.style.opacity = '1';
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

    // Click outside dropdown to close
    document.addEventListener('click', (e) => {
      if (!this.#elements.container.contains(e.target)) {
        this.#hideDropdown();
      }
    });

    // Clear history button
    const clearBtn = document.getElementById('qbClearHistory');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.#clearAllHistory();
        this.#showHistory();
      });
    }
  }

  /**
   * Handle search input - debounced
   */
  #onSearchInput(query) {
    // Hide placeholder text when user types
    if (this.#elements.placeholderText) {
      this.#elements.placeholderText.style.opacity = query.length > 0 ? '0' : '1';
      this.#elements.placeholderText.style.pointerEvents = query.length > 0 ? 'none' : 'auto';
    }

    if (this.#searchDebounceTimer) {
      clearTimeout(this.#searchDebounceTimer);
    }

    this.#searchState.query = query;

    this.#searchDebounceTimer = setTimeout(() => {
      if (query.length < 2) {
        this.#showHistory();
        return;
      }

      this.#showSuggestions(query);
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
   * Show initial suggestions when search bar is focused but empty
   */
  #showInitialSuggestions() {
    const categories = window.__QUICKBEE_SEARCH_DATA__?.categories || [];
    const suggestions = [];

    // Show top 3-4 categories as "Browse" suggestions
    categories.slice(0, Math.min(4, categories.length)).forEach(cat => {
      suggestions.push(`Browse ${cat}`);
    });

    // Add a trending/popular suggestion
    if (categories.length > 0) {
      suggestions.push(`Popular in ${categories[0]}`);
    }

    this.#searchState.suggestions = suggestions;

    // Render suggestions
    if (this.#elements.suggestionItems) {
      this.#elements.suggestionItems.innerHTML = '';
    }

    if (this.#searchState.suggestions.length > 0) {
      if (this.#elements.suggestionsSection) {
        this.#elements.suggestionsSection.hidden = false;
      }
      if (this.#elements.historySection) {
        this.#elements.historySection.hidden = true;
      }
      if (this.#elements.emptyMessage) {
        this.#elements.emptyMessage.hidden = true;
      }

      this.#searchState.suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'qb-suggestion-item';

        let suggestionType = suggestion.includes('Browse') ? 'browse' : 'trending';
        div.setAttribute('data-type', suggestionType);

        const iconEl = document.createElement('div');
        iconEl.className = 'qb-suggestion-icon';

        const textEl = document.createElement('div');
        textEl.className = 'qb-suggestion-text';
        textEl.textContent = suggestion;

        div.appendChild(iconEl);
        div.appendChild(textEl);

        div.addEventListener('click', () => {
          const cleanText = suggestion.replace('Browse ', '').replace('Popular in ', '');
          this.#elements.searchInput.value = cleanText;
          this.#onSearchSubmit(cleanText);
        });

        if (this.#elements.suggestionItems) {
          this.#elements.suggestionItems.appendChild(div);
        }
      });
    }

    this.#showDropdown();
  }

  /**
   * Show suggestions for the query (creative & smart)
   */
  #showSuggestions(query) {
    const categories = window.__QUICKBEE_SEARCH_DATA__?.categories || [];
    const normalized = this.#normalizeString(query);
    const suggestions = [];
    const seen = new Set();

    // 1. Add trending searches from history that match
    const history = this.#getHistory();
    const trendingMatches = history.filter(item =>
      this.#normalizeString(item).includes(normalized) && item !== query
    );
    trendingMatches.slice(0, 2).forEach(item => {
      suggestions.push(item);
      seen.add(this.#normalizeString(item));
    });

    // 2. Add matching categories with action text
    categories.forEach(cat => {
      if (this.#normalizeString(cat).includes(normalized) && !seen.has(this.#normalizeString(cat))) {
        suggestions.push(`Browse ${cat}`);
        seen.add(this.#normalizeString(cat));
      }
    });

    // 3. Add smart suggestion: "View deals in [category]" for matching categories
    categories.forEach(cat => {
      if (this.#normalizeString(cat).includes(normalized) && suggestions.length < 4) {
        const dealsText = `Deals in ${cat}`;
        if (!seen.has(this.#normalizeString(dealsText))) {
          suggestions.push(dealsText);
          seen.add(this.#normalizeString(dealsText));
        }
      }
    });

    // 4. Add the original query as a suggestion if it's different
    if (!seen.has(normalized) && query.length >= 2) {
      suggestions.push(`Search for "${query}"`);
    }

    this.#searchState.suggestions = suggestions.slice(0, 5);

    // Render suggestions
    if (this.#elements.suggestionItems) {
      this.#elements.suggestionItems.innerHTML = '';
    }
    if (this.#searchState.suggestions.length > 0) {
      if (this.#elements.suggestionsSection) {
        this.#elements.suggestionsSection.hidden = false;
      }
      if (this.#elements.historySection) {
        this.#elements.historySection.hidden = true;
      }
      if (this.#elements.emptyMessage) {
        this.#elements.emptyMessage.hidden = true;
      }

      this.#searchState.suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'qb-suggestion-item';

        // Determine suggestion type and icon
        let suggestionType = 'search';
        let displayText = suggestion;
        let badge = '';

        const history = this.#getHistory();
        const isTrending = history.includes(suggestion) && suggestion !== query;

        if (isTrending && !suggestion.includes('Browse') && !suggestion.includes('Deals') && !suggestion.includes('Search for')) {
          suggestionType = 'trending';
          badge = 'TRENDING';
        } else if (suggestion.includes('Browse')) {
          suggestionType = 'browse';
        } else if (suggestion.includes('Deals')) {
          suggestionType = 'deals';
        } else if (suggestion.includes('Search for')) {
          suggestionType = 'search';
        }

        div.setAttribute('data-type', suggestionType);

        // Build the suggestion item HTML
        const iconEl = document.createElement('div');
        iconEl.className = 'qb-suggestion-icon';

        const textEl = document.createElement('div');
        textEl.className = 'qb-suggestion-text';
        textEl.textContent = displayText;

        div.appendChild(iconEl);
        div.appendChild(textEl);

        if (badge) {
          const badgeEl = document.createElement('div');
          badgeEl.className = 'qb-suggestion-badge';
          badgeEl.textContent = badge;
          div.appendChild(badgeEl);
        }

        div.addEventListener('click', () => {
          // Extract clean text (remove "Browse ", "Deals in ", etc.)
          let cleanText = suggestion;
          if (suggestion.includes('Browse ')) {
            cleanText = suggestion.replace('Browse ', '');
          } else if (suggestion.includes('Deals in ')) {
            cleanText = suggestion.replace('Deals in ', '');
          } else if (suggestion.includes('Search for "')) {
            cleanText = suggestion.replace('Search for "', '').replace('"', '');
          }

          this.#elements.searchInput.value = cleanText;
          this.#onSearchSubmit(cleanText);
        });

        if (this.#elements.suggestionItems) {
          this.#elements.suggestionItems.appendChild(div);
        }
      });
    } else {
      if (this.#elements.suggestionsSection) {
        this.#elements.suggestionsSection.hidden = true;
      }
      if (this.#elements.historySection) {
        this.#elements.historySection.hidden = true;
      }
      if (this.#elements.emptyMessage) {
        this.#elements.emptyMessage.hidden = false;
      }
    }

    this.#showDropdown();
  }


  /**
   * Show search history (when input is empty)
   */
  #showHistory() {
    console.log('showHistory called, historySection:', !!this.#elements.historySection);
    if (this.#elements.suggestionsSection) {
      this.#elements.suggestionsSection.hidden = true;
    }
    if (this.#elements.emptyMessage) {
      this.#elements.emptyMessage.hidden = true;
    }

    const history = this.#getHistory();
    console.log('History items:', history.length);
    if (this.#elements.historyItems) {
      this.#elements.historyItems.innerHTML = '';
    }

    if (history.length > 0) {
      if (this.#elements.historySection) {
        this.#elements.historySection.hidden = false;
      }
      history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'qb-history-item';

        const text = document.createElement('span');
        text.textContent = item;
        div.appendChild(text);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'qb-remove-history';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.#removeFromHistory(item);
          this.#showHistory();
        });
        div.appendChild(removeBtn);

        div.addEventListener('click', () => {
          this.#elements.searchInput.value = item;
          this.#onSearchSubmit(item);
        });

        if (this.#elements.historyItems) {
          this.#elements.historyItems.appendChild(div);
        }
      });
    } else {
      if (this.#elements.historySection) {
        this.#elements.historySection.hidden = true;
      }
    }

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
   * Clear all search history
   */
  #clearAllHistory() {
    localStorage.removeItem(QuickBeeSearchBar.SEARCH_HISTORY_KEY);
  }

  /**
   * Start rotating placeholders
   */
  #startPlaceholderRotation() {
    if (this.#placeholderInterval) return;

    // Set initial placeholder
    if (this.#elements.placeholderText) {
      this.#updatePlaceholder();
    }

    this.#placeholderInterval = setInterval(() => {
      if (document.activeElement !== this.#elements.searchInput && this.#elements.placeholderText && !this.#elements.searchInput.value) {
        this.#placeholderIndex = (this.#placeholderIndex + 1) % this.#rotatingPlaceholders.length;
        this.#updatePlaceholder();
      }
    }, QuickBeeSearchBar.PLACEHOLDER_INTERVAL);
  }

  /**
   * Update placeholder text
   */
  #updatePlaceholder() {
    if (this.#elements.placeholderText) {
      this.#elements.placeholderText.textContent = this.#rotatingPlaceholders[this.#placeholderIndex];
    }
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

    const searchRect = this.#elements.searchInput.getBoundingClientRect();
    const dropdown = this.#elements.dropdown;
    const isMobile = window.innerWidth <= 640;

    // Position dropdown below search input
    dropdown.style.top = (searchRect.bottom + 8) + 'px';

    if (isMobile) {
      // Mobile: full width dropdown aligned to viewport
      dropdown.style.left = '0';
      dropdown.style.right = '0';
      dropdown.style.width = '100vw';
      dropdown.style.marginLeft = 'calc(-50vw + 50%)';
    } else {
      // Desktop: align with search bar
      dropdown.style.left = searchRect.left + 'px';
      dropdown.style.right = 'auto';
      dropdown.style.width = searchRect.width + 'px';
      dropdown.style.marginLeft = '0';
    }
  }

  /**
   * Normalize string for comparison
   */
  #normalizeString(str) {
    return (str || '').toLowerCase().trim();
  }
}

// Export for module usage
export default QuickBeeSearchBar;
