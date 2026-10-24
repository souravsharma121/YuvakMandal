import React, { useState } from 'react';
import { Download, X } from 'lucide-react';

const OutstandingDues = ({
  outstandingDues,
  selectedMonth,
  selectedYear,
  handleOutstandingFilterChange,
  months,
  years,
  downloadOutstandingPDF
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadType, setDownloadType] = useState('monthly'); // 'monthly' or 'yearly'
  const [downloadYear, setDownloadYear] = useState(selectedYear);
  const [downloadMonth, setDownloadMonth] = useState(selectedMonth);

  const handleDownload = () => {
    downloadOutstandingPDF({
      type: downloadType,
      year: downloadYear,
      monthIndex: parseInt(downloadMonth)
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Outstanding Contributions</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={18} />
          <span>Download Report</span>
        </button>
      </div>

      {/* Month/Year selector for viewing */}
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

      {/* Download Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Download Outstanding Report</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Report Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      value="monthly"
                      checked={downloadType === 'monthly'}
                      onChange={() => setDownloadType('monthly')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Monthly Report</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      value="yearly"
                      checked={downloadType === 'yearly'}
                      onChange={() => setDownloadType('yearly')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Full Year Report</span>
                  </label>
                </div>
              </div>

              {/* Year Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={downloadYear}
                  onChange={(e) => setDownloadYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Month Selection (Conditional) */}
              {downloadType === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    value={downloadMonth}
                    onChange={(e) => setDownloadMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OutstandingDues;