import React, { useState, useEffect } from 'react';

const OutstandingDues = ({ 
    outstandingDues,
    selectedMonth,
    selectedYear,
    handleOutstandingFilterChange,
    months,
    years,
}) => {

  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Outstanding Contributions</h2>
      
      {/* Month/Year selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="outstanding-month">
            Month
          </label>
          <select
            id="outstanding-month"
            name="month"
            value={selectedMonth}
            onChange={handleOutstandingFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="outstanding-year">
            Year
          </label>
          <select
            id="outstanding-year"
            name="year"
            value={selectedYear}
            onChange={handleOutstandingFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Outstanding Summary */}
      <div className="bg-amber-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-amber-800">Outstanding Dues</h3>
          <div className="text-xl font-bold text-amber-800">
            {outstandingDues.length} member{outstandingDues.length !== 1 ? 's' : ''}
          </div>
        </div>
        <p className="text-sm text-amber-600 mt-1">
          For {months[selectedMonth]} {selectedYear}
        </p>
      </div>
      
      {/* Outstanding List */}
      {outstandingDues.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No outstanding contributions for {months[selectedMonth]} {selectedYear}.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Village
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {outstandingDues.map((member) => (
                <tr key={member._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member?.villageName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member?.mobileNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default OutstandingDues;