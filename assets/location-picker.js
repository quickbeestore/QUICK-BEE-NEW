/**
 * Location Picker Component
 * Handles geo-location detection and hierarchical location selection
 * No search functionality - pure dropdown selection
 */

class LocationPicker {
  constructor(options = {}) {
    this.options = {
      buttonSelector: '.location-picker-button',
      dataUrl: '/cdn/shop/files/areas-data.json?v=1',
      storageKey: 'quickbee_selected_location',
      cartAttributeKey: 'location',
      ...options
    };

    this.state = {
      isOpen: false,
      selectedDistrict: null,
      selectedMunicipality: null,
      selectedArea: null,
      areasData: null,
      isDetecting: false,
      detectionPermission: null
    };

    this.DOM = {
      button: null,
      dropdown: null,
      autoDetect: null
    };

    this.init();
  }

  /**
   * Initialize the location picker
   */
  async init() {
    try {
      // Load areas data
      await this.loadAreasData();

      // Find and setup DOM elements
      this.setupDOM();

      // Restore previously selected location
      this.restoreLocation();

      // Setup event listeners
      this.setupEventListeners();

      // Initialize geo-location detection
      this.initializeGeolocation();

      console.log('[LocationPicker] Initialized successfully');
    } catch (error) {
      console.error('[LocationPicker] Initialization failed:', error);
    }
  }

