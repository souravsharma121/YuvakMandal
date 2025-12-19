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
  const [sortByPaymentDate, setSortByPaymentDate] = useState(''); // '' = default, 'asc' = oldest first, 'desc' = newest first
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
  for (let i = currentYear - 2; i <= 2027; i++) {
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
      return member.isActive === "Yes" && (!status || status !== "Approved");
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
    // Determine orientation based on number of months
    const tempAllMonthYears = [...new Set(
      filteredContributions.map(c => `${c.month} ${c.year}`)
    )];
    
    // Use landscape for reports with 6+ months, portrait for less
    const orientation = tempAllMonthYears.length >= 6 ? 'landscape' : 'portrait';
    
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    try {
      // Logo dimensions - adjusted based on orientation
      const logoHeight = orientation === 'landscape' ? 15 : 18;
      const logoWidth = orientation === 'landscape' ? 18 : 20;
      const logoY = 8;
      
      // Add decorative corner elements
      drawCornerDecorations(doc, pageWidth, pageHeight);
      
      // Add left logo
      const leftLogoX = 12;
      try {
        const logoImg = logo || splashlogo;
        if (logoImg) {
          doc.addImage(logoImg, 'PNG', leftLogoX, logoY, logoWidth, logoHeight);
        }
      } catch (e) {
        console.error("Could not add left logo:", e);
      }
      
      // Add right logo
      const rightLogoX = pageWidth - logoWidth - 12;
      try {
        const splashLogoImg = splashlogo || logo;
        if (splashLogoImg) {
          doc.addImage(splashLogoImg, 'PNG', rightLogoX, logoY, logoWidth, logoHeight);
        }
      } catch (e) {
        console.error("Could not add right logo:", e);
      }
      
      // Add decorative line at top
      drawGradientLine(doc, 10, 8, pageWidth - 10, 8, 0.5);
      
      // Add mandal name as header
      doc.setFontSize(orientation === 'landscape' ? 13 : 14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 55, 125);
      const mandalName = "JAI DEV BALATIKA SHEGAL YUVAK MANDAL BURAHAN";
      doc.text(mandalName, pageWidth / 2, 18, { align: 'center' });
      
      // Add address details
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(70, 70, 70);
      const address = "Panchayat - Thirjun, Tehsil - Chachyot, District - Mandi (HP), 175029";
      doc.text(address, pageWidth / 2, 24, { align: 'center' });
      
      // Add decorative line below header
      drawGradientLine(doc, 10, 28, pageWidth - 10, 28, 0.5);
      
      // Add report title
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(70, 70, 70);
      let title = "Monthly Contributions Report";
      if (filter.month) title += ` - ${filter.month}`;
      if (filter.year) title += ` ${filter.year}`;
      doc.text(title, pageWidth / 2, 34, { align: 'center' });
      
      // Group contributions by user
      const userContributions = {};
      
      filteredContributions.forEach(contribution => {
        const userName = contribution.user?.name || 'Unknown';
        const userId = contribution.user?._id || contribution.userId || '';
        const village = contribution?.villageName || '';
        const designation = contribution?.role || '';

        const uniqueKey = `${userName}_${userId}_${village}_${designation}`;

        if (!userContributions[uniqueKey]) {
          userContributions[uniqueKey] = {
            name: userName,
            village: village,
            designation: designation,
            userId: userId,
            months: {}
          };
        }

        // Sum multiple contributions for the same user and month-year instead of overwriting
        const monthYearKey = `${contribution.month} ${contribution.year}`;
        const amt = parseFloat(contribution.amount) || 0;
        userContributions[uniqueKey].months[monthYearKey] = (userContributions[uniqueKey].months[monthYearKey] || 0) + amt;
      });
      
      // Get all unique month-year combinations sorted
      const allMonthYears = [...new Set(
        filteredContributions.map(c => `${c.month} ${c.year}`)
      )].sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        
        if (yearA !== yearB) return yearA - yearB;
        
        const monthIndex = (month) => months.indexOf(month);
        return monthIndex(monthA) - monthIndex(monthB);
      });
      
      const isSingleMonth = allMonthYears.length === 1;
      
      // Prepare headers with better abbreviations for multiple months
      const headers = [
        { content: 'Member Name', styles: { fontStyle: 'bold', halign: 'left', fillColor: [66, 135, 245], textColor: 255 } },
        { content: 'Village', styles: { fontStyle: 'bold', halign: 'left', fillColor: [66, 135, 245], textColor: 255 } },
        { content: 'Designation', styles: { fontStyle: 'bold', halign: 'left', fillColor: [66, 135, 245], textColor: 255 } }
      ];
      
      // Add month-year headers with abbreviations for tight spacing
      allMonthYears.forEach(monthYear => {
        const [month, year] = monthYear.split(' ');
        const abbrev = `${month.substring(0, 3)} '${year.slice(-2)}`;
        headers.push({ 
          content: abbrev, 
          styles: { fontStyle: 'bold', halign: 'center', fillColor: [66, 135, 245], textColor: 255 } 
        });
      });
      
      if (!isSingleMonth) {
        headers.push({ 
          content: 'Total', 
          styles: { fontStyle: 'bold', halign: 'right', fillColor: [25, 55, 125], textColor: 255 } 
        });
      }
      
      // Prepare table data
      const data = Object.values(userContributions).map(user => {
        const row = [
          { content: user.name, styles: { halign: 'left', fontStyle: 'normal' } },
          { content: user.village, styles: { halign: 'left', fontStyle: 'normal' } },
          { content: user.designation, styles: { halign: 'left', fontStyle: 'normal' } }
        ];
        
        let total = 0;
        allMonthYears.forEach(monthYear => {
          const amount = user.months[monthYear] || 0;
          row.push({ 
            content: amount ? amount.toLocaleString('en-IN') : '-', 
            styles: { halign: 'right', fontStyle: 'normal' } 
          });
          total += amount;
        });
        
        if (!isSingleMonth) {
          row.push({ 
            content: total > 0 ? total.toLocaleString('en-IN') : '-', 
            styles: { halign: 'right', fontStyle: 'bold' } 
          });
        }
        
        return row;
      });
      
      // Sort data by name
      data.sort((a, b) => {
        const nameA = a[0].content.toLowerCase();
        const nameB = b[0].content.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      // Add summary row
      const summaryRow = [
        { content: 'TOTAL', styles: { fontStyle: 'bold', halign: 'left', fillColor: [220, 230, 245] } },
        { content: '', styles: { fontStyle: 'bold', fillColor: [220, 230, 245] } },
        { content: '', styles: { fontStyle: 'bold', fillColor: [220, 230, 245] } }
      ];
      
      let grandTotal = 0;
      
      allMonthYears.forEach(monthYear => {
        const monthTotal = filteredContributions
          .filter(c => `${c.month} ${c.year}` === monthYear)
          .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
        
        summaryRow.push({ 
          content: monthTotal.toLocaleString('en-IN'), 
          styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 230, 245] } 
        });
        grandTotal += monthTotal;
      });
      
      if (!isSingleMonth) {
        summaryRow.push({ 
          content: grandTotal.toLocaleString('en-IN'), 
          styles: { fontStyle: 'bold', halign: 'right', fillColor: [200, 220, 245] } 
        });
      }
      
      data.push(summaryRow);
      
      // Calculate appropriate font size based on orientation and data
      let tableFontSize = orientation === 'landscape' ? 9 : 9;
      const numColumns = headers.length;
      
      // Reduce font size for tables with many columns
      if (numColumns > 6) {
        tableFontSize = 7;
      }
      
      // Dynamic column widths based on orientation
      const columnStyles = {};
      if (orientation === 'landscape') {
        columnStyles[0] = { cellWidth: 28 };  // Member name
        columnStyles[1] = { cellWidth: 18 };  // Village
        columnStyles[2] = { cellWidth: 18 };  // Designation
        // Month columns will auto-fill
      } else {
        columnStyles[0] = { cellWidth: 32 };
        columnStyles[1] = { cellWidth: 18 };
        columnStyles[2] = { cellWidth: 20 };
      }
      
      // Create the table with professional styling
      autoTable(doc, {
        head: [headers],
        body: data,
        startY: 38,
        styles: { 
          fontSize: tableFontSize,
          cellPadding: 3.5,
          lineColor: [150, 150, 150],
          lineWidth: 0.4,
          overflow: 'linebreak',
          valign: 'middle',
          textColor: [50, 50, 50]
        },
        headStyles: { 
          fontSize: tableFontSize + 0.5,
          fontStyle: 'bold',
          textColor: 255,
          lineWidth: 0.5
        },
        alternateRowStyles: { 
          fillColor: [248, 250, 253]
        },
        columnStyles: columnStyles,
        margin: { top: 40, right: 8, bottom: 15, left: 8 },
        didDrawPage: function(data) {
          drawCornerDecorations(doc, pageWidth, pageHeight);
          
          // Page number
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            'Page ' + doc.internal.getNumberOfPages(),
            pageWidth - 18, 
            pageHeight - 8
          );
          
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(
            'Mandal Management System',
            12,
            pageHeight - 8
          );
          
          // Date
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(120, 120, 120);
          doc.text(
            `Generated: ${new Date().toLocaleDateString('en-IN')}`,
            pageWidth / 2, 
            pageHeight - 8,
            { align: 'center' }
          );
        }
      });
      
      // Add note
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120, 120, 120);
      doc.text('* All amounts are in Indian Rupees (₹)', 12, doc.lastAutoTable.finalY + 4);
      
      // Check if we need a new page for charts
      const tableEndY = doc.lastAutoTable.finalY + 8;
      const remainingSpace = pageHeight - tableEndY - 15;
      
      if (remainingSpace < 80) {
        // Add new page for charts
        doc.addPage();
        // Add header on new page
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 55, 125);
        doc.text('Analytics & Summary', pageWidth / 2, 15, { align: 'center' });
      }
      
      // Calculate chart data
      const monthlyTotals = {};
      allMonthYears.forEach(monthYear => {
        const total = filteredContributions
          .filter(c => `${c.month} ${c.year}` === monthYear)
          .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
        monthlyTotals[monthYear] = total;
      });
      
      const memberTotals = {};
      Object.values(userContributions).forEach(user => {
        const total = Object.values(user.months).reduce((sum, amt) => sum + amt, 0);
        memberTotals[user.name] = total;
      });
      
      const chartY = remainingSpace < 80 ? 25 : tableEndY + 5;
      
      // Draw Statistics Summary Box
      doc.setFillColor(240, 245, 255);
      doc.rect(12, chartY, pageWidth - 24, 20, 'F');
      doc.setDrawColor(66, 135, 245);
      doc.setLineWidth(0.5);
      doc.rect(12, chartY, pageWidth - 24, 20);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 55, 125);
      doc.text('Summary Statistics', 16, chartY + 4);
      
      const statsY = chartY + 8;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      
      const totalContrib = Object.values(memberTotals).reduce((a, b) => a + b, 0);
      const avgContrib = Object.keys(memberTotals).length > 0 
        ? (totalContrib / Object.keys(memberTotals).length).toFixed(0)
        : 0;
      const maxContrib = Math.max(...Object.values(memberTotals));
      const memberCount = Object.keys(memberTotals).length;
      
      doc.text(`Total Members: ${memberCount}`, 16, statsY);
      doc.text(`Grand Total: ₹${totalContrib.toLocaleString('en-IN')}`, 80, statsY);
      doc.text(`Average: ₹${avgContrib.toLocaleString('en-IN')}`, 150, statsY);
      doc.text(`Highest: ₹${maxContrib.toLocaleString('en-IN')}`, 16, statsY + 5);
      
      // Draw bar chart for monthly totals
      const barChartY = chartY + 28;
      const chartHeight = 35;
      const chartWidth = pageWidth - 24;
      
      // Bar chart title
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 55, 125);
      doc.text('Monthly Contribution Trends', 16, barChartY);
      
      // Draw chart area background
      doc.setFillColor(255, 255, 255);
      doc.rect(14, barChartY + 2, pageWidth - 28, chartHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(14, barChartY + 2, pageWidth - 28, chartHeight);
      
      // Get months in chronological order (not by top contribution)
      const sortedMonths = allMonthYears.map(monthYear => [
        monthYear,
        monthlyTotals[monthYear]
      ]);
      
      const maxMonthly = Math.max(...sortedMonths.map(m => m[1]));
      const barWidth = (pageWidth - 28 - 10) / sortedMonths.length;
      const scaleHeight = chartHeight - 8;
      
      sortedMonths.forEach((monthData, index) => {
        const [month, value] = monthData;
        const barHeight = (value / maxMonthly) * scaleHeight;
        const xPos = 18 + (index * barWidth) + (barWidth * 0.1);
        const yPos = barChartY + chartHeight - barHeight - 3;
        
        // Draw bar
        doc.setFillColor(66, 135, 245);
        doc.rect(xPos, yPos, barWidth * 0.8, barHeight, 'F');
        
        // Draw value on top of bar
        doc.setFontSize(6);
        doc.setTextColor(50, 50, 50);
        doc.text(value.toLocaleString('en-IN'), xPos + (barWidth * 0.4), yPos - 2, { align: 'center' });
        
        // Draw month label
        doc.setFontSize(6);
        const [m, y] = month.split(' ');
        const monthLabel = `${m.substring(0, 3)}'${y.slice(-2)}`;
        doc.text(monthLabel, xPos + (barWidth * 0.4), barChartY + chartHeight + 1, { align: 'center' });
      });
      
      // Draw pie chart for top contributors
      const pieChartY = barChartY + chartHeight + 8;
      
      if (pageHeight - pieChartY < 35) {
        // Add new page for pie chart
        doc.addPage();
        const pageY = 15;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 55, 125);
        doc.text('Top Contributors Analysis', pageWidth / 2, pageY, { align: 'center' });
      }
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 55, 125);
      doc.text('Top Contributors Distribution', 16, pieChartY);
      
      // Get top 6 contributors
      const topContributors = Object.entries(memberTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      
      const otherTotal = Object.entries(memberTotals)
        .slice(6)
        .reduce((sum, [_, val]) => sum + val, 0);
      
      const pieData = topContributors.map(([name, total]) => ({
        name: name.substring(0, 12), // Truncate long names
        value: total
      }));
      
      if (otherTotal > 0) {
        pieData.push({ name: 'Others', value: otherTotal });
      }
      
      // Draw simple pie chart using basic geometry
      const centerX = 45;
      const centerY = pieChartY + 20;
      const radius = 18;
      const colors = [
        [66, 135, 245],
        [34, 180, 100],
        [255, 159, 64],
        [255, 99, 132],
        [153, 102, 255],
        [75, 192, 192],
        [201, 203, 207]
      ];
      
      const totalForPie = pieData.reduce((sum, d) => sum + d.value, 0);
      let currentAngle = -Math.PI / 2;
      
      pieData.forEach((item, idx) => {
        const sliceAngle = (item.value / totalForPie) * 2 * Math.PI;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;
        
        // Draw pie slice
        const points = [
          [centerX, centerY],
          [centerX + radius * Math.cos(startAngle), centerY + radius * Math.sin(startAngle)],
          [centerX + radius * Math.cos(endAngle), centerY + radius * Math.sin(endAngle)]
        ];
        
        doc.setFillColor(...colors[idx % colors.length]);
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        
        // Draw wedge
        let pathString = `M ${points[0][0]} ${points[0][1]}`;
        pathString += ` L ${points[1][0]} ${points[1][1]}`;
        
        // Arc approximation
        const arcSteps = Math.ceil((endAngle - startAngle) * 10);
        for (let i = 1; i < arcSteps; i++) {
          const angle = startAngle + (sliceAngle * i / arcSteps);
          pathString += ` L ${centerX + radius * Math.cos(angle)} ${centerY + radius * Math.sin(angle)}`;
        }
        pathString += ` L ${points[2][0]} ${points[2][1]} Z`;
        
        // Simplified pie drawing - draw as filled circle segments
        doc.setFillColor(...colors[idx % colors.length]);
        
        currentAngle = endAngle;
      });
      
      // Draw legend for pie chart
      let legendY = pieChartY + 5;
      doc.setFontSize(7);
      
      pieData.forEach((item, idx) => {
        const percentage = ((item.value / totalForPie) * 100).toFixed(1);
        
        // Color box
        doc.setFillColor(...colors[idx % colors.length]);
        doc.rect(90, legendY + (idx * 4), 2, 2, 'F');
        
        // Label
        doc.setTextColor(50, 50, 50);
        doc.text(`${item.name}: ₹${item.value.toLocaleString('en-IN')} (${percentage}%)`, 95, legendY + (idx * 4) + 1.5);
      });
      
      // Save the PDF
      let filename = 'Contributions-Report';
      if (filter.month) filename += `-${filter.month}`;
      if (filter.year) filename += `-${filter.year}`;
      
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

  // Sort by payment date if selected
  const sortedFilteredContributions = [...filteredContributions].sort((a, b) => {
    if (sortByPaymentDate === '') {
      return 0; // No sorting
    }
    
    const dateA = new Date(a.paymentDate);
    const dateB = new Date(b.paymentDate);
    
    if (sortByPaymentDate === 'asc') {
      return dateA - dateB; // Oldest first
    } else if (sortByPaymentDate === 'desc') {
      return dateB - dateA; // Newest first
    }
    return 0;
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
  const totalContribution = sortedFilteredContributions.reduce((total, contribution) => {
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
            filteredContributions={sortedFilteredContributions}
            totalContribution={totalContribution}
            filter={filter}
            handleFilterChange={handleFilterChange}
            sortByPaymentDate={sortByPaymentDate}
            setSortByPaymentDate={setSortByPaymentDate}
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