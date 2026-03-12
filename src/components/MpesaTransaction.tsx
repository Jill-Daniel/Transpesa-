import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PinEntry from './PinEntry';
import { Transaction } from '../types';

const MpesaTransaction: React.FC = () => {
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

    if (transactionType === 'send') {
      if (!formData.recipientPhone) {
        setError('Please enter recipient phone number');
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
      // Simulate M-Pesa API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const transaction: Transaction = {
        id: Date.now().toString(),
        userId: state.user!.id,
        type: transactionType,
        amount: parseFloat(formData.amount),
        recipientPhone: transactionType === 'send' ? formData.recipientPhone : undefined,
        recipientName: transactionType === 'send' ? formData.recipientName : undefined,
        description: formData.description || `${transactionType} transaction`,
        status: 'completed',
        createdAt: new Date(),
      };

      // Save transaction to localStorage
      const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      existingTransactions.push(transaction);
      localStorage.setItem('transactions', JSON.stringify(existingTransactions));

      setSuccess(`${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} of KES ${formData.amount} successful!`);
      
      // Reset form
      setFormData({
        recipientPhone: '',
        recipientName: '',
        amount: '',
        description: '',
      });
      
      setShowPinEntry(false);
    } catch (err) {
      setError('Transaction failed. Please try again.');
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

    setShowPinEntry(true);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">M-Pesa Transactions</h2>

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
            Send Money
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
            Deposit
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
            Withdraw
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
                placeholder="+254 XXX XXX XXX"
                value={formData.recipientPhone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mpesa-500 focus:border-mpesa-500"
                required
              />
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
            min="1"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mpesa-500 focus:border-mpesa-500"
            required
          />
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
            className="px-6 py-2 bg-mpesa-600 text-white font-medium rounded-md hover:bg-mpesa-700 focus:outline-none focus:ring-2 focus:ring-mpesa-500"
          >
            Proceed to Payment
          </button>
        </div>
      </form>

      {/* PIN Entry Modal */}
      {showPinEntry && (
        <PinEntry
          onPinSubmit={handlePinSubmit}
          onCancel={() => setShowPinEntry(false)}
          title="Enter Transaction PIN"
          message={`Authorize ${transactionType} of KES ${formData.amount}`}
          isLoading={isProcessing}
        />
      )}
    </div>
  );
};

export default MpesaTransaction;