  /**
   * Load areas data from JSON file
   */
  async loadAreasData() {
    try {
      const response = await fetch(this.options.dataUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.state.areasData = await response.json();
      console.log('[LocationPicker] Data loaded:', this.state.areasData);
    } catch (error) {
      console.error('[LocationPicker] Failed to load areas data:', error);
      throw error;
    }
  }

  /**
   * Setup DOM elements
   */
  setupDOM() {
    this.DOM.button = document.querySelector(this.options.buttonSelector);

    if (!this.DOM.button) {
      console.warn('[LocationPicker] Button element not found');
      return;
    }

    // Create dropdown container
    this.DOM.dropdown = document.createElement('div');
    this.DOM.dropdown.className = 'location-picker-dropdown';
    this.DOM.dropdown.setAttribute('role', 'listbox');
    this.DOM.dropdown.setAttribute('aria-label', 'Select delivery location');

    // Insert dropdown after button
    this.DOM.button.parentElement.style.position = 'relative';
    this.DOM.button.parentElement.appendChild(this.DOM.dropdown);

    // Render initial dropdown content
    this.renderDistrictList();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (!this.DOM.button) return;

    // Button click to toggle dropdown
    this.DOM.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.DOM.button.parentElement.contains(e.target)) {
        this.closeDropdown();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.state.isOpen) return;

      switch (e.key) {
        case 'Escape':
          this.closeDropdown();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault();
          this.handleKeyboardNavigation(e.key);
          break;
        case 'Enter':
          e.preventDefault();
          this.handleKeyboardSelect();
          break;
      }
    });
  }

  /**
   * Initialize geolocation detection
   */
  initializeGeolocation() {
    if (!('geolocation' in navigator)) {
      console.warn('[LocationPicker] Geolocation not supported');
      return;
    }

    // Check if user has already denied permission
    navigator.permissions?.query({ name: 'geolocation' }).then((permission) => {
      this.state.detectionPermission = permission.state;
      permission.addEventListener('change', () => {
        this.state.detectionPermission = permission.state;
      });
    });
  }

  /**
   * Toggle dropdown visibility
   */
  toggleDropdown() {
    if (this.state.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Open dropdown
   */
  openDropdown() {
    this.state.isOpen = true;
    this.DOM.button.classList.add('open');
    this.DOM.dropdown.classList.add('open');
    this.DOM.button.setAttribute('aria-expanded', 'true');

    // Focus first item
    setTimeout(() => {
      const firstItem = this.DOM.dropdown.querySelector('.location-item');
      if (firstItem) firstItem.focus();
    }, 50);
  }

  /**
   * Close dropdown
   */
  closeDropdown() {
    this.state.isOpen = false;
    this.DOM.button.classList.remove('open');
    this.DOM.dropdown.classList.remove('open');
    this.DOM.button.setAttribute('aria-expanded', 'false');
    this.DOM.button.focus();
  }

  /**
   * Render district list (level 1)
   */
  renderDistrictList() {
    const html = `
      <div class="location-auto-detect" role="option" tabindex="0">
        <span class="location-auto-detect__icon">🔄</span>
        <span>Auto-Detect Location</span>
      </div>
      ${this.state.areasData.districts
        .map(
          (district) => `
        <div class="location-item location-item--district"
             role="option"
             tabindex="0"
             data-district-id="${district.id}"
             data-action="select-district">
          ${district.name}
        </div>
      `
        )
        .join('')}
    `;

    this.DOM.dropdown.innerHTML = html;

    // Add event listeners to districts
    this.DOM.dropdown.querySelectorAll('[data-action="select-district"]').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectDistrict(item.dataset.districtId);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectDistrict(item.dataset.districtId);
        }
      });
    });

    // Add event listener to auto-detect
    const autoDetect = this.DOM.dropdown.querySelector('.location-auto-detect');
    if (autoDetect) {
      autoDetect.addEventListener('click', (e) => {
        e.stopPropagation();
        this.detectLocation();
      });
      autoDetect.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.detectLocation();
        }
      });
    }
  }

  /**
   * Select a district and show municipalities
   */
  selectDistrict(districtId) {
    const district = this.state.areasData.districts.find((d) => d.id === districtId);
    if (!district) return;

    this.state.selectedDistrict = districtId;
    this.state.selectedMunicipality = null;
    this.state.selectedArea = null;

    this.renderMunicipalityList(district);
    this.updateBreadcrumb([district.name]);
  }

  /**
   * Render municipality list (level 2)
   */
  renderMunicipalityList(district) {
    const html = `
      <div class="location-breadcrumb show">
        <span class="location-breadcrumb__item">${district.name}</span>
      </div>
      <div class="location-item location-item--district location-item--back"
           role="option"
           tabindex="0"
           data-action="back">
        ← Back to Districts
      </div>
      ${district.municipalities
        .map(
          (muni) => `
        <div class="location-item location-item--municipality"
             role="option"
             tabindex="0"
             data-district-id="${district.id}"
             data-municipality-id="${muni.id}"
             data-action="select-municipality">
          ${muni.name}
        </div>
      `
        )
        .join('')}
    `;

    this.DOM.dropdown.innerHTML = html;

    // Add back button listener
    const backBtn = this.DOM.dropdown.querySelector('[data-action="back"]');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.renderDistrictList();
        this.state.selectedDistrict = null;
        this.state.selectedMunicipality = null;
        this.state.selectedArea = null;
      });
      backBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.renderDistrictList();
        }
      });
    }

    // Add municipality listeners
    this.DOM.dropdown.querySelectorAll('[data-action="select-municipality"]').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectMunicipality(item.dataset.districtId, item.dataset.municipalityId);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectMunicipality(item.dataset.districtId, item.dataset.municipalityId);
        }
      });
    });
  }

  /**
   * Select a municipality and show areas
   */
  selectMunicipality(districtId, municipalityId) {
    const district = this.state.areasData.districts.find((d) => d.id === districtId);
    const municipality = district?.municipalities.find((m) => m.id === municipalityId);

    if (!municipality) return;

    this.state.selectedMunicipality = municipalityId;
    this.state.selectedArea = null;

    this.renderAreaList(district, municipality);
    this.updateBreadcrumb([district.name, municipality.name]);
  }

  /**
   * Render area list (level 3)
   */
  renderAreaList(district, municipality) {
    const html = `
      <div class="location-breadcrumb show">
        <span class="location-breadcrumb__item">${district.name}</span>
        <span class="location-breadcrumb__separator">/</span>
        <span class="location-breadcrumb__item">${municipality.name}</span>
      </div>
      <div class="location-item location-item--district location-item--back"
           role="option"
           tabindex="0"
           data-action="back">
        ← Back to Municipalities
      </div>
      ${municipality.areas
        .map(
          (area) => `
        <div class="location-item location-item--area"
             role="option"
             tabindex="0"
             data-district-id="${district.id}"
             data-municipality-id="${municipality.id}"
             data-area-id="${area.id}"
             data-action="select-area">
          <div class="location-item--area__name">${area.name}</div>
          <div class="location-item--area__landmarks">${area.landmarks}</div>
        </div>
      `
        )
        .join('')}
    `;

    this.DOM.dropdown.innerHTML = html;

    // Add back button listener
    const backBtn = this.DOM.dropdown.querySelector('[data-action="back"]');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.renderMunicipalityList(district);
        this.state.selectedMunicipality = null;
        this.state.selectedArea = null;
      });
      backBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.renderMunicipalityList(district);
        }
      });
    }

    // Add area listeners
    this.DOM.dropdown.querySelectorAll('[data-action="select-area"]').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectArea(
          item.dataset.districtId,
          item.dataset.municipalityId,
          item.dataset.areaId
        );
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectArea(
            item.dataset.districtId,
            item.dataset.municipalityId,
            item.dataset.areaId
          );
        }
      });
    });
  }

  /**
   * Select an area (final selection)
   */
  selectArea(districtId, municipalityId, areaId) {
    const district = this.state.areasData.districts.find((d) => d.id === districtId);
    const municipality = district?.municipalities.find((m) => m.id === municipalityId);
    const area = municipality?.areas.find((a) => a.id === areaId);

    if (!area) return;

    this.state.selectedArea = areaId;

    // Save selection
    this.saveLocation({
      districtId,
      districtName: district.name,
      municipalityId,
      municipalityName: municipality.name,
      areaId,
      areaName: area.name,
      landmarks: area.landmarks,
      timestamp: new Date().toISOString()
    });

    // Update button display
    this.updateButtonDisplay(area.name);

    // Close dropdown
    this.closeDropdown();

    // Dispatch custom event
    this.dispatchLocationChangeEvent({
      district: district.name,
      municipality: municipality.name,
      area: area.name,
      landmarks: area.landmarks
    });
  }

  /**
   * Detect location using geolocation API
   */
  async detectLocation() {
    if (this.state.isDetecting) return;

    const autoDetectBtn = this.DOM.dropdown.querySelector('.location-auto-detect');
    if (!autoDetectBtn) return;

    this.state.isDetecting = true;
    autoDetectBtn.classList.add('detecting');
    autoDetectBtn.innerHTML = '<span class="location-auto-detect__icon">⏳</span><span>Detecting...</span>';

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      const { latitude, longitude } = position.coords;
      console.log('[LocationPicker] Geolocation found:', { latitude, longitude });

      // Find nearest area (simplified mapping)
      const nearestArea = this.findNearestArea(latitude, longitude);

      if (nearestArea) {
        this.selectArea(nearestArea.districtId, nearestArea.municipalityId, nearestArea.areaId);
        autoDetectBtn.classList.add('success');
        autoDetectBtn.innerHTML =
          '<span class="location-auto-detect__icon">✓</span><span>Location Detected!</span>';
      } else {
        throw new Error('Could not match location to any area');
      }
    } catch (error) {
      console.error('[LocationPicker] Geolocation error:', error);
      autoDetectBtn.classList.add('error');
      autoDetectBtn.innerHTML = '<span class="location-auto-detect__icon">✗</span><span>Detection Failed</span>';

      // Reset after 3 seconds
      setTimeout(() => {
        this.state.isDetecting = false;
        autoDetectBtn.classList.remove('detecting', 'error');
        autoDetectBtn.innerHTML = '<span class="location-auto-detect__icon">🔄</span><span>Auto-Detect Location</span>';
      }, 3000);
    }
  }

  /**
   * Find nearest area based on coordinates
   * Using simplified logic - can be expanded with proper geofencing
   */
  findNearestArea(latitude, longitude) {
    // Simplified mapping of Kathmandu valley areas
    // Coordinates are approximate center points
    const areaCoordinates = {
      thamel: { lat: 27.7172, lng: 85.3242 },
      baneshwor: { lat: 27.6909, lng: 85.3511 },
      patan_core: { lat: 27.6552, lng: 85.3131 },
      bouddha: { lat: 27.7248, lng: 85.3651 },
      durbar_square_area: { lat: 27.6336, lng: 85.4282 }
      // Add more areas as needed
    };

    let nearest = null;
    let minDistance = Infinity;

    Object.entries(areaCoordinates).forEach(([areaKey, coords]) => {
      const distance = this.calculateDistance(latitude, longitude, coords.lat, coords.lng);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = areaKey;
      }
    });

    // Map area key to actual IDs
    const areaMap = {
      thamel: { districtId: 'kathmandu', municipalityId: 'kathmandu-metro', areaId: 'thamel' },
      baneshwor: { districtId: 'kathmandu', municipalityId: 'kathmandu-metro', areaId: 'baneshwor' },
      patan_core: { districtId: 'lalitpur', municipalityId: 'lalitpur-metro', areaId: 'patan-core' },
      bouddha: { districtId: 'kathmandu', municipalityId: 'kathmandu-metro', areaId: 'bouddha' },
      durbar_square_area: {
        districtId: 'bhaktapur',
        municipalityId: 'bhaktapur-municipality',
        areaId: 'durbar-square-area'
      }
    };

    return areaMap[nearest] || null;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Update button display text
   */
  updateButtonDisplay(areaName) {
    const label = this.DOM.button.querySelector('.location-picker-button__label');
    if (label) {
      label.textContent = areaName || 'Select Location';
      label.title = areaName;
    }
  }

  /**
   * Update breadcrumb display
   */
  updateBreadcrumb(items) {
    const breadcrumb = this.DOM.dropdown.querySelector('.location-picker-breadcrumb');
    if (breadcrumb) {
      breadcrumb.innerHTML = items
        .map((item, index) => {
          if (index === 0) return `<span class="location-breadcrumb__item">${item}</span>`;
          return `<span class="location-breadcrumb__separator">/</span><span class="location-breadcrumb__item">${item}</span>`;
        })
        .join('');
    }
  }

  /**
   * Save selected location to storage and cart
   */
  async saveLocation(locationData) {
    // Save to localStorage
    localStorage.setItem(this.options.storageKey, JSON.stringify(locationData));

    // Save to Shopify cart attributes
    await this.saveToCart(locationData);

    console.log('[LocationPicker] Location saved:', locationData);
  }

  /**
   * Save location to Shopify cart attributes
   */
  async saveToCart(locationData) {
    try {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attributes: {
            [this.options.cartAttributeKey]: `${locationData.areaName}, ${locationData.municipalityName}`
          }
        })
      });

      if (!response.ok) {
        console.warn('[LocationPicker] Failed to save to cart');
      }
    } catch (error) {
      console.warn('[LocationPicker] Cart save error:', error);
      // Not critical - location still saved to localStorage
    }
  }

  /**
   * Restore previously selected location
   */
  restoreLocation() {
    const saved = localStorage.getItem(this.options.storageKey);

    if (saved) {
      try {
        const locationData = JSON.parse(saved);
        this.updateButtonDisplay(locationData.areaName);
        console.log('[LocationPicker] Location restored:', locationData);
      } catch (error) {
        console.warn('[LocationPicker] Failed to restore location:', error);
      }
    }
  }

  /**
   * Dispatch custom location change event
   */
  dispatchLocationChangeEvent(locationData) {
    const event = new CustomEvent('locationChanged', {
      detail: locationData,
      bubbles: true,
      cancelable: true
    });

    document.dispatchEvent(event);
  }

  /**
   * Keyboard navigation helper
   */
  handleKeyboardNavigation(direction) {
    const items = Array.from(this.DOM.dropdown.querySelectorAll('.location-item, .location-auto-detect'));
    const focused = document.activeElement;
    const currentIndex = items.indexOf(focused);

    let nextIndex;
    if (direction === 'ArrowDown') {
      nextIndex = currentIndex + 1 < items.length ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : items.length - 1;
    }

    items[nextIndex]?.focus();
  }

  /**
   * Handle keyboard select
   */
  handleKeyboardSelect() {
    const focused = document.activeElement;
    if (focused?.dataset?.action) {
      focused.click();
    }
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if button exists
  if (document.querySelector('.location-picker-button')) {
    window.locationPicker = new LocationPicker();
  }
});

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocationPicker;
}
