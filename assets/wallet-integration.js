/**
 * Wallet Integration Module
 * Handles wallet balance fetching, caching, and auto-discount application
 */

class WalletIntegration {
  constructor() {
    this.API_BASE = 'https://quick-pay-beta-production.up.railway.app/api';
    this.CACHE_KEY = 'quickbee-wallet-balance';
    this.CACHE_DURATION = 60000; // 60 seconds
    this.customerId = null;
  }

  /**
   * Extract customer ID from various sources
   */
  getCustomerId() {
    if (this.customerId) return this.customerId;

    // 1. Try to get from Shopify customer object
    if (window.Shopify?.customer?.id) {
      this.customerId = `gid://shopify/Customer/${window.Shopify.customer.id}`;
      return this.customerId;
    }

    // 2. Try LocalStorage
    const stored = localStorage.getItem('quickbee-customer-id');
    if (stored) {
      this.customerId = stored;
      return this.customerId;
    }

    // 3. Try SessionStorage
    const session = sessionStorage.getItem('quickbee-customer-id');
    if (session) {
      this.customerId = session;
      return this.customerId;
    }

    // 4. Try URL parameter
    const params = new URLSearchParams(window.location.search);
    const urlCustomerId = params.get('customer_id');
    if (urlCustomerId) {
      this.customerId = urlCustomerId;
      localStorage.setItem('quickbee-customer-id', urlCustomerId);
      return this.customerId;
    }

    return null;
  }

  /**
   * Fetch wallet balance from API
   */
  async fetchWalletBalance(forceRefresh = false) {
    const customerId = this.getCustomerId();
    if (!customerId) {
      this.logWarning('No customer ID found');
      return { balance: 0, error: 'No customer ID' };
    }

    // Check cache
    if (!forceRefresh) {
      const cached = this.getFromCache();
      if (cached) {
        return cached;
      }
    }

    try {
      const endpoint = `${this.API_BASE}/wallet/${encodeURIComponent(customerId)}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        this.logError(`Wallet API error: ${response.status}`);
        return { balance: 0, error: `API error: ${response.status}` };
      }

      const data = await response.json();

      // Validate response format
      if (!data.success || typeof data.balance !== 'number') {
        this.logError('Invalid wallet response format');
        return { balance: 0, error: 'Invalid response format' };
      }

      // Cache the result
      this.setInCache(data);

      return {
        balance: data.balance,
        customerId: data.customerId,
        email: data.email,
        lastUpdated: data.lastUpdated,
      };
    } catch (error) {
      this.logError(`Wallet fetch failed: ${error.message}`);
      return { balance: 0, error: error.message };
    }
  }

  /**
   * Get cached wallet balance if still valid
   */
  getFromCache() {
    try {
      const cached = sessionStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - data.timestamp < this.CACHE_DURATION) {
        return {
          balance: data.balance,
          customerId: data.customerId,
          email: data.email,
          lastUpdated: data.lastUpdated,
        };
      }

      // Cache expired, remove it
      sessionStorage.removeItem(this.CACHE_KEY);
      return null;
    } catch (error) {
      this.logError(`Cache read error: ${error.message}`);
      return null;
    }
  }

  /**
   * Cache wallet balance
   */
  setInCache(data) {
    try {
      sessionStorage.setItem(
        this.CACHE_KEY,
        JSON.stringify({
          balance: data.balance,
          customerId: data.customerId,
          email: data.email,
          lastUpdated: data.lastUpdated,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      this.logError(`Cache write error: ${error.message}`);
    }
  }

  /**
   * Clear cached wallet balance
   */
  clearCache() {
    sessionStorage.removeItem(this.CACHE_KEY);
  }

  /**
   * Format balance as currency (assuming Rs/Rupees)
   */
  formatBalance(balance) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(balance);
  }

  /**
   * Get wallet discount code
   */
  getWalletDiscountCode() {
    const customerId = this.getCustomerId();
    if (!customerId) return null;
    return `WALLET_${customerId}`;
  }

  /**
   * Logging utilities
   */
  logError(message) {
    console.error(`[WalletIntegration] ${message}`);
  }

  logWarning(message) {
    console.warn(`[WalletIntegration] ${message}`);
  }

  logInfo(message) {
    console.log(`[WalletIntegration] ${message}`);
  }
}

// Create global instance
window.walletIntegration = window.walletIntegration || new WalletIntegration();

export default WalletIntegration;
