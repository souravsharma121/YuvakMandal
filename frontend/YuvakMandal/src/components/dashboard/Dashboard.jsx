// src/components/dashboard/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import NotificationContext from '../../context/NotificationContext';
import ContributionContext from '../../context/ContributionContext';
import { Link } from 'react-router-dom';
import SkeletonLoader from '../loader/SkeletonLoader';
import splashLogo from "../../assets/splashlogo.png";
import { useTranslation } from 'react-i18next';
const Dashboard = () => {
  const { user, getAllUsers, logout } = useContext(AuthContext);
  const { notifications, getNotifications } = useContext(NotificationContext);
  const { contributions, getContributions } = useContext(ContributionContext);
  const [isLoading, setIsLoading] = useState(true);
  const {t} = useTranslation()
  const [teamMembers, setTeamMembers] = useState([]);
  const [coreTeam, setCoreTeam] = useState({
    pradhan: null,
    upPradhan: null,
    secretary: null,
    treasurer: null
  });
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setTeamMembers(users);
        
        // Extract core team members
        const pradhan = users.find(user => user.role === 'Pradhan') || null;
        const upPradhan = users.find(user => user.role === 'Up Pradhan') || null;
        const secretary = users.find(user => user.role === 'Secretary') || null;
        const treasurer = users.find(user => user.role === 'Treasurer') || null;
        
        setCoreTeam({
          pradhan,
          upPradhan,
          secretary,
          treasurer
        });
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
      setIsLoading(false);
    };
  
    fetchUsers();
    // eslint-disable-next-line
  }, []);  

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch data if user is not a guest
      if (user && !user.isGuest) {
        await Promise.all([getNotifications(), getContributions()]);
      } else {
        // For guest users, we can skip these data fetches
        // and just set loading to false
      }
    };
    
    fetchData();
    // eslint-disable-next-line
  }, [user]);
  
  // Get pending contributions (for treasurer)
  const pendingContributions = contributions?.filter(
    contribution => contribution.status === 'Pending'
  ) || [];
  
  // Get user's contribution status for current month
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  
  const getCurrentMonthContribution = () => {
    if (!contributions || !user || user.isGuest) return null;
    
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
    return (
      <div className="p-6">
        <SkeletonLoader type="text" size="lg" className="mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <SkeletonLoader type="dashboard-card" count={3} />
        </div>
        
        <div className="mt-10">
          <SkeletonLoader type="text" size="lg" className="mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <SkeletonLoader type="user-card" count={4} />
          </div>
        </div>
      </div>
    );
  }
  const leadershipRoles = [
    {
      key: "pradhan",
      title: "Pradhan",
      bgColor: "bg-indigo-600",
      titleBgColor: "bg-indigo-800",
      badgeBgColor: "bg-indigo-100",
      badgeTextColor: "text-indigo-800",
      iconColor: "text-indigo-600",
    },
    {
      key: "upPradhan",
      title: "Up Pradhan",
      bgColor: "bg-blue-600",
      titleBgColor: "bg-blue-800",
      badgeBgColor: "bg-blue-100",
      badgeTextColor: "text-blue-800",
      iconColor: "text-blue-600",
    },
    {
      key: "secretary",
      title: "Secretary",
      bgColor: "bg-green-600",
      titleBgColor: "bg-green-800",
      badgeBgColor: "bg-green-100",
      badgeTextColor: "text-green-800",
      iconColor: "text-green-600",
    },
    {
      key: "treasurer",
      title: "Treasurer",
      bgColor: "bg-amber-600",
      titleBgColor: "bg-amber-800",
      badgeBgColor: "bg-amber-100",
      badgeTextColor: "text-amber-800",
      iconColor: "text-amber-600",
    },
  ];
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-indigo-800">
        {user?.isGuest
        ? t('welcome.guest')
        : t('welcome.user', { name: user?.name })}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Guest Info Card - Only shown to guests */}
        {user && user.isGuest && (
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Guest Access</h2>
            <p className="text-gray-600 mb-4">
              You are currently using the application as a guest. 
              Some features are limited in guest mode.
            </p>
            <div className="flex space-x-2">
              <Link
                to="/login" 
                onClick={logout}
                className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors duration-300"
              >
                Login as Member
              </Link>
              <button
                onClick={() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors duration-300"
              >
                View Members
              </button>
            </div>
          </div>
        )}
        
        {/* Current Month Status - Not shown to guests */}
        {user && !user.isGuest && !(user?.role === "Admin") && (
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4 text-indigo-800">{t('currentStatus.title')}</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">{currentMonth} {currentYear}</p>
                <p className="mt-2 font-medium">
                  {t('currentStatus.status')}: {' '}
                  <span className={`
                    ${contributionStatus === 'Approved' && 'text-green-600 font-semibold'}
                    ${contributionStatus === 'Pending' && 'text-yellow-600 font-semibold'}
                    ${contributionStatus === 'Rejected' && 'text-red-600 font-semibold'}
                    ${contributionStatus === 'Not Submitted' && 'text-gray-600 font-semibold'}
                  `}>
                    {contributionStatus === 'Approved' && t('currentStatus.approved')}
                    {contributionStatus === 'Pending' && t('currentStatus.pending')}
                    {contributionStatus === 'Rejected' && t('currentStatus.rejected')}
                    {contributionStatus === 'Not Submitted' && t('currentStatus.notSubmitted')}
                  </span>
                </p>
                {currentMonthContribution && (
                  <p className="mt-1 text-gray-600">
                    {t('currentStatus.amount')}: ₹{currentMonthContribution.amount}
                  </p>
                )}
              </div>
              {contributionStatus === 'Not Submitted' && (
                <Link
                  to="/contributions/new"
                  className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors duration-300"
                >
                  {t('currentStatus.submit')}
                </Link>
              )}
            </div>
          </div>
        )}
        
        {/* Recent Notifications - Not shown to guests */}
        {user && !user.isGuest && (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4 text-indigo-800">{t('notificationsDashboard.recent')}</h2>
          {notifications && notifications.length > 0 ? (
            <ul className="space-y-3">
              {notifications.slice(0, 3).map(notification => (
                <li key={notification._id} className="border-b pb-2">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-gray-600">
                    {t('by')}: {notification.createdBy?.name} ({notification.createdBy?.role})
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">{t('notificationsDashboard.noRecent')}</p>
          )}
          <Link
            to="/notifications"
            className="block mt-4 text-indigo-600 hover:text-indigo-800 transition-colors duration-300"
          >
            {t('notificationsDashboard.viewAll')}
          </Link>
        </div>
      )}

      {user && !user.isGuest && (user.role === 'Treasurer' || user.role === 'Admin') && (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4 text-indigo-800">{t('treasurerDashboard.title')}</h2>
          <p className="mb-2">
            <span className="font-medium">{t('treasurerDashboard.pendingApprovals')}:</span> {pendingContributions.length}
          </p>
          {pendingContributions.length > 0 && (
            <Link
              to="/contributions/approval"
              className="block mt-4 text-indigo-600 hover:text-indigo-800 transition-colors duration-300"
            >
              {t('treasurerDashboard.viewPending')}
            </Link>
          )}
        </div>
      )}

      {user && user.isGuest && (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4 text-green-800">{t('guestInfo.title')}</h2>
          <p className="text-gray-600 mb-3">{t('guestInfo.description')}</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
            <li>{t('guestInfo.points.development')}</li>
            <li>{t('guestInfo.points.activities')}</li>
            <li>{t('guestInfo.points.youth')}</li>
            <li>{t('guestInfo.points.welfare')}</li>
          </ul>
          <button
            onClick={toggleApplyInfo}
            className="text-indigo-600 hover:text-indigo-800 transition-colors duration-300"
          >
            {t('guestInfo.learnMore')}
          </button>
        </div>
      )}
      </div>
      
      {/* Core Leadership Team */}
      <div className="mt-12 mb-16">
        <h2 className="text-2xl font-bold mb-8 text-indigo-800 text-center">
          Our Leadership Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Pradhan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="h-48 bg-indigo-600 relative">
              {coreTeam.pradhan?.image?.includes("https://res") ? (
                <img 
                  src={coreTeam.pradhan.image} 
                  alt={coreTeam.pradhan.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-7xl font-semibold">
                    {coreTeam.pradhan?.name?.charAt(0).toUpperCase() || "P"}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-indigo-800 bg-opacity-80 p-3">
                <h3 className="text-xl font-bold text-white text-center">
                  {coreTeam.pradhan?.name || "Pradhan"}
                </h3>
              </div>
            </div>
            <div className="p-4">
              <div className="bg-indigo-100 rounded-lg p-3 text-center mb-3">
                <span className="text-indigo-800 font-semibold text-lg">Pradhan</span>
              </div>
              <div className="text-gray-700 mt-3">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9c-1.512 1.512-3.956 1.512-5.468 0l-4.242-4.243c-1.512-1.512-1.512-3.956 0-5.468l4.243-4.243c1.512-1.512 3.956-1.512 5.468 0L18.9 7.657M9 11l3 3m0 0l3-3m-3 3V8"></path>
                  </svg>
                  <span>{coreTeam.pradhan?.villageName || "Village"}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>{coreTeam.pradhan?.mobileNumber || "Contact Number"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Up Pradhan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="h-48 bg-blue-600 relative">
              {coreTeam.upPradhan?.image?.includes("https://res") ? (
                <img 
                  src={coreTeam.upPradhan.image} 
                  alt={coreTeam.upPradhan.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-7xl font-semibold">
                    {coreTeam.upPradhan?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-blue-800 bg-opacity-80 p-3">
                <h3 className="text-xl font-bold text-white text-center">
                  {coreTeam.upPradhan?.name || "Up Pradhan"}
                </h3>
              </div>
            </div>
            <div className="p-4">
              <div className="bg-blue-100 rounded-lg p-3 text-center mb-3">
                <span className="text-blue-800 font-semibold text-lg">Up Pradhan</span>
              </div>
              <div className="text-gray-700 mt-3">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9c-1.512 1.512-3.956 1.512-5.468 0l-4.242-4.243c-1.512-1.512-1.512-3.956 0-5.468l4.243-4.243c1.512-1.512 3.956-1.512 5.468 0L18.9 7.657M9 11l3 3m0 0l3-3m-3 3V8"></path>
                  </svg>
                  <span>{coreTeam.upPradhan?.villageName || "Village"}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>{coreTeam.upPradhan?.mobileNumber || "Contact Number"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Secretary */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="h-48 bg-green-600 relative">
              {coreTeam.secretary?.image?.includes("https://res") ? (
                <img 
                  src={coreTeam.secretary.image} 
                  alt={coreTeam.secretary.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-7xl font-semibold">
                    {coreTeam.secretary?.name?.charAt(0).toUpperCase() || "S"}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-green-800 bg-opacity-80 p-3">
                <h3 className="text-xl font-bold text-white text-center">
                  {coreTeam.secretary?.name || "Secretary"}
                </h3>
              </div>
            </div>
            <div className="p-4">
              <div className="bg-green-100 rounded-lg p-3 text-center mb-3">
                <span className="text-green-800 font-semibold text-lg">Secretary</span>
              </div>
              <div className="text-gray-700 mt-3">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9c-1.512 1.512-3.956 1.512-5.468 0l-4.242-4.243c-1.512-1.512-1.512-3.956 0-5.468l4.243-4.243c1.512-1.512 3.956-1.512 5.468 0L18.9 7.657M9 11l3 3m0 0l3-3m-3 3V8"></path>
                  </svg>
                  <span>{coreTeam.secretary?.villageName || "Village"}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>{coreTeam.secretary?.mobileNumber || "Contact Number"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Treasurer */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="h-48 bg-amber-600 relative">
              {coreTeam.treasurer?.image?.includes("https://res") ? (
                <img 
                  src={coreTeam.treasurer.image} 
                  alt={coreTeam.treasurer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-7xl font-semibold">
                    {coreTeam.treasurer?.name?.charAt(0).toUpperCase() || "T"}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-amber-800 bg-opacity-80 p-3">
                <h3 className="text-xl font-bold text-white text-center">
                  {coreTeam.treasurer?.name || "Treasurer"}
                </h3>
              </div>
            </div>
            <div className="p-4">
              <div className="bg-amber-100 rounded-lg p-3 text-center mb-3">
                <span className="text-amber-800 font-semibold text-lg">Treasurer</span>
              </div>
              <div className="text-gray-700 mt-3">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9c-1.512 1.512-3.956 1.512-5.468 0l-4.242-4.243c-1.512-1.512-1.512-3.956 0-5.468l4.243-4.243c1.512-1.512 3.956-1.512 5.468 0L18.9 7.657M9 11l3 3m0 0l3-3m-3 3V8"></path>
                  </svg>
                  <span>{coreTeam.treasurer?.villageName || "Village"}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>{coreTeam.treasurer?.mobileNumber || "Contact Number"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* About Section with Logo */}
      <div className="mt-16 mb-16 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/5 flex items-center justify-center p-2">
            <img 
              src={splashLogo} 
              alt="Mandal Logo" 
              className="max-w-full object-contain rounded-lg"
            />
          </div>
          <div className="w-full md:w-3/5 p-8">
            <h2 className="text-3xl font-bold mb-6 text-indigo-800">About Our Mandal</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Jai Dev Balatika Shegal Yuvak Mandal Burahan is a community organization committed to fostering unity, 
              personal growth, and societal progress. Founded on the principles of service and community welfare, 
              our mandal has been at the forefront of various community initiatives.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Our vision is to create a society where youth are empowered to lead positive change, 
              cultural heritage is preserved, and community ties are strengthened through 
              collaborative efforts and mutual support.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start">
                <svg className="w-8 h-8 text-indigo-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-700">Community Service</h3>
                  <p className="text-gray-600">Organizing initiatives for societal welfare and community development</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-8 h-8 text-indigo-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-700">Cultural Preservation</h3>
                  <p className="text-gray-600">Celebrating and preserving our rich cultural heritage</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-8 h-8 text-indigo-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-700">Youth Development</h3>
                  <p className="text-gray-600">Empowering youth through skills development and leadership programs</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-8 h-8 text-indigo-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-700">Social Unity</h3>
                  <p className="text-gray-600">Building strong bonds within our community through collaboration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* All Members Section */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-indigo-800">All Mandal Members</h2>
          {user && user.role === 'Admin' && !user.isGuest && (
            <Link
              to="/admin/users" 
              className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Manage Members
            </Link>
          )}
        </div>
        
        {/* Members cards in horizontal scrolling layout */}
        <div className="overflow-x-auto pb-6">
          <div className="flex space-x-6 min-w-max">
            {teamMembers.map((member) => (
              <div 
                key={member.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden w-64 flex flex-col transition-all duration-300 hover:shadow-xl"
              >
                <div className="h-40 overflow-hidden relative">
                  {member?.image?.includes("https://res") ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-5xl font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                    <h3 className="text-lg font-bold text-white">{member.name}</h3>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="bg-indigo-100 text-center py-1 px-3 rounded-full mb-3 self-start">
                    <span className="text-indigo-800 font-medium">{member.role}</span>
                  </div>
                  <div className="text-gray-700 mt-auto">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9c-1.512 1.512-3.956 1.512-5.468 0l-4.242-4.243c-1.512-1.512-1.512-3.956 0-5.468l4.243-4.243c1.512-1.512 3.956-1.512 5.468 0L18.9 7.657M9 11l3 3m0 0l3-3m-3 3V8"></path>
                      </svg>
                      <span className="text-sm">{member.villageName}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <span className="text-sm">{member.mobileNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Alternative view for larger screens - grid layout */}
        <div className="hidden lg:block mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {teamMembers.map((member) => (
              <div 
                key={`grid-${member.id}`} 
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="h-36 overflow-hidden relative">
                  {member?.image?.includes("https://res") ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-4xl font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-indigo-800 truncate">{member.name}</h3>
                  <div className="bg-indigo-100 text-center py-1 px-2 rounded-full mt-2 mb-2 self-start">
                    <span className="text-indigo-800 font-medium text-xs">{member.role}</span>
                  </div>
                  <div className="text-gray-700 mt-auto text-xs">
                    <div className="flex items-center mb-1">
                      <svg className="w-3 h-3 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9c-1.512 1.512-3.956 1.512-5.468 0l-4.242-4.243c-1.512-1.512-1.512-3.956 0-5.468l4.243-4.243c1.512-1.512 3.956-1.512 5.468 0L18.9 7.657M9 11l3 3m0 0l3-3m-3 3V8"></path>
                      </svg>
                      <span className="truncate">{member.villageName}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <span>{member.mobileNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Function to toggle apply info modal
const toggleApplyInfo = () => {
  // Implement modal or popover with application info
  alert("To apply for membership, please visit our office with your ID proof or contact the admin at +91 8219769590");
};

export default Dashboard;