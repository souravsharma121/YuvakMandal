import { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
const baseURL = import.meta.env.VITE_API_URL  

const EventContext = createContext();

const INITIAL_STATE = {
  events: [],
  currentEvent: null,
  loading: false,
  error: null,
  liveScore: null,
  socket: null,
  pagination: {
    totalPages: 1,
    currentPage: 1,
    total: 0
  }
};

const eventReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_EVENTS':
      return {
        ...state,
        events: action.payload.events,
        pagination: {
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          total: action.payload.total
        },
        loading: false,
        error: null
      };
    case 'SET_CURRENT_EVENT':
      return {
        ...state,
        currentEvent: action.payload,
        loading: false,
        error: null
      };
    case 'ADD_EVENT':
      return {
        ...state,
        events: [action.payload, ...state.events],
        loading: false,
        error: null
      };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event =>
          event._id === action.payload._id ? action.payload : event
        ),
        currentEvent: state.currentEvent?._id === action.payload._id ? action.payload : state.currentEvent,
        loading: false,
        error: null
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event._id !== action.payload),
        currentEvent: state.currentEvent?._id === action.payload ? null : state.currentEvent,
        loading: false,
        error: null
      };
    case 'SET_LIVE_SCORE':
      return {
        ...state,
        liveScore: action.payload
      };
    case 'UPDATE_LIVE_SCORE':
      return {
        ...state,
        liveScore: {
          ...state.liveScore,
          ...action.payload
        },
        currentEvent: state.currentEvent ? {
          ...state.currentEvent,
          teams: state.currentEvent.teams.map(team =>
            team._id === action.payload.teamId
              ? { ...team, score: action.payload.teamScore }
              : team
          ),
          liveScore: {
            ...state.currentEvent.liveScore,
            ...action.payload.liveScore
          }
        } : null
      };
    case 'SET_SOCKET':
      return {
        ...state,
        socket: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
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

export const EventProvider = ({ children }) => {
  const [state, dispatch] = useReducer(eventReducer, INITIAL_STATE);

  // Initialize socket connection
  const initializeSocket = () => {
    if (!state.socket) {
      const socket = io(baseURL || 'http://localhost:5000');
      dispatch({ type: 'SET_SOCKET', payload: socket });
      return socket;
    }
    return state.socket;
  };

  // Get all events
  const getEvents = async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await axios.get(`${baseURL}/api/events?${queryParams.toString()}`);
      dispatch({ type: 'SET_EVENTS', payload: response.data });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.msg || 'Error fetching events' 
      });
    }
  };

  // Get single event
  const getEvent = async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await axios.get(`${baseURL}/api/events/${id}`);
      dispatch({ type: 'SET_CURRENT_EVENT', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.msg || 'Error fetching event' 
      });
      return null;
    }
  };

  // Create event
  const createEvent = async (eventData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const formData = new FormData();
      
      Object.keys(eventData).forEach(key => {
        if (eventData[key] !== null && eventData[key] !== undefined) {
          formData.append(key, eventData[key]);
        }
      });

      const response = await axios.post(`${baseURL}/api/events`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      dispatch({ type: 'ADD_EVENT', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.msg || 'Error creating event' 
      });
      throw error;
    }
  };

  // Update event
  const updateEvent = async (id, eventData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const formData = new FormData();
      
      Object.keys(eventData).forEach(key => {
        if (eventData[key] !== null && eventData[key] !== undefined) {
          formData.append(key, eventData[key]);
        }
      });

      const response = await axios.put(`${baseURL}/api/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      dispatch({ type: 'UPDATE_EVENT', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.msg || 'Error updating event' 
      });
      throw error;
    }
  };

  // Delete event
  const deleteEvent = async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await axios.delete(`${baseURL}/api/events/${id}`);
      dispatch({ type: 'DELETE_EVENT', payload: id });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.msg || 'Error deleting event' 
      });
      throw error;
    }
  };

  // Add team to event
  const addTeam = async (eventId, teamData) => {
    try {
      const response = await axios.post(`${baseURL}/api/events/${eventId}/teams`, teamData);
      dispatch({ type: 'UPDATE_EVENT', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.msg || 'Error adding team' 
      });
      throw error;
    }
  };

  // Update team
  const updateTeam = async (eventId, teamId, teamData) => {
    try {
      const response = await axios.put(`${baseURL}/api/events/${eventId}/teams/${teamId}`, teamData);
      dispatch({ type: 'UPDATE_EVENT', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.msg || 'Error updating team' 
      });
      throw error;
    }
  };

  // Delete team
  const deleteTeam = async (eventId, teamId) => {
    try {
      const response = await axios.delete(`${baseURL}/api/events/${eventId}/teams/${teamId}`);
      dispatch({ type: 'UPDATE_EVENT', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.msg || 'Error deleting team' 
      });
      throw error;
    }
  };

  // Update event status
  const updateEventStatus = async (eventId, status) => {
    try {
      const response = await axios.put(`${baseURL}/api/events/${eventId}/status`, { status });
      dispatch({ type: 'UPDATE_EVENT', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.msg || 'Error updating status' 
      });
      throw error;
    }
  };

  // Socket functions for live scoring
  const joinEventRoom = (eventId) => {
    const socket = initializeSocket();
    socket.emit('join-event', eventId);
  };

  const leaveEventRoom = (eventId) => {
    if (state.socket) {
      state.socket.emit('leave-event', eventId);
    }
  };

  const updateLiveScore = (scoreData) => {
    if (state.socket) {
      state.socket.emit('update-live-score', scoreData);
    }
  };

  const changeInnings = (eventId, inningsNumber) => {
    if (state.socket) {
      state.socket.emit('change-innings', { eventId, inningsNumber });
    }
  };

  const completeMatch = (eventId, winner, summary) => {
    if (state.socket) {
      state.socket.emit('complete-match', { eventId, winner, summary });
    }
  };

  const addCommentary = (eventId, commentary, over, ball) => {
    if (state.socket) {
      state.socket.emit('add-commentary', { eventId, commentary, over, ball });
    }
  };

  // Socket event listeners
  const setupSocketListeners = () => {
    const socket = initializeSocket();
    
    socket.on('score-updated', (data) => {
      dispatch({ type: 'UPDATE_LIVE_SCORE', payload: data });
    });

    socket.on('innings-changed', (data) => {
      dispatch({ type: 'SET_LIVE_SCORE', payload: data.liveScore });
    });

    socket.on('match-completed', (data) => {
      dispatch({ type: 'UPDATE_EVENT', payload: { 
        _id: data.eventId, 
        status: data.status,
        matchResult: data.matchResult 
      }});
    });

    socket.on('commentary-added', (data) => {
      // Handle commentary updates if needed
    });

    socket.on('error', (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    });

    socket.on('update-success', (data) => {
      // Handle success messages if needed
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Clean up socket connection
  const disconnectSocket = () => {
    if (state.socket) {
      state.socket.disconnect();
      dispatch({ type: 'SET_SOCKET', payload: null });
    }
  };

  const value = {
    ...state,
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    addTeam,
    updateTeam,
    deleteTeam,
    updateEventStatus,
    joinEventRoom,
    leaveEventRoom,
    updateLiveScore,
    changeInnings,
    completeMatch,
    addCommentary,
    setupSocketListeners,
    initializeSocket,
    clearError,
    disconnectSocket
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};