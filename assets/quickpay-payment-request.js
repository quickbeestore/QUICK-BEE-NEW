/**
 * QuickPay Payment Request System
 * Generates and stores payment requests locally
 * No external email service needed
 */

export async function generatePaymentRequest(customer, amount, method = 'bank') {
  try {
    const requestId = `QB-${customer.id}-${Date.now()}`;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3); // 3 day expiry

    const paymentRequest = {
      id: requestId,
      customerId: customer.id,
      email: customer.email,
      name: customer.firstName,
      amount: parseFloat(amount),
      method: method, // 'bank', 'esewa', 'khalti'
      status: 'pending', // pending, completed, expired
      createdAt: new Date().toISOString(),
      expiryAt: expiryDate.toISOString(),
      bankDetails: {
        account: '1234567890',
        ifsc: 'NIBL0000001',
        holder: 'QuickBee Pvt. Ltd.',
        reference: requestId,
      },
      esewaCode: 'QUICKBEE',
      khaltiPublicKey: 'YOUR_KHALTI_KEY',
    };

    // Save to local server
    await savePaymentRequest(paymentRequest);

    // Generate and send receipt
    await sendPaymentReceipt(paymentRequest);

    console.log('[QuickPay] Payment request created:', requestId);
    return paymentRequest;
  } catch (error) {
    console.error('[QuickPay] Failed to generate payment request:', error.message);
    throw error;
  }
}

export async function savePaymentRequest(paymentRequest) {
  try {
    const response = await fetch('/api/quickpay/payment-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentRequest),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[QuickPay] Failed to save payment request:', error.message);
    throw error;
  }
}

export async function sendPaymentReceipt(paymentRequest) {
  try {
    const receiptHTML = generateReceiptHTML(paymentRequest);

    const response = await fetch('/api/quickpay/send-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: paymentRequest.email,
        subject: `QuickPay Payment Request - Rs ${paymentRequest.amount}`,
        html: receiptHTML,
        requestId: paymentRequest.id,
      }),
    });

    if (!response.ok) {
      console.warn('[QuickPay] Failed to send receipt email');
    }
  } catch (error) {
    console.error('[QuickPay] Error sending receipt:', error.message);
  }
}

export function generateReceiptHTML(request) {
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');
  const formatTime = (date) => new Date(date).toLocaleTimeString('en-IN');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { background: #f0f0f0; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
        .amount { font-size: 32px; font-weight: bold; color: #667eea; }
        .status { padding: 10px; background: #e8f5e9; border-radius: 4px; color: #2e7d32; margin: 15px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
        th { background: #f0f0f0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 QuickPay Payment Request</h1>
          <p>Payment Ref: <strong>${request.id}</strong></p>
        </div>

        <div class="content">
          <div class="details">
            <p><strong>Hello ${request.name},</strong></p>
            <p>We have created a payment request for your QuickPay wallet top-up.</p>
          </div>

          <table>
            <tr>
              <th>Item</th>
              <th>Details</th>
            </tr>
            <tr>
              <td>Amount</td>
              <td><span class="amount">Rs ${request.amount}</span></td>
            </tr>
            <tr>
              <td>Request ID</td>
              <td><code>${request.id}</code></td>
            </tr>
            <tr>
              <td>Created</td>
              <td>${formatDate(request.createdAt)} ${formatTime(request.createdAt)}</td>
            </tr>
            <tr>
              <td>Expires</td>
              <td>${formatDate(request.expiryAt)}</td>
            </tr>
            <tr>
              <td>Payment Method</td>
              <td>${request.method.toUpperCase()}</td>
            </tr>
          </table>

          <div class="status">
            ⏳ Status: <strong>PENDING</strong> - Awaiting payment
          </div>

          ${
            request.method === 'bank'
              ? `
          <div class="details">
            <h3>Bank Transfer Details</h3>
            <p><strong>Account Holder:</strong> ${request.bankDetails.holder}</p>
            <p><strong>Account Number:</strong> <code>${request.bankDetails.account}</code></p>
            <p><strong>IFSC Code:</strong> <code>${request.bankDetails.ifsc}</code></p>
            <p><strong>Reference:</strong> <code>${request.bankDetails.reference}</code></p>
            <p style="color: #e74c3c; font-weight: bold;">⚠️ IMPORTANT: Use the reference number in your bank transfer</p>
          </div>
          `
              : ''
          }

          <div class="details">
            <h3>❓ How to Pay</h3>
            <ol>
              <li>Log in to your QuickPay dashboard</li>
              <li>Go to Add Funds → ${request.method === 'bank' ? 'Bank Transfer' : request.method.charAt(0).toUpperCase() + request.method.slice(1)}</li>
              <li>Enter amount: <strong>Rs ${request.amount}</strong></li>
              <li>Complete the payment</li>
              <li>Your wallet will be credited automatically</li>
            </ol>
          </div>

          <div class="details" style="background: #fff3cd; border-left-color: #ffc107;">
            <p><strong>⏰ Note:</strong> This payment request expires on ${formatDate(request.expiryAt)}. Please complete your payment before this date.</p>
          </div>
        </div>

        <div class="footer">
          <p><strong>QuickBee Payment System</strong></p>
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>Questions? Visit your account dashboard or contact support.</p>
          <p style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
            © ${new Date().getFullYear()} QuickBee. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function getPaymentRequest(requestId) {
  try {
    const response = await fetch(`/api/quickpay/payment-request/${requestId}`);
    if (!response.ok) throw new Error('Request not found');
    return response.json();
  } catch (error) {
    console.error('[QuickPay] Failed to fetch payment request:', error);
    return null;
  }
}

export async function getAllPaymentRequests(customerId) {
  try {
    const response = await fetch(
      `/api/quickpay/payment-requests?customerId=${customerId}`
    );
    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  } catch (error) {
    console.error('[QuickPay] Failed to fetch payment requests:', error);
    return [];
  }
}

export async function markPaymentAsCompleted(requestId) {
  try {
    const response = await fetch(`/api/quickpay/payment-request/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });

    if (!response.ok) throw new Error('Failed to update request');
    return response.json();
  } catch (error) {
    console.error('[QuickPay] Failed to mark payment as completed:', error);
    throw error;
  }
}
