import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';
import useToast from '../hooks/useToast';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);
const options = {
  duration: 2000,
  position: "top-center",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { showToast } = useToast();
  // const location = useLocation();
  const  from = '/'// location.state.from || '/';

  // const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // axios.defaults.headers.common['authorization'] = `Bearer ${token}`;
      const response = axiosInstance.get('/admin/validate-token')
      if (response.status === 200) {
        setUser(response.data.user);
        // navigate('/', { state: {} });
      }

      // else {
      //   localStorage.removeItem('token');
      //   setUser(null);
      //   showToast('Need to login again.', options)
      // }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/admin/register', userData);
      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // axios.defaults.headers.common['authorization'] = `Bearer ${token}`;
        setUser(user);
        showToast('Registration successful', options)
        // navigate(from, { state: {} });
      }
      else if (response.status === 209) {
        const { message } = response.datamessage
        showToast(message)
      }


    } catch (err) {
      setError(err.response ? err.response.data.message : 'Something went wrong');
      showToast('Registration error', options)
      // navigate(from, { state: {} });
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/admin/login', credentials);
      if (response.status === 200) {
        const { token, user } = response.data;
        console.log('login token',token)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // axios.defaults.headers.common['authorization'] = `Bearer ${token}`;
        setUser(user);
        showToast('Login successful', options)
        // navigate(from, { state: {} });
      }
      else if (response.status === 209) {
        const { message } = response.data.message
        showToast(message, options)
      }

    } catch (err) {
      showToast(`Login error${err}`, options)
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    axios.defaults.headers.common['authorization'] = '';
    setUser(null);
    showToast('Logout successful', options)
    // navigate(from, { state: {} });
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
