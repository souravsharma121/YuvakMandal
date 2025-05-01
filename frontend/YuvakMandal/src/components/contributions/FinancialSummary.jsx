// components/contributions/tabs/FinancialSummaryTab.jsx
import React from 'react';

const FinancialSummary = ({ 
  filter,
  handleFilterChange,
  totalContribution,
  totalExpense,
  balance,
  filteredContributions,
  filteredExpenses,
  months,
  years,
  contributions,
  expenses,
  categories,
  utils
}) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Financial Summary</h2>
      
      {/* Year/Month Filter for Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="summary-month">
            Month
          </label>
          <select
            id="summary-month"
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
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="summary-year">
            Year
          </label>
          <select
            id="summary-year"
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
      </div>
      
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Contributions Card */}
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Total Contributions</h3>
          <div className="text-2xl font-bold text-blue-800">
            ₹{totalContribution.toLocaleString('en-IN')}
          </div>
          <p className="text-sm text-blue-600 mt-2">
            {filteredContributions.length} contribution{filteredContributions.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Total Expenses Card */}
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-red-800 mb-2">Total Expenses</h3>
          <div className="text-2xl font-bold text-red-800">
            ₹{totalExpense.toLocaleString('en-IN')}
          </div>
          <p className="text-sm text-red-600 mt-2">
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Balance Card */}
        <div className={`${
          balance >= 0 ? 'bg-green-50' : 'bg-yellow-50'
        } p-4 rounded-lg shadow`}>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Current Balance</h3>
          <div className={`text-2xl font-bold ${
            balance >= 0 ? 'text-green-800' : 'text-yellow-800'
          }`}>
            ₹{balance.toLocaleString('en-IN')}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {balance >= 0 ? 'Surplus' : 'Deficit'}
          </p>
        </div>
      </div>
      
      {/* Category-wise Expense Breakdown */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Expense Breakdown by Category</h3>
        
        {categories.map((category) => {
          const categoryExpenses = filteredExpenses.filter(
            (expense) => expense.category === category
          );
          const categoryTotal = categoryExpenses.reduce(
            (total, expense) => total + (parseFloat(expense.amount) || 0),
            0
          );
          const percentage = totalExpense > 0 
            ? ((categoryTotal / totalExpense) * 100).toFixed(1) 
            : 0;
          
          return (
            <div key={category} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{category}</span>
                <span className="text-sm text-gray-600">
                  ₹{categoryTotal.toLocaleString('en-IN')} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${utils.getCategoryBarColor(category)}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Monthly Comparison */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Comparison</h3>
        
        {filter.year && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contributions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {months.map((month) => {
                  const monthContributions = contributions.filter(
                    (contribution) => 
                      contribution.month === month && 
                      contribution.year.toString() === filter.year
                  );
                  
                  const monthExpenses = expenses.filter((expense) => {
                    const expenseDate = new Date(expense.date);
                    return (
                      months[expenseDate.getMonth()] === month &&
                      expenseDate.getFullYear().toString() === filter.year
                    );
                  });
                  
                  const monthContributionTotal = monthContributions.reduce(
                    (total, contribution) => total + (parseFloat(contribution.amount) || 0),
                    0
                  );
                  
                  const monthExpenseTotal = monthExpenses.reduce(
                    (total, expense) => total + (parseFloat(expense.amount) || 0),
                    0
                  );
                  
                  
                  const monthBalance = monthContributionTotal - monthExpenseTotal;
                  
                  return (
                    <tr key={month}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        ₹{monthContributionTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        ₹{monthExpenseTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={monthBalance >= 0 ? 'text-green-600' : 'text-yellow-600'}>
                          ₹{monthBalance.toLocaleString('en-IN')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {!filter.year && (
          <div className="text-center py-8 text-gray-500">
            Please select a year to view monthly comparison.
          </div>
        )}
      </div>
    </>
  );
};

export default FinancialSummary;