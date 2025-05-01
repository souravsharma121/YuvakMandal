// Main ContributionList.jsx
import React, { useEffect, useState } from 'react';
import { useContribution } from '../../context/ContributionContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import SkeletonLoader from '../loader/SkeletonLoader';
import MonthlyContributions from './MonthlyContributions';
import ExpensesTracker from './ExpenseTracker';
import OutstandingDues from './OutstandingDues';
import FinancialSummary from './FinancialSummary'; 
import { BarChart2, CreditCard, AlertTriangle, PieChart } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import logo from "../../assets/pdflogo.png"
import splashlogo from "../../assets/splashlogo.png"
const baseURL = import.meta.env.VITE_API_URL;

const ContributionList = () => {
  const { contributions, loading, getContributions } = useContribution();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contributions');
  const [filter, setFilter] = useState({
    month: '',
    year: '',
    status: '',
    member: ''
  });
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expenseFilter, setExpenseFilter] = useState({
    category: '',
    month: '',
    year: ''
  });
  

  // For Outstanding Dues section
  const [allMembers, setAllMembers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [outstandingDues, setOutstandingDues] = useState([]);
  const [outstandingLoading, setOutstandingLoading] = useState(true);
  
  // Share common data
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 2; i <= currentYear; i++) {
    years.push(i);
  }
  
  const categories = [
    'Utilities', 'Maintenance', 'Travel', 'Events', 'Emergency', 'Miscellaneous'
  ];
  
  // Check if user is admin or treasurer
  const canManageExpenses = user && (user.role === 'Admin' || user.role === 'Treasurer');
  
  useEffect(() => {
    getContributions();
    getExpenses();
    getAllMembers();
  }, []);
  
  // Get all members from API
  const getAllMembers = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/users`);
      setAllMembers(res.data);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };
  
  // Get expenses from API
  const getExpenses = async () => {
    try {
      setExpensesLoading(true);
      const res = await axios.get(`${baseURL}/api/expenses`);
      setExpenses(res.data);
      setExpensesLoading(false);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setExpensesLoading(false);
    }
  };
  
  // Extract unique members from contributions
  useEffect(() => {
    if (contributions.length > 0) {
      const uniqueMembers = [...new Set(
        contributions
          .filter(contribution => contribution.user?.name)
          .map(contribution => contribution.user.name)
      )];
      setMembers(uniqueMembers);
    }
  }, [contributions]);
  
  // Calculate outstanding dues
  useEffect(() => {
    if (allMembers.length > 0 && contributions.length > 0) {
      setOutstandingLoading(true);
  
      // Filter contributions for selected month and year
      const monthlyContributions = contributions.filter(contribution =>
        contribution.month === months[selectedMonth] &&
        contribution.year.toString() === selectedYear
      );
  
      // Exclude Admins
      const nonAdminMembers = allMembers.filter(member => member.role !== 'Admin');
  
      // Map user ID -> status
      const memberStatuses = {};
      monthlyContributions.forEach(contribution => {
        if (contribution.user?._id) {
          memberStatuses[contribution.user._id.toString()] = contribution.status;
        }
      });
  
      // Find outstanding contributors
      const outstanding = nonAdminMembers.filter(member => {
        const status = memberStatuses[member._id.toString()];
        return !status || status !== 'Approved';
      });
  
      setOutstandingDues(outstanding);
      setOutstandingLoading(false);
    }
  }, [allMembers, contributions, selectedMonth, selectedYear]);
  
  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  const downloadPDF = async () => {
    // Initialize PDF document - use portrait mode as requested
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'  // Standard A4 size
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    try {
      // Default logo dimensions - adjusted for portrait mode
      const logoHeight = 18;
      const logoWidth = 20;
      const logoY = 8;
      
      // Add decorative corner elements
      drawCornerDecorations(doc, pageWidth, pageHeight);
      
      // Add left logo
      const leftLogoX = 15;
      try {
        const logoImg = logo || splashlogo;
        if (logoImg) {
          doc.addImage(logoImg, 'PNG', leftLogoX, logoY, logoWidth, logoHeight);
        } else {
          doc.setFillColor(200, 200, 200);
          doc.rect(leftLogoX, logoY, logoWidth, logoHeight, 'F');
        }
      } catch (e) {
        console.error("Could not add left logo:", e);
        doc.setFillColor(200, 200, 200);
        doc.rect(leftLogoX, logoY, logoWidth, logoHeight, 'F');
      }
      
      // Add right logo
      const rightLogoX = pageWidth - logoWidth - 15;
      try {
        const splashLogoImg = splashlogo || logo;
        if (splashLogoImg) {
          doc.addImage(splashLogoImg, 'PNG', rightLogoX, logoY, logoWidth, logoHeight);
        } else {
          doc.setFillColor(200, 200, 200);
          doc.rect(rightLogoX, logoY, logoWidth, logoHeight, 'F');
        }
      } catch (e) {
        console.error("Could not add right logo:", e);
        doc.setFillColor(200, 200, 200);
        doc.rect(rightLogoX, logoY, logoWidth, logoHeight, 'F');
      }
      
      // Add decorative line at top with gradient effect
      drawGradientLine(doc, 10, 8, pageWidth - 10, 8, 0.5);
      
      // Add mandal name as header with improved styling
      doc.setFontSize(14); // Slightly smaller for portrait mode
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 55, 125);
      const mandalName = "JAI DEV BALATIKA SHEGAL YUVAK MANDAL BURAHAN";
      doc.text(mandalName, pageWidth / 2, 19, { align: 'center' });
      
      // Add address details
      doc.setFontSize(9); // Smaller for portrait mode
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(70, 70, 70);
      const address = "Panchayat - Thirjun, Tehsil - Chachyot, District - Mandi (HP), 175029";
      doc.text(address, pageWidth / 2, 26, { align: 'center' });
      
      // Add decorative line below header with gradient effect
      drawGradientLine(doc, 10, 30, pageWidth - 10, 30, 0.5);
      
      // Add report title with better styling
      doc.setFontSize(12); // Smaller for portrait mode
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(70, 70, 70);
      let title = "Monthly Contributions Report";
      if (filter.month) title += ` - ${filter.month}`;
      if (filter.year) title += ` ${filter.year}`;
      doc.text(title, pageWidth / 2, 37, { align: 'center' });
      
      // Group contributions by user
      const userContributions = {};
      
      filteredContributions.forEach(contribution => {
        const userName = contribution.user?.name || 'Unknown';
        
        if (!userContributions[userName]) {
          userContributions[userName] = {
            name: userName,
            village: contribution?.villageName || '',
            designation: contribution?.role || '',
            months: {}
          };
        }
        
        userContributions[userName].months[`${contribution.month} ${contribution.year}`] = parseFloat(contribution.amount) || 0;
      });
      
      // Get all unique month-year combinations
      const allMonthYears = [...new Set(
        filteredContributions.map(c => `${c.month} ${c.year}`)
      )].sort((a, b) => {
        // Sort by year first, then by month
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        
        if (yearA !== yearB) return yearA - yearB;
        
        // Get month indices for proper sorting
        const monthIndex = (month) => months.indexOf(month);
        return monthIndex(monthA) - monthIndex(monthB);
      });
      
      // Determine if it's a single month report
      const isSingleMonth = allMonthYears.length === 1;
      
      // Prepare the table headers
      const headers = [
        { content: 'Member Name', styles: { fontStyle: 'bold', halign: 'left' } },
        { content: 'Village', styles: { fontStyle: 'bold', halign: 'left' } },
        { content: 'Designation', styles: { fontStyle: 'bold', halign: 'left' } }
      ];
      
      // Add month-year headers
      allMonthYears.forEach(monthYear => {
        headers.push({ 
          content: monthYear, 
          styles: { fontStyle: 'bold', halign: 'right' } 
        });
      });
      
      // Add total column only if it's not a single month report
      if (!isSingleMonth) {
        headers.push({ 
          content: 'Total', 
          styles: { fontStyle: 'bold', halign: 'right' } 
        });
      }
      
      // Prepare the table data
      const data = Object.values(userContributions).map(user => {
        // Start with user name, village, and designation
        const row = [
          { content: user.name, styles: { halign: 'left' } },
          { content: user.village, styles: { halign: 'left' } },
          { content: user.designation, styles: { halign: 'left' } }
        ];
        
        // Add amount for each month
        let total = 0;
        allMonthYears.forEach(monthYear => {
          const amount = user.months[monthYear] || 0;
          row.push({ 
            content: amount ? amount.toLocaleString('en-IN') : '-', 
            styles: { halign: 'right' } 
          });
          total += amount;
        });
        
        // Add total only if it's not a single month report
        if (!isSingleMonth) {
          row.push({ 
            content: total.toLocaleString('en-IN'), 
            styles: { fontStyle: 'bold', halign: 'right' } 
          });
        }
        
        return row;
      });
      
      // Add summary row
      const summaryRow = [
        { content: 'Total', styles: { fontStyle: 'bold', halign: 'left' } },
        { content: '', styles: { fontStyle: 'bold' } },
        { content: '', styles: { fontStyle: 'bold' } }
      ];
      
      let grandTotal = 0;
      
      allMonthYears.forEach(monthYear => {
        const monthTotal = filteredContributions
          .filter(c => `${c.month} ${c.year}` === monthYear)
          .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
        
        summaryRow.push({ 
          content: monthTotal.toLocaleString('en-IN'), 
          styles: { fontStyle: 'bold', halign: 'right' } 
        });
        grandTotal += monthTotal;
      });
      
      // Add grand total only if it's not a single month report
      if (!isSingleMonth) {
        summaryRow.push({ 
          content: grandTotal.toLocaleString('en-IN'), 
          styles: { fontStyle: 'bold', halign: 'right' } 
        });
      }
      
      data.push(summaryRow);
      
      // Calculate table height to ensure it fits properly
      const tableRowCount = data.length + 1; // +1 for header
      const estimatedRowHeight = 8; // mm per row
      const estimatedTableHeight = tableRowCount * estimatedRowHeight;
      
      // Adjust font size if needed to fit on one page
      let tableFontSize = 9; // Start smaller in portrait mode
      const availableHeight = pageHeight - 65; // Allowing for header and footer
      
      if (estimatedTableHeight > availableHeight) {
        // Scale down font size to fit on page
        tableFontSize = Math.max(7, Math.floor(tableFontSize * (availableHeight / estimatedTableHeight)));
      }
      
      // Create the table with improved styling
      autoTable(doc, {
        head: [headers],
        body: data,
        startY: 47,
        styles: { 
          fontSize: tableFontSize,
          cellPadding: 2,
          lineColor: [80, 80, 80],
          lineWidth: 0.1,
          overflow: 'linebreak'
        },
        headStyles: { 
          fillColor: [66, 135, 245], 
          textColor: 255,
          fontSize: tableFontSize
        },
        alternateRowStyles: { fillColor: [240, 250, 255] },
        columnStyles: {
          0: { cellWidth: 35 },  // Member name column
          1: { cellWidth: 20 },  // Village column
          2: { cellWidth: 25 }   // Designation column
        },
        margin: { top: 45, right: 10, bottom: 15, left: 10 }, // Adjusted margins for portrait
        didDrawPage: function(data) {
          // Add decorative corners on each page
          drawCornerDecorations(doc, pageWidth, pageHeight);
          
          // Add page number at the bottom
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            'Page ' + doc.internal.getNumberOfPages(),
            pageWidth - 20, 
            pageHeight - 10
          );
          
          // Add footer text
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(
            'Generated by Mandal Management System',
            20,
            pageHeight - 10
          );
          
          // Add generation date at the bottom
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Generated on: ${new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}`,
            pageWidth / 2, 
            pageHeight - 10,
            { align: 'center' }
          );
        },
        willDrawCell: function(data) {
          // Apply specific styling to the total column
          const isLastColumn = data.column.index === headers.length - 1;
          const isLastRow = data.row.index === data.table.body.length - 1;
          
          if (isLastColumn || isLastRow) {
            doc.setFontSize(tableFontSize);
            if (isLastRow && isLastColumn) {
              doc.setFont('helvetica', 'bold');
            }
          }
        }
      });
      
      // Add note about currency (moved closer to table)
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('* All amounts are in Indian Rupees', 20, doc.lastAutoTable.finalY + 5);
      
      // Save the PDF
      let filename = 'Contributions-Report';
      if (filter.month) filename += `-${filter.month}`;
      if (filter.year) filename += `-${filter.year}`;
      if (filter.member) filename += `-${filter.member.replace(/\s+/g, '-')}`;
      
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    }
  };
  
  // Helper function to draw decorative corners
  function drawCornerDecorations(doc, pageWidth, pageHeight) {
    // Corner decoration style
    doc.setDrawColor(66, 135, 245);
    doc.setLineWidth(0.8);
    
    // Top-left corner
    doc.line(10, 5, 30, 5);
    doc.line(10, 5, 10, 25);
    
    // Top-right corner
    doc.line(pageWidth - 30, 5, pageWidth - 10, 5);
    doc.line(pageWidth - 10, 5, pageWidth - 10, 25);
    
    // Bottom-left corner
    doc.line(10, pageHeight - 5, 30, pageHeight - 5);
    doc.line(10, pageHeight - 25, 10, pageHeight - 5);
    
    // Bottom-right corner
    doc.line(pageWidth - 30, pageHeight - 5, pageWidth - 10, pageHeight - 5);
    doc.line(pageWidth - 10, pageHeight - 25, pageWidth - 10, pageHeight - 5);
    
    // Add small decorative circles at each corner
    doc.setFillColor(66, 135, 245);
    doc.circle(10, 5, 1.5, 'F');
    doc.circle(pageWidth - 10, 5, 1.5, 'F');
    doc.circle(10, pageHeight - 5, 1.5, 'F');
    doc.circle(pageWidth - 10, pageHeight - 5, 1.5, 'F');
  }
  
  // Helper function to draw gradient-like line
  function drawGradientLine(doc, x1, y1, x2, y2, width) {
    // Draw main line
    doc.setDrawColor(66, 135, 245);
    doc.setLineWidth(width);
    doc.line(x1, y1, x2, y2);
    
    // Draw accent lines for gradient effect
    doc.setDrawColor(25, 55, 125);
    doc.setLineWidth(width / 2);
    doc.line(x1 + 5, y1 - 0.6, x2 - 5, y2 - 0.6);
    
    doc.setDrawColor(120, 180, 255);
    doc.setLineWidth(width / 3);
    doc.line(x1 + 10, y1 + 0.6, x2 - 10, y2 + 0.6);
  }
  
  const handleExpenseFilterChange = (e) => {
    setExpenseFilter({
      ...expenseFilter,
      [e.target.name]: e.target.value
    });
  };
  
  const handleOutstandingFilterChange = (e) => {
    if (e.target.name === 'month') {
      setSelectedMonth(parseInt(e.target.value));
    } else if (e.target.name === 'year') {
      setSelectedYear(e.target.value);
    }
  };
  
  // Filter contributions based on criteria
  const enhancedContributions = contributions.map(contribution => {
    const member = allMembers.find(m => m._id.toString() === contribution.user?._id?.toString());
    // Create a new object with all original properties plus villageName
    return {
      ...contribution,
      villageName: member?.villageName || '',
      role: member?.role || '',
    };
  });
  
  // Then filter the enhanced contributions
  const filteredContributions = enhancedContributions.filter(contribution => {
    return (
      (filter.month === '' || contribution.month === filter.month) &&
      (filter.year === '' || contribution.year.toString() === filter.year) &&
      (filter.status === '' || contribution.status === filter.status) &&
      (filter.member === '' || contribution.user?.name === filter.member) 
    );
  });
    
  // Filter expenses based on criteria
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const expenseMonth = months[expenseDate.getMonth()];
    const expenseYear = expenseDate.getFullYear().toString();
    
    return (
      (expenseFilter.category === '' || expense.category === expenseFilter.category) &&
      (expenseFilter.month === '' || expenseMonth === expenseFilter.month) &&
      (expenseFilter.year === '' || expenseYear === expenseFilter.year)
    );
  });
  
  // Calculate total contribution amount based on filtered data
  const totalContribution = filteredContributions.reduce((total, contribution) => {
    return total + (parseFloat(contribution.amount) || 0);
  }, 0);
  
  // Calculate total expense amount based on filtered data
  const totalExpense = filteredExpenses.reduce((total, expense) => {
    return total + (parseFloat(expense.amount) || 0);
  }, 0);
  
  // Calculate balance
  const balance = totalContribution - totalExpense;
  
  // Common utility functions passed to components
  const utils = {
    formatDate: (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    },
    
    getStatusColor: (status) => {
      switch (status) {
        case 'Approved':
          return 'bg-green-100 text-green-800';
        case 'Rejected':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-yellow-100 text-yellow-800';
      }
    },
    
    getCategoryColor: (category) => {
      switch (category) {
        case 'Utilities':
          return 'bg-blue-100 text-blue-800';
        case 'Maintenance':
          return 'bg-purple-100 text-purple-800';
        case 'Events':
          return 'bg-indigo-100 text-indigo-800';
        case 'Emergency':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    },
    
    getCategoryBarColor: (category) => {
      switch (category) {
        case 'Utilities':
          return 'bg-blue-600';
        case 'Maintenance':
          return 'bg-purple-600';
        case 'Events':
          return 'bg-indigo-600';
        case 'Emergency':
          return 'bg-red-600';
        default:
          return 'bg-gray-600';
      }
    }
  };

  if (loading && activeTab === 'contributions') {
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

  if (expensesLoading && activeTab === 'expenses') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (outstandingLoading && activeTab === 'outstanding') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      {/* Tabs as cards with icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
            activeTab === 'contributions'
              ? 'bg-blue-200 text-blue-700 shadow-sm'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('contributions')}
        >
          <CreditCard className={`w-5 h-5 mb-1 ${
            activeTab === 'contributions' ? 'text-blue-600' : 'text-gray-500'
          }`} />
          <span className="text-xs font-medium">Contributions</span>
        </button>
        
        <button
          className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
            activeTab === 'expenses'
              ? 'bg-blue-200 text-blue-700 shadow-sm'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('expenses')}
        >
          <BarChart2 className={`w-5 h-5 mb-1 ${
            activeTab === 'expenses' ? 'text-blue-600' : 'text-gray-500'
          }`} />
          <span className="text-xs font-medium">Expenses</span>
        </button>
        
        <button
          className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
            activeTab === 'outstanding'
              ? 'bg-blue-200 text-blue-700 shadow-sm'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('outstanding')}
        >
          <AlertTriangle className={`w-5 h-5 mb-1 ${
            activeTab === 'outstanding' ? 'text-blue-600' : 'text-gray-500'
          }`} />
          <span className="text-xs font-medium">Outstanding</span>
        </button>
        
        <button
          className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
            activeTab === 'summary'
              ? 'bg-blue-200 text-blue-700 shadow-sm'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('summary')}
        >
          <PieChart className={`w-5 h-5 mb-1 ${
            activeTab === 'summary' ? 'text-blue-600' : 'text-gray-500'
          }`} />
          <span className="text-xs font-medium">Summary</span>
        </button>
      </div>
      
      {/* Tab content */}
      <div className="border-t border-gray-200 pt-4">
        {activeTab === 'contributions' && (
          <MonthlyContributions
            filteredContributions={filteredContributions}
            totalContribution={totalContribution}
            filter={filter}
            handleFilterChange={handleFilterChange}
            members={members}
            months={months}
            years={years}
            utils={utils}
            downloadPDF={() => downloadPDF(filteredContributions, filter, allMembers, months)}
          />
        )}
        
        {activeTab === 'expenses' && (
          <ExpensesTracker
            filteredExpenses={filteredExpenses}
            totalExpense={totalExpense}
            expenseFilter={expenseFilter}
            handleExpenseFilterChange={handleExpenseFilterChange}
            categories={categories}
            months={months}
            years={years}
            canManageExpenses={canManageExpenses}
            getExpenses={getExpenses}
            baseURL={baseURL}
            utils={utils}
          />
        )}
        
        {activeTab === 'outstanding' && (
          <OutstandingDues
            outstandingDues={outstandingDues}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            handleOutstandingFilterChange={handleOutstandingFilterChange}
            months={months}
            years={years}
          />
        )}
        
        {activeTab === 'summary' && (
          <FinancialSummary
            filter={filter}
            handleFilterChange={handleFilterChange}
            totalContribution={totalContribution}
            totalExpense={totalExpense}
            balance={balance}
            filteredContributions={filteredContributions}
            filteredExpenses={filteredExpenses}
            months={months}
            years={years}
            contributions={contributions}
            expenses={expenses}
            categories={categories}
            utils={{
              getCategoryBarColor: (category) => {
                switch (category) {
                  case 'Utilities': return 'bg-blue-600';
                  case 'Maintenance': return 'bg-purple-600';
                  case 'Events': return 'bg-indigo-600';
                  case 'Emergency': return 'bg-red-600';
                  default: return 'bg-gray-600';
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ContributionList;