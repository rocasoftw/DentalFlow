
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MOCK_USERS } from '../constants';
import { ToothIcon } from './Icons';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = await login(email);
    if (!user) {
      setError('Invalid email. Please try again.');
    }
  };

  const handleQuickLogin = (loginEmail: string) => {
    setEmail(loginEmail);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full">
            <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-12 mb-6">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="bg-primary p-3 rounded-full mb-4">
                        <ToothIcon className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">Welcome to DentalApp</h1>
                    <p className="text-slate-500 mt-2">Sign in to manage your practice.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-600">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g., admin@dental.com"
                            required
                            className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
            <div className="text-center text-slate-500">
                <p className="font-semibold mb-2">Quick Logins (Demo)</p>
                <div className="flex justify-center space-x-2">
                    <button onClick={() => handleQuickLogin(MOCK_USERS[0].email)} className="text-sm bg-white shadow-md px-3 py-1 rounded-full hover:bg-primary hover:text-white transition">Admin</button>
                    <button onClick={() => handleQuickLogin(MOCK_USERS[1].email)} className="text-sm bg-white shadow-md px-3 py-1 rounded-full hover:bg-primary hover:text-white transition">User</button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;
