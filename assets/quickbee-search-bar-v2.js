/**
 * QuickBEE Search Bar v2 - Simplified
 * Cache bust: 2026-03-22 12:42 UTC
 */

class QuickBeeSearchBar {
  constructor() {
    // Get elements by ID directly
    this.searchInput = document.getElementById('qbSearchInput');
    this.dropdown = document.getElementById('qbSearchDropdown');
    this.historySection = document.getElementById('qbSearchHistory');
    this.suggestionsSection = document.getElementById('qbSearchSuggestions');
    this.historyItems = document.querySelector('.qb-history-items');
    this.suggestionItems = document.querySelector('.qb-suggestion-items');
    this.emptyMessage = document.getElementById('qbSearchEmpty');
    this.clearBtn = document.getElementById('qbClearHistory');

    console.log('Elements found:', {
      searchInput: !!this.searchInput,
      dropdown: !!this.dropdown,
      historySection: !!this.historySection,
      suggestionsSection: !!this.suggestionsSection,
      historyItems: !!this.historyItems,
      suggestionItems: !!this.suggestionItems,
    });

    if (!this.searchInput || !this.dropdown) {
      console.error('Critical elements missing');
      return;
    }

    this.init();
  }

  init() {
    console.log('Initializing search bar...');
    this.attachEvents();
    this.showHistory();
  }

  attachEvents() {
    // Focus event
    this.searchInput.addEventListener('focus', () => {
      console.log('Search focused');
      this.showDropdown();
      this.showHistory();
    });

    // Blur event
    this.searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        this.hideDropdown();
      }, 200);
    });

    // Input event
    this.searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      console.log('Input:', query);

      if (query.length < 2) {
        this.showHistory();
      } else {
        this.showSuggestions(query);
      }
    });

    // Enter key
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.search(this.searchInput.value);
      }
    });

    // Clear button
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        localStorage.removeItem('qb_search_history');
        this.showHistory();
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!document.getElementById('qbSearchContainer').contains(e.target)) {
        this.hideDropdown();
      }
    });
  }

  showHistory() {
    console.log('Showing history');
    const history = this.getHistory();

    if (this.suggestionsSection) this.suggestionsSection.hidden = true;
    if (this.emptyMessage) this.emptyMessage.hidden = true;
    if (this.historySection) this.historySection.hidden = false;

    if (this.historyItems) {
      this.historyItems.innerHTML = '';

      history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'qb-history-item';

        const text = document.createElement('span');
        text.textContent = item;

        const btn = document.createElement('button');
        btn.className = 'qb-remove-history';
        btn.textContent = '×';
        btn.onclick = (e) => {
          e.stopPropagation();
          this.removeHistory(item);
          this.showHistory();
        };

        div.appendChild(text);
        div.appendChild(btn);

        div.addEventListener('click', () => {
          this.searchInput.value = item;
          this.search(item);
        });

        this.historyItems.appendChild(div);
      });
    }

    this.showDropdown();
  }

  showSuggestions(query) {
    console.log('Showing suggestions for:', query);
    const categories = window.__QUICKBEE_SEARCH_DATA__?.categories || [];
    const suggestions = [];

    // Add matching categories
    categories.forEach(cat => {
      if (cat.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push(`Browse ${cat}`);
      }
    });

    if (this.historySection) this.historySection.hidden = true;
    if (this.emptyMessage) this.emptyMessage.hidden = true;
    if (this.suggestionsSection) this.suggestionsSection.hidden = false;

    if (this.suggestionItems) {
      this.suggestionItems.innerHTML = '';

      suggestions.slice(0, 5).forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'qb-suggestion-item';
        div.setAttribute('data-type', 'browse');

        const icon = document.createElement('div');
        icon.className = 'qb-suggestion-icon';

        const text = document.createElement('div');
        text.className = 'qb-suggestion-text';
        text.textContent = suggestion;

        div.appendChild(icon);
        div.appendChild(text);

        div.addEventListener('click', () => {
          const clean = suggestion.replace('Browse ', '');
          this.searchInput.value = clean;
          this.search(clean);
        });

        this.suggestionItems.appendChild(div);
      });
    }

    this.showDropdown();
  }

  showDropdown() {
    if (this.dropdown) {
      this.dropdown.hidden = false;
      this.dropdown.style.display = 'block';
      console.log('Dropdown shown');
    }
  }

  hideDropdown() {
    if (this.dropdown) {
      this.dropdown.hidden = true;
      this.dropdown.style.display = 'none';
    }
  }

  search(query) {
    if (query.length >= 2) {
      this.addHistory(query);
      const searchUrl = window.__QUICKBEE_SEARCH_DATA__?.searchRoute || '/search';
      window.location = `${searchUrl}?q=${encodeURIComponent(query)}`;
    }
  }

  getHistory() {
    try {
      const stored = localStorage.getItem('qb_search_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  addHistory(query) {
    let history = this.getHistory();
    history = history.filter(h => h !== query);
    history.unshift(query);
    history = history.slice(0, 10);
    localStorage.setItem('qb_search_history', JSON.stringify(history));
  }

  removeHistory(item) {
    let history = this.getHistory();
    history = history.filter(h => h !== item);
    localStorage.setItem('qb_search_history', JSON.stringify(history));
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing search bar');
    new QuickBeeSearchBar();
  });
} else {
  console.log('DOM already loaded, initializing search bar');
  new QuickBeeSearchBar();
}
