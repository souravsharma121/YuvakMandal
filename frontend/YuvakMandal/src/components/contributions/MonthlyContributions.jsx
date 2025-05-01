// contributions/MonthlyContributionsTab.jsx
import React, { useState, useEffect } from 'react';
import { Download, Check } from 'lucide-react';

const MonthlyContributionsTab = ({ 
  filteredContributions, 
  totalContribution, 
  filter, 
  handleFilterChange, 
  members, 
  months, 
  years, 
  utils,
  downloadPDF
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedContributions, setPaginatedContributions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    if (downloading || downloaded) return;
    
    setDownloading(true);
    // Simulate download process
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      downloadPDF();
      
      // Reset after showing success state
      setTimeout(() => {
        setDownloaded(false);
      }, 2000);
      
      // In a real implementation, you would initiate the actual PDF download here
      // For example:
      // const link = document.createElement('a');
      // link.href = '/path-to-your-pdf.pdf';
      // link.download = 'document.pdf';
      // link.click();
    }, 1500);
  };
  // Update pagination when filtered contributions change
  useEffect(() => {
    // Calculate total pages
    const calculatedTotalPages = Math.ceil(filteredContributions.length / itemsPerPage);
    setTotalPages(calculatedTotalPages);
    
    // Ensure current page is valid
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
    }
    
    // Get paginated data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedContributions(filteredContributions.slice(startIndex, endIndex));
  }, [filteredContributions, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 mx-1 rounded ${
          currentPage === 1 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        &laquo;
      </button>
    );
    
    // Page number buttons
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    // Adjust start page if needed
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    // First page indicator
    if (startPage > 1) {
      buttons.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2">...</span>
        );
      }
    }
    
    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Last page indicator
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2">...</span>
        );
      }
      
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          {totalPages}
        </button>
      );
    }
    
    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 mx-1 rounded ${
          currentPage === totalPages 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        &raquo;
      </button>
    );
    
    return buttons;
  };

  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Monthly Contributions</h2>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="member-filter">
            Member
          </label>
          <select
            id="member-filter"
            name="member"
            value={filter.member}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Members</option>
            {members.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="month-filter">
            Month
          </label>
          <select
            id="month-filter"
            name="month"
            value={filter.month}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Months</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="year-filter">
            Year
          </label>
          <select
            id="year-filter"
            name="year"
            value={filter.year}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status-filter">
            Status
          </label>
          <select
            id="status-filter"
            name="status"
            value={filter.status}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      {/* PDF Download Button */}
      <div className="flex flex-col items-center justify-center p-8">
      <button
        onClick={handleDownload}
        className={`
          relative overflow-hidden flex items-center justify-center
          px-6 py-3 rounded-lg font-medium text-white shadow-lg
          transition-all duration-300 ease-in-out
          ${downloading ? 'bg-blue-600 cursor-wait' : ''}
          ${downloaded ? 'bg-green-600' : ''}
          ${!downloading && !downloaded ? 'bg-blue-500 hover:bg-blue-600' : ''}
          w-64
        `}
      >
        <div className="flex items-center justify-center">
          {!downloading && !downloaded && (
            <>
              <Download className="mr-2" size={20} />
              <span>Download PDF</span>
            </>
          )}
          
          {downloading && (
            <div className="flex items-center">
              <div className="mr-3 h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
              <span>Downloading...</span>
            </div>
          )}
          
          {downloaded && (
            <div className="flex items-center">
              <Check className="mr-2" size={20} />
              <span>Download Complete!</span>
            </div>
          )}
        </div>
        
        {downloading && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-white"
            style={{
              width: '100%',
              animation: 'progressAnimation 1.5s linear forwards'
            }}
          />
        )}
      </button>
      
      <style jsx>{`
        @keyframes progressAnimation {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
      
      {/* Total Contribution Summary */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-blue-800">Total Contribution</h3>
          <div className="text-xl font-bold text-blue-800">
            ₹{totalContribution.toLocaleString('en-IN')}
          </div>
        </div>
        <p className="text-sm text-blue-600 mt-1">
          {filteredContributions.length} contribution{filteredContributions.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      {/* Contribution List */}
      {filteredContributions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No contributions found matching the filters.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Village
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
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedContributions.map((contribution) => (
                  <tr key={contribution._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contribution.user?.name || 'User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contribution?.villageName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contribution.month} {contribution.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{contribution.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {utils.formatDate(contribution.paymentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${utils.getStatusColor(contribution.status)}`}>
                        {contribution.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contribution.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
       {/* Responsive Pagination Component - Mobile Optimized */}
<div className="flex flex-col w-full">
  {/* Items per page selector - stacks vertically on mobile */}
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 mb-4">
    <div className="flex items-center justify-center sm:justify-start">
      <span className="text-sm text-gray-700 mr-2">Show</span>
      <select
        value={itemsPerPage}
        onChange={handleItemsPerPageChange}
        className="px-2 py-1 border border-gray-300 rounded-md text-sm"
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
      <span className="text-sm text-gray-700 ml-2">per page</span>
    </div>
    
    {/* Entry information - centered on mobile */}
    <div className="text-sm text-gray-700 text-center sm:text-left">
      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredContributions.length)} of {filteredContributions.length} entries
    </div>
  </div>
  
  {/* Pagination buttons - centered on mobile, right-aligned on desktop */}
  <div className="flex justify-center sm:justify-end mt-2">
    <div className="flex items-center overflow-x-auto">
      {/* Mobile-specific view - simple current/total format */}
      <div className="sm:hidden flex items-center">
        <button 
          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-8 h-8 rounded-md ${
            currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'border border-gray-300 hover:bg-gray-100'
          }`}
        >
          <span>←</span>
        </button>
        
        <span className="mx-2 text-sm">
          Page {currentPage} of {Math.ceil(filteredContributions.length / itemsPerPage)}
        </span>
        
        <button 
          onClick={() => currentPage < Math.ceil(filteredContributions.length / itemsPerPage) && handlePageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredContributions.length / itemsPerPage)}
          className={`flex items-center justify-center w-8 h-8 rounded-md ${
            currentPage === Math.ceil(filteredContributions.length / itemsPerPage) ? 'text-gray-400 cursor-not-allowed' : 'border border-gray-300 hover:bg-gray-100'
          }`}
        >
          <span>→</span>
        </button>
      </div>
      
      {/* Desktop pagination - shows on sm screens and above */}
      <div className="hidden sm:flex">
        {renderPaginationButtons()}
      </div>
    </div>
  </div>
</div>
        </>
      )}
    </>
  );
};

export default MonthlyContributionsTab;