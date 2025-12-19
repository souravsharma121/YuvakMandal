import React, { useState, useEffect,useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  CurrencyRupeeIcon,
  PlusIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';

const EventList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setAlert } = useContext(AlertContext);
  const {
    events,
    loading,
    error,
    pagination,
    getEvents,
    deleteEvent,
    updateEventStatus,
    clearError
  } = useEvent();

  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    page: 1
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    getEvents(filters);
  }, [filters]);

  useEffect(() => {
    if (error) {
      setAlert(error, 'error');
      clearError();
    }
  }, [error]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEvent(eventToDelete._id);
      setAlert('Event deleted successfully', 'success');
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (error) {
      setAlert(error.response?.data?.msg || 'Error deleting event', 'error');
    }
  };

  const handleStatusUpdate = async (eventId, newStatus) => {
    try {
      await updateEventStatus(eventId, newStatus);
      setAlert(`Event status updated to ${newStatus}`, 'success');
    } catch (error) {
      setAlert(error.response?.data?.msg || 'Error updating status', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'past':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      cricket: '🏏',
      volleyball: '🏐',
      football: '⚽',
      kabaddi: '🤼',
      'kho-kho': '🏃',
      badminton: '🏸',
      'table-tennis': '🏓',
      other: '🏆'
    };
    return iconMap[type] || '🏆';
  };

  const canCreateEvent = user && user.role !== 'Member';
  const canManageEvent = (event) => {
    return user && (user.role === 'Admin' || event.createdBy._id === user.id);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Events</h1>
        {canCreateEvent && (
          <Link
            to="/events/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Event
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="new">New Events</option>
            <option value="ongoing">Ongoing Events</option>
            <option value="past">Past Events</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="cricket">Cricket</option>
            <option value="volleyball">Volleyball</option>
            <option value="football">Football</option>
            <option value="kabaddi">Kabaddi</option>
            <option value="kho-kho">Kho-Kho</option>
            <option value="badminton">Badminton</option>
            <option value="table-tennis">Table Tennis</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
          <p className="text-gray-500 mb-6">
            {canCreateEvent 
              ? "Be the first to create an exciting event for your community!"
              : "No events match your current filters. Try adjusting them above."
            }
          </p>
          {canCreateEvent && (
            <Link
              to="/events/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create First Event
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              {/* Event Image */}
              {event.backgroundImage && (
                <div className="h-48 rounded-t-lg bg-cover bg-center"
                     style={{ backgroundImage: `url(${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}${event.backgroundImage})` }}>
                  <div className="h-full w-full bg-black bg-opacity-40 rounded-t-lg flex items-end p-4">
                    <div className="text-white">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Event Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {event.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="text-lg mr-2">{getTypeIcon(event.type)}</span>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </div>
                  </div>
                  {!event.backgroundImage && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  )}
                </div>

                {/* Event Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {formatDate(event.date)} at {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CurrencyRupeeIcon className="w-4 h-4 mr-2" />
                    Entry Fee: ₹{event.entryFee}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Teams: {event.teams.length}/{event.maxTeams}
                  </div>
                </div>

                {/* Instructions Preview */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {event.instructions}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/events/${event._id}`}
                    className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View
                  </Link>

                  {event.status === 'ongoing' && (
                    <Link
                      to={`/events/${event._id}/live`}
                      className="flex items-center px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <PlayIcon className="w-4 h-4 mr-1" />
                      Live
                    </Link>
                  )}

                  {canManageEvent(event) && (
                    <>
                      <Link
                        to={`/events/${event._id}/edit`}
                        className="flex items-center px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Edit
                      </Link>

                      {event.status === 'new' && (
                        <button
                          onClick={() => handleStatusUpdate(event._id, 'ongoing')}
                          className="flex items-center px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        >
                          <PlayIcon className="w-4 h-4 mr-1" />
                          Start
                        </button>
                      )}

                      {event.status === 'ongoing' && (
                        <button
                          onClick={() => handleStatusUpdate(event._id, 'past')}
                          className="flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                        >
                          <StopIcon className="w-4 h-4 mr-1" />
                          End
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteClick(event)}
                        className="flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </>
                  )}
                </div>

                {/* Created By */}
                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  Created by {event.createdBy.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {filters.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page === pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Event</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{eventToDelete?.name}"? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 px-4 py-2 bg-white text-gray-500 text-base font-medium rounded-md w-full shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;



