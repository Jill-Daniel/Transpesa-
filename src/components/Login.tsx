import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, state } = useAuth();
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
    
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
            Jdan Agencies
          </h1>
          <p className="mt-3 text-base text-gray-600">
            Welcome back! Sign in to your M-Pesa account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-mpesa-500 focus:border-mpesa-500 text-base transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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
              {state.isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-base text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-mpesa-600 hover:text-mpesa-700 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
