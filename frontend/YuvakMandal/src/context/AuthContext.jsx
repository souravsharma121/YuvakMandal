import React, { createContext, useReducer, useContext, useEffect } from 'react';
import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';

const baseURL = import.meta.env.VITE_API_URL;

const AuthContext = createContext();

const initialState = {
  token: localStorage.getItem('x-token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
        error: null
      };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('x-token', action.payload.token);
      setAuthToken(action.payload.token); // Set the token in axios headers immediately
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
      localStorage.removeItem('x-token');
      setAuthToken(null);
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload
      };
    case 'LOGOUT':
      localStorage.removeItem('x-token');
      setAuthToken(null);
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = async () => {
    if (!localStorage.getItem('x-token')) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: 'No authentication token found'
      });
      return false;
    }
  
    try {
      setAuthToken(localStorage.getItem('x-token')); // Ensure token is set before request
      const res = await axios.get(`${baseURL}/api/auth/me`);
      dispatch({
        type: 'USER_LOADED',
        payload: res.data
      });
      return true;
    } catch (err) {
      // Only dispatch AUTH_ERROR if it's a 401/403 error
      // For other errors (like network issues), don't clear the authentication state
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: err.response.data.message || 'Authentication failed'
        });
        return false;
      } else {
        console.error('Error loading user:', err);
        // Don't change authentication state for non-auth errors
        return false;
      }
    }
  };

  // Login user
const login = async (mobileNumber, password) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const res = await axios.post(
      `${baseURL}/api/auth/login`, 
      { mobileNumber, password }, 
      config
    );
    
    localStorage.setItem('x-token', res.data.token);
    setAuthToken(res.data.token);
    
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: res.data
    });

    // Try to load user but don't logout automatically if it fails
    // This gives the token a chance to persist even if the initial user load fails
    try {
      await loadUser();
    } catch (err) {
      console.error('Failed to load user details after login:', err);
      // Don't logout here - just let the user stay "logged in" with the token
    }
    
  } catch (err) {
    dispatch({
      type: 'LOGIN_FAIL',
      payload: err.response?.data?.message || err.message || 'Login failed'
    });
    throw err;
  }
};

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Update a user
const updateUser = async (userId, updatedData) => {
  try {
    const res = await axios.put(`${baseURL}/api/users/${userId}`, updatedData);
    
    // If the logged-in user is being updated, refresh the user info in context
    if (state.user && state.user._id === userId) {
      dispatch({
        type: 'USER_LOADED',
        payload: res.data
      });
    }

    return res.data;
  } catch (err) {
    console.error('Error updating user:', err);
    throw err;
  }
};

  // Get all users
const getAllUsers = async () => {
  try {
    const res = await axios.get(`${baseURL}/api/users`);    
    return res.data;
  } catch (err) {
    console.error('Error fetching users:', err);
    throw err;
  }
};

// Delete a user
const deleteUser = async (userId) => {
  try {
    await axios.delete(`${baseURL}/api/users/${userId}`);
    return true;
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
};

  // Load user on initial render if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      if (localStorage.getItem('x-token')) {
        setAuthToken(localStorage.getItem('x-token'));
        await loadUser();
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: null });
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        login,
        logout,
        loadUser,
        clearError,
        getAllUsers, 
        deleteUser,
        updateUser
      }}
    >
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

export default AuthContext;