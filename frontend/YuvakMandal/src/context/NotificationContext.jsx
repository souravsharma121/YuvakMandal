import React, { createContext, useReducer, useContext } from 'react';
import axios from 'axios';
import { useAlert } from './AlertContext';
const baseURL = import.meta.env.VITE_API_URL  

// Create context
const NotificationContext = createContext();

// Initial state
const initialState = {
  notifications: [],
  loading: true,
  error: null
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'GET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        loading: false
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        loading: false
      };
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification._id !== action.payload
        ),
        loading: false
      };
    case 'NOTIFICATION_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: true
      };
    default:
      return state;
  }
};

// Provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { setAlert } = useAlert();

  // Get all notifications
  const getNotifications = async () => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      const res = await axios.get(`${baseURL}/api/notifications`);
      dispatch({
        type: 'GET_NOTIFICATIONS',
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: 'NOTIFICATION_ERROR',
        payload: err.response?.data?.message || 'Failed to fetch notifications'
      });
      setAlert(err.response?.data?.message || 'Failed to fetch notifications', 'danger');
    }
  };

  // Add notification
  const addNotification = async (notificationData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    dispatch({ type: 'SET_LOADING' });
    
    try {
      const res = await axios.post(`${baseURL}/api/notifications`, notificationData, config);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: res.data
      });
      setAlert('Notification created successfully', 'success');
      return true;
    } catch (err) {
      dispatch({
        type: 'NOTIFICATION_ERROR',
        payload: err.response?.data?.message || 'Failed to create notification'
      });
      setAlert(err.response?.data?.message || 'Failed to create notification', 'danger');
      return false;
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      await axios.delete(`${baseURL}/api/notifications/${id}`);
      dispatch({
        type: 'DELETE_NOTIFICATION',
        payload: id
      });
      setAlert('Notification deleted successfully', 'success');
      return true;
    } catch (err) {
      dispatch({
        type: 'NOTIFICATION_ERROR',
        payload: err.response?.data?.message || 'Failed to delete notification'
      });
      setAlert(err.response?.data?.message || 'Failed to delete notification', 'danger');
      return false;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        loading: state.loading,
        error: state.error,
        getNotifications,
        addNotification,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;