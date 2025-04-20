import React, { createContext, useContext, useReducer } from 'react';

// Create context
const AlertContext = createContext();

// Initial state
const initialState = {
  alerts: []
};

// Generate unique ID
const generateID = () => Math.random().toString(36).substr(2, 9);

// Reducer
const alertReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ALERT':
      return {
        ...state,
        alerts: [...state.alerts, { ...action.payload, id: generateID() }]
      };
    case 'REMOVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload)
      };
    default:
      return state;
  }
};

// Provider component
export const AlertProvider = ({ children }) => {
  const [state, dispatch] = useReducer(alertReducer, initialState);

  // Set alert
  const setAlert = (message, type = 'info', timeout = 5000) => {
    const id = generateID();
    dispatch({
      type: 'SET_ALERT',
      payload: { message, type, id }
    });

    // Auto dismiss after timeout
    setTimeout(() => {
      dispatch({
        type: 'REMOVE_ALERT',
        payload: id
      });
    }, timeout);
    
    return id;
  };

  // Remove alert
  const removeAlert = (id) => {
    dispatch({
      type: 'REMOVE_ALERT',
      payload: id
    });
  };

  return (
    <AlertContext.Provider value={{ alerts: state.alerts, setAlert, removeAlert }}>
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