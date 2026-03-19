import { Component } from '@theme/component';
import WalletIntegration from './wallet-integration.js';

/**
 * A custom element that displays the wallet balance.
 *
 * @typedef {object} Refs
 * @property {HTMLElement} walletBalance - The wallet balance display element.
 * @property {HTMLElement} walletAmount - The wallet amount value element.
 * @property {HTMLElement} walletButton - The main wallet button element.
 *
 * @extends {Component<Refs>}
 */
class WalletButton extends Component {
  requiredRefs = ['walletButton', 'walletBalance'];

  connectedCallback() {
    super.connectedCallback();
    this.walletIntegration = window.walletIntegration;
    this.initWallet();

    // Listen for cart updates to refresh wallet (after order)
    document.addEventListener('quickbee:order-complete', () => this.refreshWallet(true));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('quickbee:order-complete', () => this.refreshWallet(true));
  }

  async initWallet() {
    try {
      await this.displayWalletBalance();
    } catch (error) {
      this.walletIntegration.logError(`Wallet init failed: ${error.message}`);
      this.setWalletDisplay('—');
    }
  }

  async displayWalletBalance() {
    const walletData = await this.walletIntegration.fetchWalletBalance();

    if (walletData.error) {
      this.walletIntegration.logWarning(`Wallet display error: ${walletData.error}`);
      this.setWalletDisplay('—');
      return;
    }

    const balance = walletData.balance || 0;
    const formattedBalance = this.walletIntegration.formatBalance(balance);

    this.setWalletDisplay(formattedBalance);
    this.walletIntegration.logInfo(`Wallet displayed: ${formattedBalance}`);
  }

  setWalletDisplay(text) {
    if (this.refs.walletAmount) {
      this.refs.walletAmount.textContent = text;
    }
  }

  async refreshWallet(forceRefresh = false) {
    try {
      this.walletIntegration.clearCache();
      await this.displayWalletBalance();
      this.walletIntegration.logInfo('Wallet refreshed');
    } catch (error) {
      this.walletIntegration.logError(`Wallet refresh failed: ${error.message}`);
    }
  }
}

if (!customElements.get('wallet-button')) {
  customElements.define('wallet-button', WalletButton);
}
