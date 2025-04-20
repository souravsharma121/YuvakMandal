// src/components/dashboard/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import NotificationContext from '../../context/NotificationContext';
import ContributionContext from '../../context/ContributionContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, getAllUsers } = useContext(AuthContext);
  const { notifications, getNotifications } = useContext(NotificationContext);
  const { contributions, getContributions } = useContext(ContributionContext);
  const [isLoading, setIsLoading] = useState(true);
  
  const [teamMembers, setTeamMembers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setTeamMembers(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
  
    fetchUsers();
    // eslint-disable-next-line
  }, []);  

  
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([getNotifications(), getContributions()]);
      setIsLoading(false);
    };
    
    fetchData();
    // eslint-disable-next-line
  }, []);
  
  // Get pending contributions (for treasurer)
  const pendingContributions = contributions.filter(
    contribution => contribution.status === 'Pending'
  );
  
  // Get user's contribution status for current month
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  
  const getCurrentMonthContribution = () => {
    if (!contributions || !user) return null;
    
    return contributions.find(
      contribution => 
        contribution.month === currentMonth && 
        contribution.year === currentYear &&
        (user.role === 'Admin' || 
         (contribution.user && 
          ((typeof contribution.user === 'string' && contribution.user === user._id) || 
           (typeof contribution.user === 'object' && contribution.user._id === user._id))))
    );
  };
  
  const currentMonthContribution = getCurrentMonthContribution();
  
  const contributionStatus = currentMonthContribution
    ? currentMonthContribution.status
    : 'Not Submitted';
  
  
  if (isLoading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user && user.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Current Month Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Month Status</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">{currentMonth} {currentYear}</p>
              <p className="mt-2 font-medium">
                Status: {' '}
                <span className={`
                  ${contributionStatus === 'Approved' && 'text-green-600'}
                  ${contributionStatus === 'Pending' && 'text-yellow-600'}
                  ${contributionStatus === 'Rejected' && 'text-red-600'}
                  ${contributionStatus === 'Not Submitted' && 'text-gray-600'}
                `}>
                  {contributionStatus}
                </span>
              </p>
              {currentMonthContribution && (
                <p className="mt-1 text-gray-600">
                  Amount: ₹{currentMonthContribution.amount}
                </p>
              )}
            </div>
            {contributionStatus === 'Not Submitted' && (
              <Link
                to="/contributions/new" 
                className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
              >
                Submit
              </Link>
            )}
          </div>
        </div>
        
        {/* Recent Notifications */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
          {notifications && notifications.length > 0 ? (
            <ul className="space-y-3">
              {notifications.slice(0, 3).map(notification => (
                <li key={notification._id} className="border-b pb-2">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-gray-600">
                    By: {notification.createdBy && notification.createdBy.name} 
                    ({notification.createdBy && notification.createdBy.role})
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No recent notifications</p>
          )}
          <Link
            to="/notifications" 
            className="block mt-4 text-indigo-600 hover:text-indigo-800"
          >
            View all notifications
          </Link>
        </div>
        
        {/* Treasurer Dashboard */}
        {(user && (user.role === 'Treasurer' || user.role === 'Admin')) && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Treasurer Dashboard</h2>
            <p className="mb-2">
              <span className="font-medium">Pending Approvals:</span> {pendingContributions.length}
            </p>
            {pendingContributions.length > 0 && (
              <Link
                to="/contributions/approval" 
                className="block mt-4 text-indigo-600 hover:text-indigo-800"
              >
                View pending approvals
              </Link>
            )}
          </div>
        )}
      </div>
      
      {/* Yuvak Mandal Team Members Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Yuvak Mandal Members</h2>
          {(user && (user.role === 'Admin')) && (
            <Link
              to="/admin/users" 
              className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
            >
              Manage Members
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg">
              <div className="h-48 overflow-hidden">
                {member?.image.includes("https://res") ? <img 
                  src={member?.image} 
                  className="w-full h-full object-cover"
                /> : 
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-6xl font-light">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-indigo-700">{member.name}</h3>
                <div className="mt-2">
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium mr-2">Role:</span>
                    <span>{member.role}</span>
                  </div>
                  <div className="flex items-center text-gray-700 mt-1">
                    <span className="font-medium mr-2">Village:</span>
                    <span>{member.villageName}</span>
                  </div>
                  <div className="flex items-center text-gray-700 mt-1">
                    <span className="font-medium mr-2">Contact:</span>
                    <span>{member.mobileNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;