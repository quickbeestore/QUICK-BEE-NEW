/**
 * Magazine Builder - State Management
 * Single source of truth for entire builder app
 * Persists to localStorage + IndexedDB
 * Emits custom events on all state changes
 */

class MagazineStore {
  constructor() {
    this._state = this._loadFromStorage() || this._defaultState();
    this._listeners = new Set();
    this._debounceTimer = null;
    this._initIndexedDB();
  }

  // ── DEFAULT STATE ────────────────────────────────
  _defaultState() {
    return {
      schema_version: '1.0',
      session_id: this._generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'draft', // draft | pending_payment | completed

      config: {
        page_count: 24,
        product_id: null,
        variant_id: null
      },

      global: {
        theme_id: 'romance-dark',
        font_heading: 'Cormorant Garamond',
        font_body: 'Montserrat',
        palette: {
          primary: '#280818',
          accent: '#c9a84c',
          text: '#ffffff',
          bg: '#07030a'
        }
      },

      metadata: {
        title: '',
        person1: '',
        person2: '',
        date: '',
        location: '',
        quote: '',
        phone: '',
        address: ''
      },

      assets: {}, // { 'a1': { id, url, thumbnail_url, status, ... } }

      pages: this._generatePages(24),

      ui: {
        current_step: 0, // 0=config, 1=theme, 2=upload, 3=editor, 4=review
        active_page: 0,
        uploads_in_progress: 0,
        last_saved: null
      }
    };
  }

  _generatePages(count) {
    const pages = [];
    const layouts = ['cover-full-bleed', 'text-left-image-right', 'full-bleed', 'split-two', 'text-center'];

    for (let i = 0; i < count; i++) {
      let pageType = 'content';
      let layout = layouts[Math.floor(Math.random() * layouts.length)];
      let locked = false;

      if (i === 0) { pageType = 'cover'; layout = 'cover-full-bleed'; locked = false; }
      if (i === count - 1) { pageType = 'back'; layout = 'back-full-bleed'; locked = false; }

      pages.push({
        index: i,
        type: pageType,
        layout: layout,
        locked: locked,
        slots: { primary_image: null, secondary_image: null },
        text: {
          headline: '',
          subheadline: '',
          body: '',
          caption: ''
        },
        overrides: {
          overlay_opacity: 0.6,
          text_color: '#ffffff',
          show_page_number: i !== 0 && i !== count - 1
        }
      });
    }
    return pages;
  }

  // ── MUTATIONS ────────────────────────────────────
  /**
   * Single point of mutation — all state changes go here
   * @param {string} path - dot-notation path: "config.page_count" or "pages.0.text.headline"
   * @param {*} value - new value
   */
  update(path, value) {
    this._setNested(this._state, path, value);
    this._state.updated_at = new Date().toISOString();
    this._debouncePerist();
    this._emitChange(path, value);
  }

  /**
   * Batch update — prevents multiple emits
   * @param {Array<{path, value}>} mutations
   */
  batchUpdate(mutations) {
    mutations.forEach(({ path, value }) => {
      this._setNested(this._state, path, value);
    });
    this._state.updated_at = new Date().toISOString();
    this._persist();
    this._emit('batch', mutations);
  }

  /**
   * Add new asset to registry
   */
  addAsset(assetObj) {
    const id = assetObj.id || 'a' + Date.now();
    this._state.assets[id] = {
      id,
      status: 'uploading',
      ...assetObj
    };
    this._debouncePerist();
    this._emit('asset:added', { id, ...assetObj });
    return id;
  }

  /**
   * Update asset after upload success
   */
  updateAsset(assetId, updates) {
    if (!this._state.assets[assetId]) throw new Error(`Asset ${assetId} not found`);
    this._state.assets[assetId] = { ...this._state.assets[assetId], ...updates };
    this._debouncePerist();
    this._emit('asset:updated', { id: assetId, ...updates });
  }

  /**
   * Remove asset and unlink from all pages
   */
  removeAsset(assetId) {
    delete this._state.assets[assetId];
    // Unlink from all pages
    this._state.pages.forEach(page => {
      if (page.slots.primary_image === assetId) page.slots.primary_image = null;
      if (page.slots.secondary_image === assetId) page.slots.secondary_image = null;
    });
    this._persist();
    this._emit('asset:removed', { id: assetId });
  }

  /**
   * Assign asset to page slot
   */
  assignAssetToPage(pageIndex, slot, assetId) {
    if (!this._state.pages[pageIndex]) throw new Error(`Page ${pageIndex} not found`);
    this._state.pages[pageIndex].slots[slot] = assetId;
    this._debouncePerist();
    this._emit('page:changed', { pageIndex, slot, assetId });
  }

  // ── GETTERS ──────────────────────────────────────
  getState() {
    return structuredClone(this._state);
  }

  getPage(index) {
    return structuredClone(this._state.pages[index]);
  }

  getAsset(id) {
    return structuredClone(this._state.assets[id]);
  }

  getAllAssets() {
    return Object.values(this._state.assets).map(a => structuredClone(a));
  }

  isReady() {
    // All photos uploaded + min pages filled
    const assetsReady = Object.values(this._state.assets).every(a => a.status === 'ready');
    const pagesComplete = this._state.pages.filter(p => p.type === 'content').filter(p => p.slots.primary_image).length >= Math.ceil(this._state.config.page_count * 0.8);
    return assetsReady && pagesComplete;
  }

  // ── PERSISTENCE ──────────────────────────────────
  _debouncePerist() {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this._persist(), 2000);
  }

  _persist() {
    try {
      const json = JSON.stringify(this._state);
      localStorage.setItem(`qb_mag_${this._state.session_id}`, json);
      localStorage.setItem('qb_mag_last_session', this._state.session_id);
      // Also IndexedDB for larger payloads
      this._saveToIndexedDB(json);
    } catch (e) {
      console.error('Persistence failed:', e);
    }
  }

  _loadFromStorage() {
    try {
      const lastSession = localStorage.getItem('qb_mag_last_session');
      if (lastSession) {
        const json = localStorage.getItem(`qb_mag_${lastSession}`);
        if (json) return JSON.parse(json);
      }
    } catch (e) {
      console.error('Load failed:', e);
    }
    return null;
  }

  _initIndexedDB() {
    const req = indexedDB.open('QuickBeeMagazines', 1);
    req.onsuccess = (e) => { this._idb = e.target.result; };
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'session_id' });
      }
    };
  }

  _saveToIndexedDB(json) {
    if (!this._idb) return;
    try {
      const tx = this._idb.transaction(['drafts'], 'readwrite');
      const store = tx.objectStore('drafts');
      store.put({ session_id: this._state.session_id, data: json, timestamp: Date.now() });
    } catch (e) {
      console.warn('IndexedDB save failed:', e);
    }
  }

  // ── EVENTS ───────────────────────────────────────
  _emit(eventType, detail) {
    const event = new CustomEvent(`magazine:${eventType}`, { detail });
    window.dispatchEvent(event);
    this._listeners.forEach(listener => listener(eventType, detail));
  }

  _emitChange(path, value) {
    this._emit('changed', { path, value, timestamp: Date.now() });
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  // ── UTILS ────────────────────────────────────────
  _setNested(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) current[key] = {};
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }

  _generateUUID() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

// Global singleton
window.MagazineStore = new MagazineStore();
