import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PinEntry from './PinEntry';
import type { SavingsAccount } from '../types';

const SavingsAccountComponent: React.FC = () => {
  const [savings, setSavings] = useState<SavingsAccount | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'goals'>('overview');
  const { state } = useAuth();

  useEffect(() => {
    loadSavingsAccount();
  }, []);

  const loadSavingsAccount = () => {
    const existingSavings = JSON.parse(localStorage.getItem('savings') || '[]');
    const userSavings = existingSavings.find((s: SavingsAccount) => s.userId === state.user?.id);
    if (userSavings) {
      setSavings(userSavings);
    } else {
      // Create new savings account for user
      const newSavings: SavingsAccount = {
        id: Date.now().toString(),
        userId: state.user!.id,
        balance: 0,
        createdAt: new Date(),
      };
      existingSavings.push(newSavings);
      localStorage.setItem('savings', JSON.stringify(existingSavings));
      setSavings(newSavings);
    }
  };

  const handleDeposit = async (pin: string) => {
    if (pin !== state.user?.pin) {
      setError('Invalid PIN. Transaction cancelled.');
      setShowPinEntry(false);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedSavings = {
        ...savings!,
        balance: savings!.balance + parseFloat(depositAmount),
      };

      // Update savings in localStorage
      const allSavings = JSON.parse(localStorage.getItem('savings') || '[]');
      const savingsIndex = allSavings.findIndex((s: SavingsAccount) => s.userId === state.user!.id);
      allSavings[savingsIndex] = updatedSavings;
      localStorage.setItem('savings', JSON.stringify(allSavings));

      // Record transaction
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      transactions.push({
        id: Date.now().toString(),
        userId: state.user!.id,
        type: 'deposit',
        amount: parseFloat(depositAmount),
        description: 'Savings deposit',
        status: 'completed',
        createdAt: new Date(),
      });
      localStorage.setItem('transactions', JSON.stringify(transactions));

      setSavings(updatedSavings);
      setSuccess(`Successfully deposited KES ${depositAmount} to savings!`);
      setDepositAmount('');
      setShowPinEntry(false);
    } catch (err) {
      setError('Deposit failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async (pin: string) => {
    if (pin !== state.user?.pin) {
      setError('Invalid PIN. Transaction cancelled.');
      setShowPinEntry(false);
      return;
    }

    if (parseFloat(withdrawAmount) > savings!.balance) {
      setError('Insufficient savings balance.');
      setShowPinEntry(false);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedSavings = {
        ...savings!,
        balance: savings!.balance - parseFloat(withdrawAmount),
      };

      // Update savings in localStorage
      const allSavings = JSON.parse(localStorage.getItem('savings') || '[]');
      const savingsIndex = allSavings.findIndex((s: SavingsAccount) => s.userId === state.user!.id);
      allSavings[savingsIndex] = updatedSavings;
      localStorage.setItem('savings', JSON.stringify(allSavings));

      // Record transaction
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      transactions.push({
        id: Date.now().toString(),
        userId: state.user!.id,
        type: 'withdraw',
        amount: parseFloat(withdrawAmount),
        description: 'Savings withdrawal',
        status: 'completed',
        createdAt: new Date(),
      });
      localStorage.setItem('transactions', JSON.stringify(transactions));

      setSavings(updatedSavings);
      setSuccess(`Successfully withdrew KES ${withdrawAmount} from savings!`);
      setWithdrawAmount('');
      setShowPinEntry(false);
    } catch (err) {
      setError('Withdrawal failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateSavingsGoals = () => {
    if (!targetAmount || !targetDate) return;

    const updatedSavings = {
      ...savings!,
      targetAmount: parseFloat(targetAmount),
      targetDate: new Date(targetDate),
    };

    const allSavings = JSON.parse(localStorage.getItem('savings') || '[]');
    const savingsIndex = allSavings.findIndex((s: SavingsAccount) => s.userId === state.user!.id);
    allSavings[savingsIndex] = updatedSavings;
    localStorage.setItem('savings', JSON.stringify(allSavings));

    setSavings(updatedSavings);
    setSuccess('Savings goals updated successfully!');
    setTargetAmount('');
    setTargetDate('');
  };

  const getProgressPercentage = () => {
    if (!savings?.targetAmount) return 0;
    return Math.min((savings.balance / savings.targetAmount) * 100, 100);
  };

  if (!savings) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Savings Account</h2>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {(['overview', 'deposit', 'withdraw', 'goals'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-mpesa-500 text-mpesa-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-mpesa-500 to-mpesa-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
              <p className="text-3xl font-bold">KES {savings.balance.toFixed(2)}</p>
            </div>

            {savings.targetAmount && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Goal Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Current: KES {savings.balance.toFixed(2)}</span>
                    <span>Target: KES {savings.targetAmount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-mpesa-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {getProgressPercentage().toFixed(1)}% of goal achieved
                  </p>
                  {savings.targetDate && (
                    <p className="text-sm text-gray-600">
                      Target date: {new Date(savings.targetDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800">Total Deposits</h4>
                <p className="text-2xl font-bold text-green-900">
                  KES {savings.balance.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800">Account Created</h4>
                <p className="text-lg font-semibold text-blue-900">
                  {new Date(savings.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700">
                Deposit Amount (KES)
              </label>
              <input
                type="number"
                id="depositAmount"
                min="1"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mpesa-500 focus:border-mpesa-500"
                placeholder="0.00"
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

            <button
              onClick={() => {
                if (!depositAmount || parseFloat(depositAmount) <= 0) {
                  setError('Please enter a valid amount');
                  return;
                }
                setError('');
                setShowPinEntry(true);
              }}
              className="w-full px-4 py-2 bg-mpesa-600 text-white font-medium rounded-md hover:bg-mpesa-700 focus:outline-none focus:ring-2 focus:ring-mpesa-500"
            >
              Deposit to Savings
            </button>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700">
                Withdraw Amount (KES)
              </label>
              <input
                type="number"
                id="withdrawAmount"
                min="1"
                max={savings.balance}
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mpesa-500 focus:border-mpesa-500"
                placeholder="0.00"
              />
              <p className="text-sm text-gray-600 mt-1">
                Available balance: KES {savings.balance.toFixed(2)}
              </p>
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

            <button
              onClick={() => {
                if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
                  setError('Please enter a valid amount');
                  return;
                }
                if (parseFloat(withdrawAmount) > savings.balance) {
                  setError('Insufficient balance');
                  return;
                }
                setError('');
                setShowPinEntry(true);
              }}
              className="w-full px-4 py-2 bg-mpesa-600 text-white font-medium rounded-md hover:bg-mpesa-700 focus:outline-none focus:ring-2 focus:ring-mpesa-500"
            >
              Withdraw from Savings
            </button>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
                Target Amount (KES)
              </label>
              <input
                type="number"
                id="targetAmount"
                min="1"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mpesa-500 focus:border-mpesa-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">
                Target Date
              </label>
              <input
                type="date"
                id="targetDate"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mpesa-500 focus:border-mpesa-500"
              />
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <button
              onClick={updateSavingsGoals}
              className="w-full px-4 py-2 bg-mpesa-600 text-white font-medium rounded-md hover:bg-mpesa-700 focus:outline-none focus:ring-2 focus:ring-mpesa-500"
            >
              Update Savings Goals
            </button>
          </div>
        )}
      </div>

      {/* PIN Entry Modal */}
      {showPinEntry && (
        <PinEntry
          onPinSubmit={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
          onCancel={() => setShowPinEntry(false)}
          title="Enter Transaction PIN"
          message={`Authorize ${activeTab} of KES ${activeTab === 'deposit' ? depositAmount : withdrawAmount}`}
          isLoading={isProcessing}
        />
      )}
    </div>
  );
};

export default SavingsAccountComponent;
