/**
 * Wallet Order Completion Handler
 * Refreshes wallet balance after order is placed and shows confirmation message
 */

import WalletIntegration from './wallet-integration.js';

class WalletOrderComplete {
  constructor() {
    this.walletIntegration = window.walletIntegration;
    this.init();
  }

  init() {
    // Check if we're on the order confirmation page
    if (this.isOrderConfirmationPage()) {
      this.handleOrderCompletion();
    }
  }

  isOrderConfirmationPage() {
    return (
      document.querySelector('[data-template="order"]') ||
      document.querySelector('.order-confirmation') ||
      window.location.pathname.includes('/orders/')
    );
  }

  async handleOrderCompletion() {
    try {
      // Wait a bit for the page to fully load
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refresh wallet balance
      await this.refreshWalletBalance();

      // Show confirmation message
      this.showWalletAppliedMessage();

      // Trigger event for other modules
      document.dispatchEvent(new CustomEvent('quickbee:order-complete'));
    } catch (error) {
      this.logError(`Order completion handler failed: ${error.message}`);
    }
  }

  async refreshWalletBalance() {
    try {
      const walletData = await this.walletIntegration.fetchWalletBalance(true); // Force refresh

      if (walletData.error) {
        this.logWarning(`Wallet refresh failed: ${walletData.error}`);
        return;
      }

      const newBalance = walletData.balance || 0;
      this.logInfo(`Wallet balance refreshed: Rs ${newBalance}`);

      // Update global state
      window.walletOrderData = {
        newBalance,
        customerId: walletData.customerId,
        refreshedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logError(`Failed to refresh wallet: ${error.message}`);
    }
  }

  showWalletAppliedMessage() {
    try {
      const orderData = window.walletOrderData || {};
      const newBalance = orderData.newBalance ?? 0;
      const message = `✓ Wallet applied. New balance: Rs ${newBalance}`;

      // Try to find the order summary section
      const orderSummary = document.querySelector('[data-template="order"]')
        || document.querySelector('.order-confirmation')
        || document.querySelector('.section');

      if (orderSummary) {
        const messageEl = document.createElement('div');
        messageEl.className = 'wallet-order-message';
        messageEl.setAttribute('role', 'status');
        messageEl.setAttribute('aria-live', 'polite');
        messageEl.textContent = message;
        messageEl.style.cssText = `
          padding: 12px 16px;
          margin: 16px 0;
          background-color: #e8f5e9;
          border-left: 4px solid #4caf50;
          border-radius: 4px;
          color: #2e7d32;
          font-weight: 500;
        `;

        // Insert at the beginning of the order content
        orderSummary.insertBefore(messageEl, orderSummary.firstChild);

        this.logInfo(`Wallet message displayed: ${message}`);

        // Auto-remove after 5 seconds
        setTimeout(() => {
          if (messageEl.parentNode) {
            messageEl.remove();
          }
        }, 5000);
      }
    } catch (error) {
      this.logError(`Failed to show wallet message: ${error.message}`);
    }
  }

  logError(message) {
    console.error(`[WalletOrderComplete] ${message}`);
  }

  logWarning(message) {
    console.warn(`[WalletOrderComplete] ${message}`);
  }

  logInfo(message) {
    console.log(`[WalletOrderComplete] ${message}`);
  }
}

// Create global instance and initialize
window.walletOrderComplete = window.walletOrderComplete || new WalletOrderComplete();

export default WalletOrderComplete;
