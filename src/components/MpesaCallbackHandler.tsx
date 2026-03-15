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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-mpesa-50 flex items-center justify-center px-4 safe-area-top safe-area-bottom">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full animate-scale-in">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="h-16 w-16 bg-mpesa-100 rounded-full flex items-center justify-center animate-pulse-slow">
              <div className="h-8 w-8 bg-mpesa-600 rounded-full animate-spin"></div>
            </div>
            <div className="absolute -inset-2 bg-mpesa-200 rounded-full animate-ping opacity-20"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">Processing M-Pesa Response</h2>
          <p className="text-gray-600 text-base leading-relaxed">
            Please wait while we process your transaction...
          </p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="h-2 w-2 bg-mpesa-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-2 w-2 bg-mpesa-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-2 w-2 bg-mpesa-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MpesaCallbackHandler;
