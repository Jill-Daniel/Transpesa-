import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MpesaCallbackHandler: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle M-Pesa callback responses
    const handleCallback = () => {
      const urlParams = new URLSearchParams(location.search);
      
      // M-Pesa callback parameters
      const merchantRequestId = urlParams.get('MerchantRequestID');
      const checkoutRequestId = urlParams.get('CheckoutRequestID');
      const resultCode = urlParams.get('ResultCode');
      const resultDesc = urlParams.get('ResultDesc');
      const amount = urlParams.get('Amount');
      const mpesaReceipt = urlParams.get('MpesaReceiptNumber');
      const phoneNumber = urlParams.get('PhoneNumber');

      if (checkoutRequestId) {
        // Process the callback
        const transaction = {
          id: checkoutRequestId,
          merchantRequestId,
          resultCode,
          resultDesc,
          amount,
          mpesaReceipt,
          phoneNumber,
          timestamp: new Date().toISOString(),
        };

        // Store callback data
        const callbacks = JSON.parse(localStorage.getItem('mpesaCallbacks') || '[]');
        callbacks.push(transaction);
        localStorage.setItem('mpesaCallbacks', JSON.stringify(callbacks));

        // Update transaction status in local storage
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const transactionIndex = transactions.findIndex((t: any) => t.id === checkoutRequestId);
        
        if (transactionIndex !== -1) {
          transactions[transactionIndex].status = resultCode === '0' ? 'completed' : 'failed';
          transactions[transactionIndex].mpesaReceipt = mpesaReceipt;
          transactions[transactionIndex].updatedAt = new Date();
          localStorage.setItem('transactions', JSON.stringify(transactions));
        }

        // Show notification to user
        if (resultCode === '0') {
          alert(`✅ Payment successful! M-Pesa Receipt: ${mpesaReceipt}`);
        } else {
          alert(`❌ Payment failed: ${resultDesc}`);
        }

        // Redirect back to dashboard
        window.location.href = '/dashboard';
      }
    };

    handleCallback();
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mpesa-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing M-Pesa Response</h2>
          <p className="text-gray-600">Please wait while we process your transaction...</p>
        </div>
      </div>
    </div>
  );
};

export default MpesaCallbackHandler;
