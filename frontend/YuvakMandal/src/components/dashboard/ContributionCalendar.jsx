// src/components/dashboard/ContributionCalendar.jsx
import React, { useContext, useEffect, useState } from 'react';
import ContributionContext from '../../context/ContributionContext';
import AuthContext from '../../context/AuthContext';

const ContributionCalendar = () => {
  const { contributions, getContributions } = useContext(ContributionContext);
  const { user } = useContext(AuthContext);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    getContributions();
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
      (user.role === 'Admin' || contribution.user._id === user._id)
  );
  
  const getStatusForMonth = (month) => {
    const contribution = yearContributions.find(c => c.month === month);
    return contribution ? contribution.status : null;
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  // Generate available years (current year and 2 previous years)
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear - 2, currentYear - 1, currentYear];
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contribution Calendar</h1>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="year" className="font-medium">Select Year:</label>
          <select
            id="year"
            className="border rounded-md px-3 py-2"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map(month => {
          const status = getStatusForMonth(month);
          return (
            <div 
              key={month} 
              className={`border rounded-lg p-4 ${status ? getStatusColor(status) : 'bg-gray-50'}`}
            >
              <h3 className="font-medium text-lg">{month}</h3>
              {status ? (
                <div className="mt-2">
                  <p className="font-medium">Status: {status}</p>
                  <p className="text-sm mt-1">
                    {status === 'Approved' && 'Contribution received'}
                    {status === 'Pending' && 'Waiting for treasurer approval'}
                    {status === 'Rejected' && 'Contribution rejected'}
                  </p>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-gray-600">No contribution</p>
                  {new Date(`${selectedYear}-${months.indexOf(month) + 1}-01`) <= new Date() && (
                    <a 
                      href={`/contributions/submit?month=${month}&year=${selectedYear}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
                    >
                      Submit contribution
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContributionCalendar;