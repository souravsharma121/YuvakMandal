import React, { useState, useEffect,useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import { downloadEventFlyer, downloadTeamList } from '../../utils/pdfGenerator';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  CurrencyRupeeIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  StopIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import TeamForm from './TeamForm';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setAlert } = useContext(AlertContext);
  const {
    currentEvent,
    loading,
    error,
    getEvent,
    deleteEvent,
    updateEventStatus,
    deleteTeam,
    clearError
  } = useEvent();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (id) {
      getEvent(id);
    }
  }, [id]);

  useEffect(() => {
    if (error) {
      setAlert(error, 'error');
      clearError();
    }
  }, [error]);

  const handleDeleteEvent = async () => {
    try {
      await deleteEvent(currentEvent._id);
      setAlert('Event deleted successfully', 'success');
      navigate('/events');
    } catch (error) {
      setAlert(error.response?.data?.msg || 'Error deleting event', 'error');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateEventStatus(currentEvent._id, newStatus);
      setAlert(`Event status updated to ${newStatus}`, 'success');
    } catch (error) {
      setAlert(error.response?.data?.msg || 'Error updating status', 'error');
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await deleteTeam(currentEvent._id, teamToDelete._id);
      setAlert('Team removed successfully', 'success');
      setShowDeleteModal(false);
      setTeamToDelete(null);
    } catch (error) {
      setAlert(error.response?.data?.msg || 'Error removing team', 'error');
    }
  };

  const handleDownloadFlyer = async () => {
    if (!currentEvent) return;
    
    setGeneratingPDF(true);
    try {
      await downloadEventFlyer(currentEvent);
      setAlert('Event flyer downloaded successfully', 'success');
    } catch (error) {
      setAlert('Error generating flyer PDF', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDownloadTeamList = () => {
    if (!currentEvent || currentEvent.teams.length === 0) {
      setAlert('No teams registered yet', 'info');
      return;
    }
    
    try {
      downloadTeamList(currentEvent);
      setAlert('Team list downloaded successfully', 'success');
    } catch (error) {
      setAlert('Error generating team list PDF', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const canManageEvent = currentEvent && user && (user.role === 'Admin' || currentEvent.createdBy._id === user.id);
  const canJoinTeam = currentEvent && user && currentEvent.status === 'new' && currentEvent.teams.length < currentEvent.maxTeams;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h3>
        <p className="text-gray-500 mb-6">The event you're looking for doesn't exist.</p>
        <Link
          to="/events"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div className="mb-4 lg:mb-0">
          <div className="flex items-center mb-2">
            <button
              onClick={() => navigate('/events')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ←
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{currentEvent.name}</h1>
            <span className="text-2xl ml-3">{getTypeIcon(currentEvent.type)}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentEvent.status)}`}>
              {currentEvent.status.charAt(0).toUpperCase() + currentEvent.status.slice(1)}
            </span>
            <span className="text-sm text-gray-500">
              Created by {currentEvent.createdBy.name}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadFlyer}
            disabled={generatingPDF}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            {generatingPDF ? 'Generating...' : 'Download Flyer'}
          </button>

          {currentEvent.teams.length > 0 && (
            <button
              onClick={handleDownloadTeamList}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Team List
            </button>
          )}

          {currentEvent.status === 'ongoing' && (
            <Link
              to={`/events/${currentEvent._id}/live`}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              Live Score
            </Link>
          )}

          {canManageEvent && (
            <>
              <Link
                to={`/events/${currentEvent._id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <PencilIcon className="w-5 h-5 mr-2" />
                Edit
              </Link>

              {currentEvent.status === 'new' && (
                <button
                  onClick={() => handleStatusUpdate('ongoing')}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Start Event
                </button>
              )}

              {currentEvent.status === 'ongoing' && (
                <button
                  onClick={() => handleStatusUpdate('past')}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <StopIcon className="w-5 h-5 mr-2" />
                  End Event
                </button>
              )}

              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="w-5 h-5 mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          {currentEvent.backgroundImage && (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <img
                src={`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}${currentEvent.backgroundImage}`}
                alt={currentEvent.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Event Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <TagIcon className="w-5 h-5 mr-3" />
                <span className="font-medium">Type:</span>
                <span className="ml-2">{currentEvent.type.charAt(0).toUpperCase() + currentEvent.type.slice(1)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="w-5 h-5 mr-3" />
                <span className="font-medium">Date:</span>
                <span className="ml-2">{formatDate(currentEvent.date)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <ClockIcon className="w-5 h-5 mr-3" />
                <span className="font-medium">Time:</span>
                <span className="ml-2">{currentEvent.time}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="w-5 h-5 mr-3" />
                <span className="font-medium">Location:</span>
                <span className="ml-2">{currentEvent.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <CurrencyRupeeIcon className="w-5 h-5 mr-3" />
                <span className="font-medium">Entry Fee:</span>
                <span className="ml-2">₹{currentEvent.entryFee}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <UsersIcon className="w-5 h-5 mr-3" />
                <span className="font-medium">Teams:</span>
                <span className="ml-2">{currentEvent.teams.length}/{currentEvent.maxTeams}</span>
              </div>
              {currentEvent.type === 'cricket' && (
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="w-5 h-5 mr-3" />
                  <span className="font-medium">Overs:</span>
                  <span className="ml-2">{currentEvent.liveScore?.totalOvers || 20}</span>
                </div>
              )}
              {currentEvent.registrationDeadline && (
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="w-5 h-5 mr-3" />
                  <span className="font-medium">Registration Deadline:</span>
                  <span className="ml-2">{formatDate(currentEvent.registrationDeadline)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions & Rules</h2>
            <div className="prose max-w-none text-gray-600">
              {currentEvent.instructions.split('\n').map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Teams Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Registered Teams ({currentEvent.teams.length}/{currentEvent.maxTeams})
              </h2>
              {canJoinTeam && (
                <button
                  onClick={() => setShowAddTeamForm(true)}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Team
                </button>
              )}
            </div>

            {currentEvent.teams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No teams registered yet</p>
                {canJoinTeam && (
                  <p className="text-sm mt-2">Be the first to register your team!</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {currentEvent.teams.map((team) => (
                  <div key={team._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{team.teamName}</h3>
                        <p className="text-sm text-gray-600">Captain: {team.captain}</p>
                        <p className="text-sm text-gray-500">{team.players.length} players</p>
                        
                        {/* Show score if event is ongoing or past */}
                        {(currentEvent.status === 'ongoing' || currentEvent.status === 'past') && team.score && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <span className="font-medium">Score: </span>
                            {currentEvent.type === 'cricket' ? (
                              `${team.score.runs}/${team.score.wickets} (${team.score.overs}.${team.score.balls})`
                            ) : (
                              `${team.score.runs} points`
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowTeamModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        
                        {canManageEvent && (
                          <button
                            onClick={() => {
                              setTeamToDelete(team);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Match Result (if event is completed) */}
          {currentEvent.status === 'past' && currentEvent.matchResult && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Match Result</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="font-bold text-green-800 text-lg mb-2">Winner</h3>
                  <p className="text-green-700 font-semibold">{currentEvent.matchResult.winner}</p>
                  {currentEvent.matchResult.summary && (
                    <p className="text-green-600 text-sm mt-2">{currentEvent.matchResult.summary}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team Details Modal */}
      {showTeamModal && selectedTeam && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedTeam.teamName}</h3>
              <button
                onClick={() => setShowTeamModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600"><strong>Captain:</strong> {selectedTeam.captain}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Players ({selectedTeam.players.length})</h4>
              <div className="space-y-2">
                {selectedTeam.players.map((player, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{player.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({player.age} years)</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{player.role}</div>
                      <div className="text-xs text-gray-500">{player.contact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                {teamToDelete ? 'Remove Team' : 'Delete Event'}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {teamToDelete 
                    ? `Are you sure you want to remove "${teamToDelete.teamName}"?`
                    : `Are you sure you want to delete "${currentEvent.name}"? This action cannot be undone.`
                  }
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={teamToDelete ? handleDeleteTeam : handleDeleteEvent}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  {teamToDelete ? 'Remove' : 'Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTeamToDelete(null);
                  }}
                  className="mt-3 px-4 py-2 bg-white text-gray-500 text-base font-medium rounded-md w-full shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Form Modal - Updated with proper form */}
      {showAddTeamForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 max-w-6xl">
            <TeamForm
              eventId={currentEvent._id}
              onSuccess={() => {
                setShowAddTeamForm(false);
                // Refresh event data to show new team
                getEvent(currentEvent._id);
              }}
              onCancel={() => setShowAddTeamForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;