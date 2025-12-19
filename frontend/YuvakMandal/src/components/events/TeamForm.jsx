import React, { useState,useContext} from 'react';
import { useEvent } from '../../context/EventContext';
import AlertContext from '../../context/AlertContext';
import { 
  PlusIcon, 
  TrashIcon, 
  UserIcon, 
  PhoneIcon,
  IdentificationIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const TeamForm = ({ eventId, onSuccess, onCancel }) => {
  const { addTeam, loading } = useEvent();
  const { setAlert } = useContext(AlertContext);

  const [formData, setFormData] = useState({
    teamName: '',
    captain: '',
    players: [
      { name: '', age: '', role: '', contact: '' },
      { name: '', age: '', role: '', contact: '' }
    ]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlayerChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      players: prev.players.map((player, i) => 
        i === index ? { ...player, [field]: value } : player
      )
    }));
  };

  const addPlayer = () => {
    setFormData(prev => ({
      ...prev,
      players: [
        ...prev.players,
        { name: '', age: '', role: '', contact: '' }
      ]
    }));
  };

  const removePlayer = (index) => {
    if (formData.players.length > 2) {
      setFormData(prev => ({
        ...prev,
        players: prev.players.filter((_, i) => i !== index)
      }));
    } else {
      setAlert('A team must have at least 2 players', 'error');
    }
  };

  const setCaptain = (playerIndex) => {
    const selectedPlayer = formData.players[playerIndex];
    if (selectedPlayer.name.trim()) {
      setFormData(prev => ({
        ...prev,
        captain: selectedPlayer.name
      }));
    }
  };

  const validateForm = () => {
    const errors = [];

    // Team name validation
    if (!formData.teamName.trim()) {
      errors.push('Team name is required');
    }

    // Captain validation
    if (!formData.captain.trim()) {
      errors.push('Captain must be selected');
    }

    // Players validation
    const validPlayers = formData.players.filter(player => 
      player.name.trim() && player.age && player.role.trim() && player.contact.trim()
    );

    if (validPlayers.length < 2) {
      errors.push('At least 2 players with complete information are required');
    }

    // Age validation
    const invalidAges = formData.players.filter(player => 
      player.age && (parseInt(player.age) < 10 || parseInt(player.age) > 60)
    );

    if (invalidAges.length > 0) {
      errors.push('Player ages must be between 10 and 60 years');
    }

    // Contact validation (basic phone number check)
    const invalidContacts = formData.players.filter(player => 
      player.contact && !/^[6-9]\d{9}$/.test(player.contact.replace(/\D/g, '').slice(-10))
    );

    if (invalidContacts.length > 0) {
      errors.push('Please enter valid 10-digit mobile numbers');
    }

    // Check if captain is in the players list
    const captainInPlayers = validPlayers.some(player => 
      player.name.toLowerCase().trim() === formData.captain.toLowerCase().trim()
    );

    if (!captainInPlayers) {
      errors.push('Captain must be one of the registered players');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const errors = validateForm();
      if (errors.length > 0) {
        setAlert(errors.join('. '), 'error');
        setIsSubmitting(false);
        return;
      }

      // Filter out incomplete players
      const validPlayers = formData.players.filter(player => 
        player.name.trim() && player.age && player.role.trim() && player.contact.trim()
      );

      const teamData = {
        teamName: formData.teamName.trim(),
        captain: formData.captain.trim(),
        players: validPlayers.map(player => ({
          name: player.name.trim(),
          age: parseInt(player.age),
          role: player.role.trim(),
          contact: player.contact.trim()
        }))
      };

      await addTeam(eventId, teamData);
      setAlert('Team registered successfully!', 'success');
      onSuccess();
    } catch (error) {
      setAlert(error.response?.data?.msg || 'Error registering team', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonRoles = [
    'Batsman',
    'Bowler',
    'All-rounder',
    'Wicket-keeper',
    'Captain',
    'Player',
    'Striker',
    'Defender',
    'Goalkeeper',
    'Midfielder',
    'Forward'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Register Your Team</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Team Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
          <div>
            <label htmlFor="teamName" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <IdentificationIcon className="w-4 h-4 mr-2" />
              Team Name *
            </label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              value={formData.teamName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your team name"
              required
            />
          </div>

          <div>
            <label htmlFor="captain" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <StarIcon className="w-4 h-4 mr-2" />
              Captain *
            </label>
            <input
              type="text"
              id="captain"
              name="captain"
              value={formData.captain}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Captain's name (must match player below)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The captain must be one of the players listed below
            </p>
          </div>
        </div>

        {/* Players Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Players ({formData.players.length})
            </h3>
            <button
              type="button"
              onClick={addPlayer}
              className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Player
            </button>
          </div>

          <div className="space-y-4">
            {formData.players.map((player, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">Player {index + 1}</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCaptain(index)}
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded hover:bg-yellow-200 transition-colors"
                      disabled={!player.name.trim()}
                    >
                      Make Captain
                    </button>
                    {formData.players.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <UserIcon className="w-3 h-3 mr-1" />
                      Name *
                    </label>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Player name"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      value={player.age}
                      onChange={(e) => handlePlayerChange(index, 'age', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Age"
                      min="10"
                      max="60"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      Role/Position *
                    </label>
                    <select
                      value={player.role}
                      onChange={(e) => handlePlayerChange(index, 'role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    >
                      <option value="">Select Role</option>
                      {commonRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    {player.role === 'Other' && (
                      <input
                        type="text"
                        onChange={(e) => handlePlayerChange(index, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mt-2"
                        placeholder="Specify role"
                      />
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <PhoneIcon className="w-3 h-3 mr-1" />
                      Contact *
                    </label>
                    <input
                      type="tel"
                      value={player.contact}
                      onChange={(e) => handlePlayerChange(index, 'contact', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Mobile number"
                      required
                    />
                  </div>
                </div>

                {/* Captain indicator */}
                {formData.captain && player.name.toLowerCase().trim() === formData.captain.toLowerCase().trim() && (
                  <div className="mt-3 inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    <StarIcon className="w-3 h-3 mr-1" />
                    Team Captain
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Registration Guidelines:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Minimum 2 players required, maximum 15 players allowed</li>
              <li>• All players must be between 10-60 years of age</li>
              <li>• Captain must be one of the registered players</li>
              <li>• Provide valid mobile numbers for all players</li>
              <li>• Team name must be unique for this event</li>
            </ul>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Registering...
              </div>
            ) : (
              'Register Team'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamForm;