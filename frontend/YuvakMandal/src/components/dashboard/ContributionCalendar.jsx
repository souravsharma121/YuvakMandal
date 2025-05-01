// src/components/dashboard/ContributionCalendar.jsx
import React, { useContext, useEffect, useState } from 'react';
import ContributionContext from '../../context/ContributionContext';
import AuthContext from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const ContributionCalendar = () => {
  const { contributions, getContributions } = useContext(ContributionContext);
  const { user } = useContext(AuthContext);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getContributions();
      setLoading(false);
    };
    
    fetchData();
    // eslint-disable-next-line
  }, []);
  
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  
  // Filter contributions for the selected year and current user
  const yearContributions = contributions.filter(
    contribution => 
      contribution.year === selectedYear &&
      (user?.role === 'Admin' || contribution.user?._id === user?._id)
  );
  
  // Get all contributions for a specific month
  const getContributionsForMonth = (month) => {
    return yearContributions.filter(c => c.month === month);
  };
  
  const toggleMonthExpansion = (month) => {
    setExpandedMonths(prev => ({
      ...prev,
      [month]: !prev[month]
    }));
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        );
      case 'Pending':
        return (
          <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
      case 'Rejected':
        return (
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
        );
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'from-green-50 to-green-100 border-green-200';
      case 'Pending':
        return 'from-yellow-50 to-yellow-100 border-yellow-200';
      case 'Rejected':
        return 'from-red-50 to-red-100 border-red-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };
  
  const getTotalApprovedAmount = (monthContributions) => {
    return monthContributions
      .filter(c => c.status === 'Approved')
      .reduce((total, c) => total + c.amount, 0);
  };
  
  // Generate available years (current year and 4 previous years)
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
  
  // Check if a month is current or past
  const isCurrentOrPastMonth = (month) => {
    const monthIndex = months.indexOf(month);
    const currentDate = new Date();
    return new Date(selectedYear, monthIndex) <= currentDate;
  };
  
  // Determine if the user can add contributions
  const canAddContributions = user?.role === 'Admin' || user?.role === 'Treasurer';
  
  // Show loading skeleton
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-36 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="border rounded-lg p-4 h-32 bg-gray-100 animate-pulse">
              <div className="h-5 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded mt-4"></div>
              <div className="h-4 w-28 bg-gray-200 rounded mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Contribution Calendar</h1>
        
        {/* Updated responsive legend */}
        <div className="w-full md:w-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
              <span className="text-sm whitespace-nowrap">Approved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0"></div>
              <span className="text-sm whitespace-nowrap">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
              <span className="text-sm whitespace-nowrap">Rejected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0"></div>
              <span className="text-sm whitespace-nowrap">Not Submitted</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6 flex items-center space-x-2">
        <label htmlFor="year" className="font-medium text-gray-700">Year:</label>
        <select
          id="year"
          className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map(month => {
          const monthContributions = getContributionsForMonth(month);
          const hasContributions = monthContributions.length > 0;
          const multipleContributions = monthContributions.length > 1;
          const totalApprovedAmount = getTotalApprovedAmount(monthContributions);
          const isExpanded = expandedMonths[month];
          
          // Determine overall status color - prioritize Pending over others
          let overallStatus = hasContributions ? 
            (monthContributions.some(c => c.status === 'Pending') ? 'Pending' : 
             monthContributions.some(c => c.status === 'Approved') ? 'Approved' : 'Rejected') : null;
          
          const statusColorClass = overallStatus ? getStatusColor(overallStatus) : 'from-gray-50 to-gray-100 border-gray-200';
          const currentOrPast = isCurrentOrPastMonth(month);
          
          return (
            <div 
              key={month} 
              className={`border rounded-lg overflow-hidden bg-gradient-to-br shadow-sm hover:shadow transition duration-300 ${statusColorClass}`}
            >
              <div className="bg-white bg-opacity-60 px-4 py-2 border-b flex justify-between items-center">
                <h3 className="font-medium">{month}</h3>
                {multipleContributions && (
                  <button 
                    onClick={() => toggleMonthExpansion(month)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    )}
                  </button>
                )}
              </div>
              
              <div className="p-4">
                {hasContributions ? (
                  <div>
                    {/* Summary view (always shown) */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(overallStatus)}
                        <span className="font-medium text-gray-800">
                          {multipleContributions 
                            ? `${monthContributions.length} Contributions` 
                            : overallStatus}
                        </span>
                      </div>
                      
                      {totalApprovedAmount > 0 && (
                        <div className="text-xl font-bold text-gray-800">
                          ₹{totalApprovedAmount}
                        </div>
                      )}
                    </div>
                    
                    {/* Expanded view for multiple contributions */}
                    {multipleContributions && isExpanded && (
                      <div className="mt-3 border-t pt-2">
                        {monthContributions.map((contribution, index) => (
                          <div key={index} className="mb-2 pb-2 border-b last:border-b-0 last:pb-0 last:mb-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(contribution.status)}
                                <span className="text-sm font-medium">
                                  {contribution.status}
                                </span>
                              </div>
                              <span className="font-semibold">₹{contribution.amount}</span>
                            </div>
                            {contribution.notes && (
                              <p className="text-xs text-gray-600 mt-1">{contribution.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(null)}
                    <span className="font-medium text-gray-800">
                      Not Submitted
                    </span>
                  </div>
                )}
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {(!hasContributions || canAddContributions) && currentOrPast && (
                    <Link 
                      to="/contributions/new"
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition duration-150"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      {!hasContributions ? 'Submit' : 'Add Another'}
                    </Link>
                  )}
                  
                  {hasContributions && (
                    <Link
                      to="/contributions" 
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition duration-150"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContributionCalendar;