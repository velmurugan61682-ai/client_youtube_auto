import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);

      const queryParams = new URLSearchParams(window.location.search);
      const sso_username = queryParams.get('sso_username');
      const sso_key = queryParams.get('sso_key');

      if (sso_username && sso_key) {
        try {
          const res = await api.post('/auth/sso', { sso_username, sso_key });
          localStorage.setItem('token', res.data.token);
          
          // Clear SSO params from URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
          
          setUser(res.data.user);
          setIsAuthenticated(true);
          setAuthLoading(false);
          return;
        } catch (ssoError) {
          console.error('SSO auto-login failed:', ssoError);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }

      const res = await api.get('/auth/me');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.warn('Auth check failed:', error.message);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('token');
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      setUser(res.data.user);
      setIsAuthenticated(true);
      return res.data;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
      throw error;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  };

  const logout = async () => {
    try {
      // Still notify server, though headers will handle it
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      authLoading, 
      user, 
      login, 
      register, 
      logout, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
