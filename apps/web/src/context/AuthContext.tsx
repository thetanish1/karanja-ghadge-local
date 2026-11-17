import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

export interface User {
  id: string;
  phone: string;
  name: string;
  roles: string[];
  status: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  activeRole: string;
  setActiveRole: (role: string) => void;
  loginWithPhoneOtp: (phone: string, otp: string, name?: string) => Promise<void>;
  quickLoginAs: (role: 'customer' | 'shopkeeper' | 'delivery_partner' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<string>('customer');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('kgl_access_token');
      if (token) {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          // Set primary role
          if (res.user.roles.includes('admin')) setActiveRole('admin');
          else if (res.user.roles.includes('shopkeeper')) setActiveRole('shopkeeper');
          else if (res.user.roles.includes('delivery_partner')) setActiveRole('delivery_partner');
          else setActiveRole('customer');
        }
      }
    } catch (e) {
      console.warn('Auth session check failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const loginWithPhoneOtp = async (phone: string, otp: string, name?: string) => {
    const res = await api.verifyOtp(phone, otp, name);
    if (res.success) {
      localStorage.setItem('kgl_access_token', res.accessToken);
      localStorage.setItem('kgl_refresh_token', res.refreshToken);
      setUser(res.user);
      if (res.user.roles.includes('admin')) setActiveRole('admin');
      else if (res.user.roles.includes('shopkeeper')) setActiveRole('shopkeeper');
      else if (res.user.roles.includes('delivery_partner')) setActiveRole('delivery_partner');
      else setActiveRole('customer');
    }
  };

  // Demo helper: instantaneous one-click login for test users
  const quickLoginAs = async (role: 'customer' | 'shopkeeper' | 'delivery_partner' | 'admin') => {
    const rolePhones = {
      customer: '9876543210',
      shopkeeper: '9876543211',
      delivery_partner: '9876543212',
      admin: '9876543213',
    };
    await loginWithPhoneOtp(rolePhones[role], '123456');
    setActiveRole(role);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('kgl_access_token');
    localStorage.removeItem('kgl_refresh_token');
    setUser(null);
    setActiveRole('customer');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        activeRole,
        setActiveRole,
        loginWithPhoneOtp,
        quickLoginAs,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
