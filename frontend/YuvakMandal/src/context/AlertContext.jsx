import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create context
const AlertContext = createContext();

// Initial state
const initialState = {
  alerts: [],
  timeouts: {} // Track timeouts to clear them when needed
};

// Generate unique ID
const generateID = () => Math.random().toString(36).substr(2, 9);

// Reducer
const alertReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ALERT':
      return {
        ...state,
        alerts: [...state.alerts, { ...action.payload, id: action.payload.id }],
        timeouts: { 
          ...state.timeouts, 
          [action.payload.id]: action.payload.timeoutId 
        }
      };
    case 'REMOVE_ALERT':
      const newTimeouts = { ...state.timeouts };
      delete newTimeouts[action.payload];
      
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload),
        timeouts: newTimeouts
      };
    case 'CLEAR_ALL_ALERTS':
      return {
        ...state,
        alerts: [],
        timeouts: {}
      };
    default:
      return state;
  }
};

// Provider component
export const AlertProvider = ({ children }) => {
  const [state, dispatch] = useReducer(alertReducer, initialState);

  // Clear all timeouts when component unmounts
  useEffect(() => {
    return () => {
      Object.values(state.timeouts).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
    };
  }, [state.timeouts]);

  // Set alert
  const setAlert = (message, type = 'info', timeout = 1500) => {
    const id = generateID();
    
    // Create timeout and store its ID
    const timeoutId = setTimeout(() => {
      dispatch({
        type: 'REMOVE_ALERT',
        payload: id
      });
    }, timeout);
    
    dispatch({
      type: 'SET_ALERT',
      payload: { message, type, id, timeoutId }
    });
    
    return id;
  };

  // Remove alert
  const removeAlert = (id) => {
    // Clear the timeout associated with this alert
    if (state.timeouts[id]) {
      clearTimeout(state.timeouts[id]);
    }
    
    dispatch({
      type: 'REMOVE_ALERT',
      payload: id
    });
  };

  // Clear all alerts
  const clearAllAlerts = () => {
    // Clear all timeouts
    Object.values(state.timeouts).forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    
    dispatch({
      type: 'CLEAR_ALL_ALERTS'
    });
  };

  return (
    <AlertContext.Provider value={{ 
      alerts: state.alerts, 
      setAlert, 
      removeAlert,
      clearAllAlerts
    }}>
      {children}
    </AlertContext.Provider>
  );
};

// Custom hook
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export default AlertContext;