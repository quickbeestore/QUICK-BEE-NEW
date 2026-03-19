/**
 * QuickPay Utility Functions
 * Handles fetching and formatting wallet data from QULET + Shopify
 */

const QULET_API_URL = 'https://quick-pay-beta-production.up.railway.app/api';
const CACHE_KEY = 'quickpay-balance';
const CACHE_DURATION = 60000; // 60 seconds

/**
 * Fetch wallet balance from QULET API
 */
async function fetchQuletWallet() {
  try {
    const customerId = window.quickPayCustomer?.id;
    if (!customerId) {
      console.warn('[QuickPay] No customer ID found');
      return 0;
    }

    const response = await fetch(
      `${QULET_API_URL}/wallet/${encodeURIComponent(customerId)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      console.warn('[QuickPay] QULET API error:', response.status);
      return 0;
    }

    const data = await response.json();
    if (data.success && typeof data.balance === 'number') {
      console.log('[QuickPay] QULET balance:', data.balance);
      return data.balance;
    }

    return 0;
  } catch (error) {
    console.error('[QuickPay] Failed to fetch QULET wallet:', error.message);
    return 0;
  }
}

/**
 * Fetch store credit from Shopify via Storefront API
 */
async function fetchShopifyStoreCredit() {
  try {
    // This would be fetched server-side in Liquid for better performance
    // For now, we'll return 0 - it will be fetched by the Liquid snippet
    return 0;
  } catch (error) {
    console.error('[QuickPay] Failed to fetch store credit:', error.message);
    return 0;
  }
}

/**
 * Get cached balance if available
 */
function getCachedBalance() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();

    if (now - data.timestamp < CACHE_DURATION) {
      console.log('[QuickPay] Using cached balance');
      return data;
    }

    sessionStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.error('[QuickPay] Cache read error:', error.message);
    return null;
  }
}

/**
 * Cache balance data
 */
function cacheBalance(wallet, storeCredit) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        wallet,
        storeCredit,
        combined: wallet + storeCredit,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error('[QuickPay] Cache write error:', error.message);
  }
}

/**
 * Fetch combined balance from QULET + Shopify
 */
export async function fetchQuickPayBalance() {
  // Check cache first
  const cached = getCachedBalance();
  if (cached) {
    return cached;
  }

  // Fetch from QULET
  const wallet = await fetchQuletWallet();

  // Fetch store credit (from server-side Liquid if available)
  const storeCredit = window.quickPayStoreCredit || 0;

  const combined = wallet + storeCredit;

  // Cache the result
  cacheBalance(wallet, storeCredit);

  return { wallet, storeCredit, combined };
}

/**
 * Format amount as currency (NPR)
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'Rs —';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Clear cached balance
 */
export function clearCache() {
  sessionStorage.removeItem(CACHE_KEY);
}

/**
 * Refresh balance
 */
export async function refreshBalance() {
  clearCache();
  return fetchQuickPayBalance();
}

/**
 * Export transactions to CSV
 */
export function exportTransactionsToCSV(transactions, filename = 'quickpay-transactions.csv') {
  if (!transactions || transactions.length === 0) {
    alert('No transactions to export');
    return;
  }

  const headers = ['Date', 'Type', 'Amount', 'Balance', 'Reason', 'Order ID'];
  const rows = transactions.map((tx) => [
    formatDate(tx.createdAt),
    tx.type.toUpperCase(),
    `Rs ${tx.amount}`,
    `Rs ${tx.balanceAfter}`,
    tx.reason || '—',
    tx.orderId || '—',
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  console.log('[QuickPay] Exported transactions:', filename);
}

export default {
  fetchQuickPayBalance,
  formatCurrency,
  formatDate,
  clearCache,
  refreshBalance,
  exportTransactionsToCSV,
};
