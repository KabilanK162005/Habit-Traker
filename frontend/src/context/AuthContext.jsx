import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate user session from localStorage
    const savedUser = localStorage.getItem('habit_flow_user');
    const savedToken = localStorage.getItem('habit_flow_token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user: userData } = response.data;
      
      localStorage.setItem('habit_flow_token', accessToken);
      localStorage.setItem('habit_flow_user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check credentials.';
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.post('/auth/register', { name, email, password });
      // Automatically log in after registration to get a fresh token
      return await login(email, password);
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed. Please try again.';
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('habit_flow_token');
      localStorage.removeItem('habit_flow_user');
      setUser(null);
    }
  };

  const updateProfile = async (name, themePreference, languagePreference, timezone) => {
    try {
      const response = await api.put('/profile', {
        name,
        themePreference,
        languagePreference,
        timezone,
      });
      const updatedUser = {
        ...user,
        name: response.data.name,
        themePreference: response.data.themePreference,
      };
      localStorage.setItem('habit_flow_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error.response?.data?.message || 'Profile update failed.';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
