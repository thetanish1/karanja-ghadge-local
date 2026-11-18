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

  // Instantaneous login for role switching / demo portal
  const quickLoginAs = async (role: 'customer' | 'shopkeeper' | 'delivery_partner' | 'admin') => {
    try {
      const res = await api.loginAsRole(role);
      if (res.success && res.user) {
        localStorage.setItem('kgl_access_token', res.accessToken);
        localStorage.setItem('kgl_refresh_token', res.refreshToken);
        setUser(res.user);
        setActiveRole(role);
        return;
      }
    } catch (e) {
      console.warn('API role-login error, using fallback:', e);
    }

    const roleProfiles = {
      customer: { id: 'usr-customer', phone: '9876543210', name: 'Akash Kumar' },
      shopkeeper: { id: 'usr-shopkeeper', phone: '9876543211', name: 'Gupta Fresh Mart (Merchant)' },
      delivery_partner: { id: 'usr-delivery', phone: '9876543212', name: 'Ravi Singh (Delivery Partner)' },
      admin: { id: 'usr-admin', phone: '9876543213', name: 'Platform Admin' },
    };
    const p = roleProfiles[role];
    setUser({
      id: p.id,
      phone: p.phone,
      name: p.name,
      roles: [role, 'customer'],
      status: 'active',
    });
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
