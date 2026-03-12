import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Transaction } from '../types';
import { 
  BanknotesIcon, 
  ArrowUpCircleIcon, 
  ArrowDownCircleIcon,
  UserCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const { state } = useAuth();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const userTransactions = allTransactions.filter((t: Transaction) => t.userId === state.user?.id);
    setTransactions(userTransactions.sort((a: Transaction, b: Transaction) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5));

    // Calculate balance
    const userBalance = userTransactions.reduce((acc: number, t: Transaction) => {
      if (t.type === 'send' || t.type === 'withdraw') {
        return acc - t.amount;
      } else if (t.type === 'receive' || t.type === 'deposit') {
        return acc + t.amount;
      }
      return acc;
    }, 0);
    setBalance(userBalance);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpCircleIcon className="h-5 w-5 text-red-500" />;
      case 'receive':
        return <ArrowDownCircleIcon className="h-5 w-5 text-green-500" />;
      case 'deposit':
        return <ArrowDownCircleIcon className="h-5 w-5 text-green-500" />;
      case 'withdraw':
        return <ArrowUpCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <BanknotesIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'send':
      case 'withdraw':
        return 'text-red-600';
      case 'receive':
      case 'deposit':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {state.user?.name}</h1>
            <p className="text-gray-600 mt-1">Manage your M-Pesa transactions and savings</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">M-Pesa Number</p>
            <p className="font-semibold">{state.user?.mpesaNumber}</p>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-mpesa-500 to-mpesa-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-mpesa-100">Current Balance</p>
              <p className="text-3xl font-bold mt-2">KES {balance.toFixed(2)}</p>
            </div>
            <BanknotesIcon className="h-12 w-12 text-mpesa-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                KES {transactions
                  .filter(t => t.type === 'send')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
            <ArrowUpCircleIcon className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Received</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                KES {transactions
                  .filter(t => t.type === 'receive' || t.type === 'deposit')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
            <ArrowDownCircleIcon className="h-10 w-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-mpesa-500 hover:bg-mpesa-50 transition-colors">
            <ArrowUpCircleIcon className="h-8 w-8 text-mpesa-600 mb-2" />
            <span className="text-sm font-medium">Send Money</span>
          </button>
          <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-mpesa-500 hover:bg-mpesa-50 transition-colors">
            <ArrowDownCircleIcon className="h-8 w-8 text-mpesa-600 mb-2" />
            <span className="text-sm font-medium">Request Money</span>
          </button>
          <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-mpesa-500 hover:bg-mpesa-50 transition-colors">
            <BanknotesIcon className="h-8 w-8 text-mpesa-600 mb-2" />
            <span className="text-sm font-medium">Savings</span>
          </button>
          <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-mpesa-500 hover:bg-mpesa-50 transition-colors">
            <ClockIcon className="h-8 w-8 text-mpesa-600 mb-2" />
            <span className="text-sm font-medium">History</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <button className="text-mpesa-600 hover:text-mpesa-500 text-sm font-medium">
            View All
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-1">Start using M-Pesa services to see your transaction history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      {transaction.recipientName && ` to ${transaction.recipientName}`}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()} at {new Date(transaction.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'send' || transaction.type === 'withdraw' ? '-' : '+'}
                    KES {transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
