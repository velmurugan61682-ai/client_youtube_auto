import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    console.log('INITIAL TOKEN:', token);
    return !!token && token !== 'null' && token !== 'undefined';
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser && savedUser !== 'null' && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const sso_username = queryParams.get('sso_username');
      const sso_key = queryParams.get('sso_key');

      if (sso_username && sso_key) {
        try {
          setAuthLoading(true);
          const response = await api.post('/auth/sso', { sso_username, sso_key });
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
          
          // Clear SSO params from URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
          
          setUser(response.data.user);
          setIsAuthenticated(true);
          setAuthLoading(false);
          return;
        } catch (ssoError) {
          console.error('SSO auto-login failed:', ssoError);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }

      const token = localStorage.getItem('token');
      if (!token || token === 'null' || token === 'undefined') {
        setAuthLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      setAuthLoading(true);
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setIsAuthenticated(true);
    } catch (error) {
      console.warn('Auth check failed:', error.message);
      setIsAuthenticated(false);
      setUser(null);
      if (error.response?.status === 401) {
        console.log('TOKEN REMOVED: checkAuth failed');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
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
          console.log('TOKEN REMOVED: response interceptor 401');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('TOKEN AFTER LOGIN:', localStorage.getItem('token'));
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      if (error.response?.status === 401) {
        console.log('TOKEN REMOVED: login failed');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
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
      console.log('TOKEN REMOVED: user logged out');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const switchOrg = async (organizationId) => {
    try {
      const response = await api.post('/auth/switch-org', { organizationId });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      console.error('Failed to switch organization:', error);
      throw error;
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
      checkAuth,
      switchOrg
    }}>
      {children}
    </AuthContext.Provider>
  );
};
