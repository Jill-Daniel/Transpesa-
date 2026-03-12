import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PinEntry from './PinEntry';
import MpesaApiService from '../services/mpesaApi';

const RealMpesaTransaction: React.FC = () => {
  const [transactionType, setTransactionType] = useState<'send' | 'deposit' | 'withdraw'>('send');
  const [formData, setFormData] = useState({
    recipientPhone: '',
    recipientName: '',
    amount: '',
    description: '',
  });
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mpesaService] = useState(() => new MpesaApiService());
  const { state } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (parseFloat(formData.amount) < 10) {
      setError('Minimum transaction amount is KES 10');
      return false;
    }

    if (parseFloat(formData.amount) > 150000) {
      setError('Maximum transaction amount is KES 150,000');
      return false;
    }

    if (transactionType === 'send') {
      if (!formData.recipientPhone) {
        setError('Please enter recipient phone number');
        return false;
      }
      
      if (!mpesaService.validatePhoneNumber(formData.recipientPhone)) {
        setError('Please enter a valid Kenyan phone number (format: 2547XXXXXXXX or 07XXXXXXXX)');
        return false;
      }

      if (!formData.recipientName) {
        setError('Please enter recipient name');
        return false;
      }
    }

    return true;
  };

  const handlePinSubmit = async (pin: string) => {
    if (pin !== state.user?.pin) {
      setError('Invalid PIN. Transaction cancelled.');
      setShowPinEntry(false);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const formattedPhone = transactionType === 'send' 
        ? mpesaService.formatPhoneNumber(formData.recipientPhone)
        : mpesaService.formatPhoneNumber(state.user!.mpesaNumber);

      const transactionRequest = {
        phoneNumber: formattedPhone,
        amount: parseFloat(formData.amount),
        transactionType,
        description: formData.description || `${transactionType} transaction`,
        accountReference: `Jdan${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`,
      };

      const result = await mpesaService.initiateTransaction(transactionRequest);

      if (result.success) {
        setSuccess(`✅ ${result.message}`);
        
        // Save transaction to local storage for tracking
        const transaction = {
          id: result.transactionId || Date.now().toString(),
          userId: state.user!.id,
          type: transactionType,
          amount: parseFloat(formData.amount),
          recipientPhone: transactionType === 'send' ? formData.recipientPhone : undefined,
          recipientName: transactionType === 'send' ? formData.recipientName : undefined,
          description: formData.description || `${transactionType} transaction`,
          status: 'pending',
          createdAt: new Date(),
        };

        const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        existingTransactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(existingTransactions));

        // Reset form
        setFormData({
          recipientPhone: '',
          recipientName: '',
          amount: '',
          description: '',
        });
        
        setShowPinEntry(false);

        // Check transaction status after a delay
        if (result.transactionId) {
          setTimeout(async () => {
            const status = await mpesaService.checkTransactionStatus(result.transactionId!);
            if (status.success) {
              setSuccess('✅ Transaction completed successfully!');
            } else {
              setError(`❌ Transaction failed: ${status.message}`);
            }
          }, 30000); // Check after 30 seconds
        }
      } else {
        setError(`❌ ${result.message}`);
        setShowPinEntry(false);
      }
    } catch (err) {
      setError('❌ Transaction failed. Please try again.');
      setShowPinEntry(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    // Check if M-Pesa API is configured
    if (!process.env.REACT_APP_MPESA_CONSUMER_KEY || 
        !process.env.REACT_APP_MPESA_CONSUMER_SECRET || 
        process.env.REACT_APP_MPESA_CONSUMER_KEY === 'demo_consumer_key') {
      setError('⚠️ Using Demo Mode. For real transactions, add your M-Pesa API credentials to .env file');
      return;
    }

    setShowPinEntry(true);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">💰 Real M-Pesa Transactions</h2>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
          <strong>⚠️ Real Money Alert:</strong> This will process actual M-Pesa transactions using your registered account.
        </div>
      </div>

      {/* Transaction Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Type
        </label>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setTransactionType('send')}
            className={`py-2 px-4 rounded-md font-medium transition-colors ${
              transactionType === 'send'
                ? 'bg-mpesa-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💸 Send Money
          </button>
          <button
            type="button"
            onClick={() => setTransactionType('deposit')}
            className={`py-2 px-4 rounded-md font-medium transition-colors ${
              transactionType === 'deposit'
                ? 'bg-mpesa-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📥 Deposit
          </button>
          <button
            type="button"
            onClick={() => setTransactionType('withdraw')}
            className={`py-2 px-4 rounded-md font-medium transition-colors ${
              transactionType === 'withdraw'
                ? 'bg-mpesa-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📤 Withdraw
          </button>
        </div>
      </div>

      {/* Transaction Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {transactionType === 'send' && (
          <>
            <div>
              <label htmlFor="recipientPhone" className="block text-sm font-medium text-gray-700">
                Recipient Phone Number
              </label>
              <input
                type="tel"
                id="recipientPhone"
                name="recipientPhone"
                placeholder="2547XXXXXXXX or 07XXXXXXXX"
                value={formData.recipientPhone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mpesa-500 focus:border-mpesa-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: 2547XXXXXXXX or 07XXXXXXXX</p>
            </div>

            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">
                Recipient Name
              </label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mpesa-500 focus:border-mpesa-500"
                required
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (KES)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            min="10"
            max="150000"
            step="0.01"
            placeholder="10.00 - 150,000.00"
            value={formData.amount}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mpesa-500 focus:border-mpesa-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Min: KES 10, Max: KES 150,000</p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="Transaction description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mpesa-500 focus:border-mpesa-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600">
            Your M-Pesa Number: <span className="font-medium">{state.user?.mpesaNumber}</span>
          </div>
          <button
            type="submit"
            disabled={isProcessing}
            className="px-6 py-2 bg-mpesa-600 text-white font-medium rounded-md hover:bg-mpesa-700 focus:outline-none focus:ring-2 focus:ring-mpesa-500 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : '🚀 Send Real Money'}
          </button>
        </div>
      </form>

      {/* PIN Entry Modal */}
      {showPinEntry && (
        <PinEntry
          onPinSubmit={handlePinSubmit}
          onCancel={() => setShowPinEntry(false)}
          title="Enter Transaction PIN"
          message={`Authorize ${transactionType} of KES ${formData.amount} - This will process REAL money!`}
          isLoading={isProcessing}
        />
      )}
    </div>
  );
};

export default RealMpesaTransaction;
