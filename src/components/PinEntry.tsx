import React, { useState, useRef, useEffect } from 'react';

interface PinEntryProps {
  onPinSubmit: (pin: string) => void;
  onCancel?: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

const PinEntry: React.FC<PinEntryProps> = ({
  onPinSubmit,
  onCancel,
  title = 'Enter Transaction PIN',
  message = 'Please enter your 4-digit PIN to authorize this transaction',
  isLoading = false,
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (newPin.every(digit => digit !== '')) {
      onPinSubmit(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d{1,4}$/.test(pastedData)) {
      const newPin = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
      setPin(newPin);
      if (newPin.every(digit => digit !== '')) {
        onPinSubmit(newPin.join(''));
      }
    }
  };

  const clearPin = () => {
    setPin(['', '', '', '']);
    inputRefs[0].current?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 text-center mb-6">
          {message}
        </p>

        <div className="flex justify-center space-x-2 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isLoading}
              className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-mpesa-500 focus:outline-none disabled:opacity-50"
            />
          ))}
        </div>

        <div className="flex space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-mpesa-500 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={clearPin}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-mpesa-500 disabled:opacity-50"
          >
            Clear
          </button>
          <button
            onClick={() => onPinSubmit(pin.join(''))}
            disabled={isLoading || pin.some(digit => digit === '')}
            className="flex-1 px-4 py-2 bg-mpesa-600 text-white rounded-md hover:bg-mpesa-700 focus:outline-none focus:ring-2 focus:ring-mpesa-500 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinEntry;
