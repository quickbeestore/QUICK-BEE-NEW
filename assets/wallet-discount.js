/**
 * Wallet Discount Auto-Apply Module
 * Automatically applies wallet discount at checkout
 */

import WalletIntegration from './wallet-integration.js';

class WalletDiscount {
  constructor() {
    this.walletIntegration = window.walletIntegration;
    this.discountApplied = false;
    this.init();
  }

  init() {
    // Auto-apply wallet discount on cart page load
    if (this.isCartPage()) {
      this.applyWalletDiscount();
    }

    // Listen for cart changes
    document.addEventListener('quickbee:cart-updated', () => this.applyWalletDiscount());
  }

  isCartPage() {
    // Check if we're on cart page or if cart drawer is open
    return (
      document.querySelector('[data-template="cart"]') ||
      document.querySelector('cart-drawer-component')
    );
  }

  async applyWalletDiscount() {
    try {
      const customerId = this.walletIntegration.getCustomerId();
      if (!customerId) {
        this.logInfo('No customer ID, skipping wallet discount');
        return;
      }

      // Get wallet balance
      const walletData = await this.walletIntegration.fetchWalletBalance();
      if (walletData.error || walletData.balance <= 0) {
        this.logInfo('No wallet balance available');
        return;
      }

      // Get discount code
      const discountCode = this.walletIntegration.getWalletDiscountCode();

      // Check if already applied
      if (this.isDiscountCodeAlreadyApplied(discountCode)) {
        this.logInfo('Wallet discount already applied');
        return;
      }

      // Apply discount
      await this.applyDiscountCode(discountCode);
    } catch (error) {
      this.logError(`Wallet discount auto-apply failed: ${error.message}`);
      // Don't block checkout, just log the error
    }
  }

  isDiscountCodeAlreadyApplied(code) {
    const cart = window.Shopify?.cart;
    if (!cart || !cart.discountAllocations) return false;

    return cart.discountAllocations.some(
      (discount) =>
        discount.discountApplication.title === code ||
        discount.discountApplication.title === `WALLET_${this.walletIntegration.getCustomerId()}`
    );
  }

  async applyDiscountCode(code) {
    try {
      // Method 1: Use Shopify's cart API if available
      if (window.Shopify?.cart) {
        const response = await fetch('/cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            discount_code: code,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        this.logInfo(`Wallet discount applied: ${code}`);
        this.discountApplied = true;

        // Trigger cart update event
        document.dispatchEvent(new CustomEvent('quickbee:wallet-discount-applied', { detail: { code } }));
      } else {
        this.logWarning('Shopify cart API not available');
      }
    } catch (error) {
      this.logError(`Failed to apply discount code ${code}: ${error.message}`);
      // Don't throw, just log - allow checkout to proceed
    }
  }

  /**
   * Remove wallet discount if needed
   */
  async removeWalletDiscount() {
    try {
      const discountCode = this.walletIntegration.getWalletDiscountCode();

      if (window.Shopify?.cart) {
        await fetch('/cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            discount_code: discountCode,
          }),
        });

        this.logInfo('Wallet discount removed');
        this.discountApplied = false;
      }
    } catch (error) {
      this.logError(`Failed to remove wallet discount: ${error.message}`);
    }
  }

  logError(message) {
    console.error(`[WalletDiscount] ${message}`);
  }

  logWarning(message) {
    console.warn(`[WalletDiscount] ${message}`);
  }

  logInfo(message) {
    console.log(`[WalletDiscount] ${message}`);
  }
}

// Create global instance and initialize
window.walletDiscount = window.walletDiscount || new WalletDiscount();

export default WalletDiscount;
