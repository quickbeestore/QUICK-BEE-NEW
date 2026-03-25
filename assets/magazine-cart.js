/**
 * Magazine Builder - Firebase + Shopify Cart Integration
 * Handles order submission and cart integration
 */

class MagazineCart {
  constructor(firebaseConfig = {}) {
    this.firebaseConfig = firebaseConfig;
    this.store = window.MagazineStore;
  }

  /**
   * Validate magazine is ready for purchase
   */
  validate() {
    const errors = [];
    const state = this.store.getState();

    // Check metadata
    if (!state.metadata.person1) errors.push('Person 1 name is required');
    if (!state.metadata.person2) errors.push('Person 2 name is required');

    // Check assets
    const assets = Object.values(state.assets);
    const readyAssets = assets.filter(a => a.status === 'ready');
    if (readyAssets.length < 2) errors.push('Upload at least 2 photos');

    // Check pages filled
    const contentPages = state.pages.filter(p => p.type === 'content');
    const filledPages = contentPages.filter(p => p.slots.primary_image);
    const minFilled = Math.ceil(contentPages.length * 0.8);
    if (filledPages.length < minFilled) errors.push(`Fill at least ${minFilled} pages`);

    // Check delivery info
    if (!state.metadata.phone) errors.push('Phone number required');
    if (!state.metadata.address) errors.push('Delivery address required');

    return { valid: errors.length === 0, errors };
  }

  /**
   * Main submission flow:
   * 1. Validate
   * 2. Push to Firebase
   * 3. Generate PDF
   * 4. Add to Shopify cart
   */
  async submitOrder(variantId) {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(validation.errors.join('\n'));
    }

    const state = this.store.getState();

    try {
      // 1. Push JSON to Firebase
      window.dispatchEvent(new CustomEvent('order:state', { detail: 'firebase' }));
      const docRef = await this._pushToFirebase(state);

      // 2. Generate PDF on Render
      window.dispatchEvent(new CustomEvent('order:state', { detail: 'pdf' }));
      const pdfUrl = await this._generatePDF(state);

      // 3. Build line item properties
      const properties = this._buildLineItemProperties(state, docRef.id, pdfUrl);

      // 4. Add to Shopify cart
      window.dispatchEvent(new CustomEvent('order:state', { detail: 'cart' }));
      await this._addToShopifyCart(variantId, properties);

      // 5. Success
      this.store.update('status', 'pending_payment');
      window.dispatchEvent(new CustomEvent('order:success', { detail: { docRef, pdfUrl } }));

      // Redirect to checkout
      return window.location.href = '/checkout';
    } catch (error) {
      console.error('Order submission failed:', error);
      window.dispatchEvent(new CustomEvent('order:error', { detail: error.message }));
      throw error;
    }
  }

  /**
   * Push state JSON to Firebase
   */
  async _pushToFirebase(state) {
    // Initialize Firebase (you'll set this up)
    if (!window.firebase || !window.firebase.firestore) {
      throw new Error('Firebase not configured');
    }

    const db = window.firebase.firestore();
    const doc = await db.collection('magazine_orders').add({
      ...state,
      status: 'pending_payment',
      submitted_at: new Date().toISOString()
    });

    return doc;
  }

  /**
   * Call Render.com PDF generation API
   */
  async _generatePDF(state) {
    const response = await fetch('https://quickbee-print-api.onrender.com/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'PDF generation failed');
    }

    const { pdf_url } = await response.json();
    return pdf_url;
  }

  /**
   * Build Shopify line item properties (respecting 255-char limit per value)
   */
  _buildLineItemProperties(state, firebaseDocId, pdfUrl) {
    const props = {
      // Hidden from customer (underscore prefix)
      '_magazine_id': state.session_id,
      '_firebase_doc': firebaseDocId,
      '_pdf_url': pdfUrl,

      // Visible to merchant
      'Person 1': state.metadata.person1,
      'Person 2': state.metadata.person2,
      'Pages': String(state.config.page_count),
      'Theme': state.global.theme_id,
      'Special Date': state.metadata.date || 'Not specified',
      'Location': state.metadata.location || 'Not specified',
      'Phone': state.metadata.phone,
      'Address': state.metadata.address
    };

    // Validate no value exceeds 255 chars
    Object.entries(props).forEach(([key, val]) => {
      if (String(val).length > 255) {
        props[key] = String(val).substring(0, 252) + '...';
      }
    });

    return props;
  }

  /**
   * Add to Shopify cart using /cart/add.js
   */
  async _addToShopifyCart(variantId, properties) {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: variantId,
        quantity: 1,
        properties: properties
      })
    });

    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }

    return response.json();
  }
}

window.MagazineCart = new MagazineCart();
