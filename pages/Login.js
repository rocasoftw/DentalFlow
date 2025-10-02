import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.js';
import { ToothIcon } from '../components/icons/ToothIcon.js';

const Login = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@dentalflow.com');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
      setError('');
      dispatch({ type: 'LOGIN', payload: user });
      navigate('/');
    } else {
      setError('Credenciales inválidas. Intente de nuevo.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
            <div className="flex items-center justify-center mb-4 text-primary-600">
                <ToothIcon className="w-12 h-12 mr-2"/>
                <h1 className="text-3xl font-bold">DentalFlow</h1>
            </div>
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
            Inicie sesión en su cuenta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-2" className="sr-only">Contraseña</label>
              <input
                id="password-2"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium text-primary-600 hover:text-primary-500">
                (Admin: admin@dentalflow.com / 1234)
              </span>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
