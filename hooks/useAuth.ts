import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('dental-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string): Promise<User | null> => {
    setLoading(true);
    // Simulate API call
    return new Promise(resolve => {
        setTimeout(() => {
            const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (foundUser) {
                localStorage.setItem('dental-user', JSON.stringify(foundUser));
                setUser(foundUser);
                setLoading(false);
                resolve(foundUser);
            } else {
                setLoading(false);
                resolve(null);
            }
        }, 1000);
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('dental-user');
    setUser(null);
  }, []);

  // FIX: Replaced JSX with React.createElement because JSX is not supported in .ts files. This was causing a series of parsing errors.
  return React.createElement(
    AuthContext.Provider,
    { value: { user, login, logout, loading } },
    loading ? null : children
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
