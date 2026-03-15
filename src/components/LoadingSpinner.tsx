import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-mpesa-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="h-16 w-16 bg-mpesa-100 rounded-full flex items-center justify-center animate-pulse-slow">
              <div className="h-8 w-8 bg-mpesa-600 rounded-full animate-spin"></div>
            </div>
            <div className="absolute -inset-2 bg-mpesa-200 rounded-full animate-ping opacity-20"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">Loading Jdan Agencies</h2>
          <p className="text-gray-600 text-base leading-relaxed">
            Please wait while we prepare your mobile experience...
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

export default LoadingSpinner;
