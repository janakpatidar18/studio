
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// A simple user object for the PIN-based auth
type SimpleUser = {
  isAuthenticated: boolean;
};

interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CORRECT_PIN = "24";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user-auth');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from session storage", error);
    }
    setLoading(false);
  }, []);


  const login = (pin: string) => {
    if (pin === CORRECT_PIN) {
      const authenticatedUser: SimpleUser = { isAuthenticated: true };
      sessionStorage.setItem('user-auth', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('user-auth');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
