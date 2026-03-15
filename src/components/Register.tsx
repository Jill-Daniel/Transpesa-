import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mpesaNumber: '',
    password: '',
    confirmPassword: '',
    pin: '',
    confirmPin: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const { register, state } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (formData.pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        mpesaNumber: formData.mpesaNumber,
        password: formData.password,
        pin: formData.pin,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-mpesa-50 flex items-center justify-center px-4 safe-area-top safe-area-bottom">
      <div className="max-w-md w-full space-y-8 animate-scale-in">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-mpesa-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-slow">
            <span className="text-white font-bold text-2xl">JA</span>
          </div>
          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Create Account
          </h1>
          <p className="mt-3 text-base text-gray-600">
            Join Jdan Agencies for secure M-Pesa services
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-mpesa-500 focus:border-mpesa-500 text-base transition-all"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-mpesa-500 focus:border-mpesa-500 text-base transition-all"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="+254 XXX XXX XXX"
                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-mpesa-500 focus:border-mpesa-500 text-base transition-all"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="mpesaNumber" className="block text-sm font-semibold text-gray-700">
                M-Pesa Number
              </label>
              <input
                id="mpesaNumber"
                name="mpesaNumber"
                type="tel"
                required
                placeholder="+254 XXX XXX XXX"
                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-mpesa-500 focus:border-mpesa-500 text-base transition-all"
                value={formData.mpesaNumber}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-mpesa-500 focus:border-mpesa-500 text-base transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center touch-ripple"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-mpesa-500 focus:border-mpesa-500 text-base transition-all"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
            </div>

            <div>
              <label htmlFor="pin" className="block text-sm font-semibold text-gray-700">
                Transaction PIN (4 digits)
              </label>
              <div className="mt-2 relative">
                <input
                  id="pin"
                  name="pin"
                  type={showPin ? 'text' : 'password'}
                  required
                  maxLength={4}
                  pattern="\d{4}"
                  inputMode="numeric"
                  autoComplete="off"
                  className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-mpesa-500 focus:border-mpesa-500 text-base text-center text-lg font-mono transition-all"
                  value={formData.pin}
                  onChange={handleChange}
                  placeholder="••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center touch-ripple"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeSlashIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPin" className="block text-sm font-semibold text-gray-700">
                Confirm PIN
              </label>
              <input
                id="confirmPin"
                name="confirmPin"
                type={showPin ? 'text' : 'password'}
                required
                maxLength={4}
                pattern="\d{4}"
                inputMode="numeric"
                autoComplete="off"
                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-mpesa-500 focus:border-mpesa-500 text-base text-center text-lg font-mono transition-all"
                value={formData.confirmPin}
                onChange={handleChange}
                placeholder="••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm font-medium animate-slide-up">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={state.isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-mpesa-600 hover:bg-mpesa-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mpesa-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 touch-ripple shadow-lg"
            >
              {state.isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-base text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-mpesa-600 hover:text-mpesa-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
