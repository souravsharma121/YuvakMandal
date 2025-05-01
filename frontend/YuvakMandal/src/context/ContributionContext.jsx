import React, { createContext, useReducer, useContext } from 'react';
import axios from 'axios';
import { useAlert } from './AlertContext';
const baseURL = import.meta.env.VITE_API_URL  

// Create context
const ContributionContext = createContext();

// Initial state
const initialState = {
  contributions: [],
  userContributions: [],
  monthlyContributions: [],
  loading: true,
  error: null
};

// Reducer
const contributionReducer = (state, action) => {
  switch (action.type) {
    case 'GET_CONTRIBUTIONS':
      return {
        ...state,
        contributions: action.payload,
        loading: false
      };
    case 'GET_USER_CONTRIBUTIONS':
      return {
        ...state,
        userContributions: action.payload,
        loading: false
      };
    case 'GET_MONTHLY_CONTRIBUTIONS':
      return {
        ...state,
        monthlyContributions: action.payload,
        loading: false
      };
    case 'ADD_CONTRIBUTION':
      return {
        ...state,
        contributions: [action.payload, ...state.contributions],
        userContributions: [action.payload, ...state.userContributions],
        loading: false
      };
    case 'UPDATE_CONTRIBUTION_STATUS':
      return {
        ...state,
        contributions: state.contributions.map(contribution =>
          contribution._id === action.payload._id ? action.payload : contribution
        ),
        loading: false
      };
    case 'CONTRIBUTION_ERROR':
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
export const ContributionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(contributionReducer, initialState);
  const { setAlert } = useAlert();

  // Get all contributions
  const getContributions = async () => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      const res = await axios.get(`${baseURL}/api/contributions`);
      dispatch({
        type: 'GET_CONTRIBUTIONS',
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: 'CONTRIBUTION_ERROR',
        payload: err.response?.data?.message || 'Failed to fetch contributions'
      });
      setAlert(err.response?.data?.message || 'Failed to fetch contributions', 'danger');
    }
  };

  // Get contributions by user
  const getUserContributions = async (userId) => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      const res = await axios.get(`${baseURL}/api/contributions/user/${userId}`);
      dispatch({
        type: 'GET_USER_CONTRIBUTIONS',
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: 'CONTRIBUTION_ERROR',
        payload: err.response?.data?.message || 'Failed to fetch user contributions'
      });
      setAlert(err.response?.data?.message || 'Failed to fetch user contributions', 'danger');
    }
  };

  // Get contributions by month and year
  const getMonthlyContributions = async (month, year) => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      const res = await axios.get(`${baseURL}/api/contributions/month/${month}/year/${year}`);
      dispatch({
        type: 'GET_MONTHLY_CONTRIBUTIONS',
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: 'CONTRIBUTION_ERROR',
        payload: err.response?.data?.message || 'Failed to fetch monthly contributions'
      });
      setAlert(err.response?.data?.message || 'Failed to fetch monthly contributions', 'danger');
    }
  };

  // Add contribution
  const addContribution = async (contributionData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    dispatch({ type: 'SET_LOADING' });
    
    try {
      const res = await axios.post(`${baseURL}/api/contributions`, contributionData, config);
      dispatch({
        type: 'ADD_CONTRIBUTION',
        payload: res.data
      });
      setAlert('Contribution submitted successfully', 'success');
      return true;
    } catch (err) {
      dispatch({
        type: 'CONTRIBUTION_ERROR',
        payload: err.response?.data?.message || 'Failed to submit contribution'
      });
      setAlert(err.response?.data?.message || 'Failed to submit contribution', 'danger');
      return false;
    }
  };

  // Add contribution as admin/treasurer for another user
const addMemberContribution = async (contributionData) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  dispatch({ type: 'SET_LOADING' });
  
  try {
    const res = await axios.post(`${baseURL}/api/contributions/admin-add`, contributionData, config);
    dispatch({
      type: 'ADD_CONTRIBUTION',
      payload: res.data
    });
    setAlert('Contribution added successfully', 'success');
    return true;
  } catch (err) {
    dispatch({
      type: 'CONTRIBUTION_ERROR',
      payload: err.response?.data?.message || 'Failed to add contribution'
    });
    setAlert(err.response?.data?.message || 'Failed to add contribution', 'danger');
    return false;
  }
};

  // Update contribution status
  const updateContributionStatus = async (id, status, notes) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    dispatch({ type: 'SET_LOADING' });
    
    try {
      const res = await axios.put(`${baseURL}/api/contributions/${id}/status`, { status, notes }, config);
      dispatch({
        type: 'UPDATE_CONTRIBUTION_STATUS',
        payload: res.data
      });
      setAlert(`Contribution ${status.toLowerCase()} successfully`, 'success');
      return true;
    } catch (err) {
      dispatch({
        type: 'CONTRIBUTION_ERROR',
        payload: err.response?.data?.message || 'Failed to update contribution status'
      });
      setAlert(err.response?.data?.message || 'Failed to update contribution status', 'danger');
      return false;
    }
  };

  return (
    <ContributionContext.Provider
      value={{
        contributions: state.contributions,
        userContributions: state.userContributions,
        monthlyContributions: state.monthlyContributions,
        loading: state.loading,
        error: state.error,
        getContributions,
        getUserContributions,
        getMonthlyContributions,
        addContribution,
        updateContributionStatus,
        addMemberContribution
      }}
    >
      {children}
    </ContributionContext.Provider>
  );
};

// Custom hook
export const useContribution = () => {
  const context = useContext(ContributionContext);
  if (context === undefined) {
    throw new Error('useContribution must be used within a ContributionProvider');
  }
  return context;
};

export default ContributionContext;