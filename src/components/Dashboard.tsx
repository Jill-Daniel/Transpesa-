import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Transaction } from '../types';
import { 
  BanknotesIcon, 
  ArrowUpCircleIcon, 
  ArrowDownCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const { state } = useAuth();

  const loadTransactions = useCallback(() => {
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
  }, [state.user?.id]);

  useEffect(() => {
    loadTransactions();
  }, [state.user?.id, loadTransactions]);

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
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Mobile Header Space */}
      <div className="md:hidden h-16"></div>
      
      <div className="px-4 py-6 max-w-6xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back, {state.user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-600 mt-1">Manage your M-Pesa transactions and savings</p>
            </div>
            <div className="bg-mpesa-50 rounded-lg p-3 text-center md:text-right">
              <p className="text-sm text-mpesa-600 font-medium">M-Pesa Number</p>
              <p className="font-bold text-mpesa-800">{state.user?.mpesaNumber}</p>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-mpesa-500 to-mpesa-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-mpesa-100 text-sm md:text-base font-medium">Total Balance</p>
              <p className="text-3xl md:text-4xl font-bold mt-2">KES {balance.toFixed(2)}</p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm text-mpesa-100">Account Active</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <BanknotesIcon className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <ArrowUpCircleIcon className="h-8 w-8 text-red-500" />
              <span className="text-xs text-gray-500 bg-red-50 px-2 py-1 rounded-full">Sent</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              KES {transactions
                .filter(t => t.type === 'send')
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <ArrowDownCircleIcon className="h-8 w-8 text-green-500" />
              <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded-full">Received</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              KES {transactions
                .filter(t => t.type === 'receive' || t.type === 'deposit')
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 md:col-span-1 col-span-2">
            <div className="flex items-center justify-between mb-2">
              <BanknotesIcon className="h-8 w-8 text-mpesa-600" />
              <span className="text-xs text-gray-500 bg-mpesa-50 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {transactions.length} Transactions
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="group flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-mpesa-50 transition-all duration-200 transform hover:scale-105">
              <div className="bg-mpesa-100 group-hover:bg-mpesa-200 rounded-full p-3 mb-3 transition-colors">
                <ArrowUpCircleIcon className="h-6 w-6 text-mpesa-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-mpesa-700">Send Money</span>
            </button>
            <button className="group flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-mpesa-50 transition-all duration-200 transform hover:scale-105">
              <div className="bg-mpesa-100 group-hover:bg-mpesa-200 rounded-full p-3 mb-3 transition-colors">
                <ArrowDownCircleIcon className="h-6 w-6 text-mpesa-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-mpesa-700">Request</span>
            </button>
            <button className="group flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-mpesa-50 transition-all duration-200 transform hover:scale-105">
              <div className="bg-mpesa-100 group-hover:bg-mpesa-200 rounded-full p-3 mb-3 transition-colors">
                <BanknotesIcon className="h-6 w-6 text-mpesa-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-mpesa-700">Savings</span>
            </button>
            <button className="group flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-mpesa-50 transition-all duration-200 transform hover:scale-105">
              <div className="bg-mpesa-100 group-hover:bg-mpesa-200 rounded-full p-3 mb-3 transition-colors">
                <ClockIcon className="h-6 w-6 text-mpesa-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-mpesa-700">History</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <button className="text-mpesa-600 hover:text-mpesa-700 text-sm font-medium flex items-center space-x-1">
              <span>View All</span>
              <ArrowDownCircleIcon className="h-4 w-4" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BanknotesIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-1">Start using M-Pesa services to see your transaction history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white rounded-full p-2">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        {transaction.recipientName && ` to ${transaction.recipientName}`}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{transaction.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.createdAt).toLocaleDateString()} at {new Date(transaction.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'send' || transaction.type === 'withdraw' ? '-' : '+'}
                      KES {transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
