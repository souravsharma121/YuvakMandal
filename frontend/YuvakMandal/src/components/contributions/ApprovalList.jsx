import React, { useEffect, useState } from 'react';
import { useContribution } from '../../context/ContributionContext';
import { useAuth } from '../../context/AuthContext';

const ApprovalList = () => {
  const { contributions, loading, getContributions, updateContributionStatus } = useContribution();
  const { user } = useAuth();
  const [filter, setFilter] = useState({
    status: 'Pending'
  });
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [processingId, setProcessingId] = useState(null);
  
  useEffect(() => {
    getContributions();
  }, []);
  
  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Filter contributions based on status
  const filteredContributions = contributions.filter(contribution => {
    return filter.status === '' || contribution.status === filter.status;
  });
  
  const openModal = (contribution, action) => {
    setSelectedContribution(contribution);
    setActionType(action);
    setNotes('');
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContribution(null);
    setActionType('');
    setNotes('');
  };
  
  const handleSubmit = async () => {
    if (!selectedContribution) return;
    
    setProcessingId(selectedContribution._id);
    const success = await updateContributionStatus(
      selectedContribution._id,
      actionType,
      notes
    );
    
    if (success) {
      closeModal();
    }
    
    setProcessingId(null);
  };
  
  // Show loading state
  if (loading && contributions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Check if user is authorized
  if (user && user.role !== 'Admin' && user.role !== 'Treasurer') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Contribution Approval</h2>
        <div className="text-center py-8 text-red-500">
          You are not authorized to access this page.
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Contribution Approval</h2>
      
      {/* Status filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status-filter">
          Filter by Status
        </label>
        <select
          id="status-filter"
          name="status"
          value={filter.status}
          onChange={handleFilterChange}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
      
      {/* Contributions List */}
      {filteredContributions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No contributions found with the selected status.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month/Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContributions.map((contribution) => (
                <tr key={contribution._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contribution.user?.name || 'User'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contribution.month} {contribution.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{contribution.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(contribution.paymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${contribution.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          contribution.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}
                    >
                      {contribution.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {contribution.status === 'Pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(contribution, 'Approved')}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                          disabled={processingId === contribution._id}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openModal(contribution, 'Rejected')}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                          disabled={processingId === contribution._id}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        {contribution.approvedBy ? `By: ${contribution.approvedBy.name}` : 'Processed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Approval/Rejection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {actionType === 'Approved' ? 'Approve Contribution' : 'Reject Contribution'}
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-700">
                <span className="font-medium">Member:</span> {selectedContribution.user?.name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Month/Year:</span> {selectedContribution.month} {selectedContribution.year}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Amount:</span> ₹{selectedContribution.amount}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="notes">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                  actionType === 'Approved'
                    ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500 text-white'
                    : 'bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white'
                }`}
                disabled={processingId === selectedContribution._id}
              >
                {processingId === selectedContribution._id ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  actionType === 'Approved' ? 'Confirm Approval' : 'Confirm Rejection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalList;