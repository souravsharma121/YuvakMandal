import React, { useState } from 'react';
import axios from 'axios';
import SkeletonLoader from '../loader/SkeletonLoader';

const ExpenseTracker = ({ 
    filteredExpenses,
    totalExpense,
    expenseFilter,
    handleExpenseFilterChange,
    categories,
    months,
    years,
    canManageExpenses,
    getExpenses,
    baseURL
}) => {
  
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Miscellaneous',
    description: ''
  })
  const handleExpenseChange = (e) => {
    setNewExpense({
      ...newExpense,
      [e.target.name]: e.target.value
    });
  };
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${baseURL}/api/expenses`, newExpense);
      // Reset form
      setNewExpense({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Miscellaneous',
        description: ''
      });
      // Refresh expenses
      getExpenses();
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Failed to add expense. Please try again.');
    }
  };
  
  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`${baseURL}/api/expenses/${id}`);
        getExpenses();
      } catch (err) {
        console.error('Error deleting expense:', err);
        alert('Failed to delete expense. Please try again.');
      }
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Get category badge color
  const getCategoryColor = (category) => {
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
  };

  
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Expense Tracker</h2>
      
      {/* Add Expense Form (only for Admin and Treasurer) */}
      {canManageExpenses && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Expense</h3>
          <form onSubmit={handleExpenseSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newExpense.title}
                  onChange={handleExpenseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="amount">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={newExpense.amount}
                  onChange={handleExpenseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newExpense.date}
                  onChange={handleExpenseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={newExpense.category}
                  onChange={handleExpenseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={newExpense.description}
                onChange={handleExpenseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Expense Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category-filter">
            Category
          </label>
          <select
            id="category-filter"
            name="category"
            value={expenseFilter.category}
            onChange={handleExpenseFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expense-month-filter">
            Month
          </label>
          <select
            id="expense-month-filter"
            name="month"
            value={expenseFilter.month}
            onChange={handleExpenseFilterChange}
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
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expense-year-filter">
            Year
          </label>
          <select
            id="expense-year-filter"
            name="year"
            value={expenseFilter.year}
            onChange={handleExpenseFilterChange}
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
      
      {/* Total Expense Summary */}
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-red-800">Total Expenses</h3>
          <div className="text-xl font-bold text-red-800">
            ₹{totalExpense.toLocaleString('en-IN')}
          </div>
        </div>
        <p className="text-sm text-red-600 mt-1">
          {filteredExpenses?.length} expense{filteredExpenses?.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      {/* Expense List */}
      {filteredExpenses?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No expenses found matching the filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                {canManageExpenses && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses?.map((expense) => (
                <tr key={expense._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {expense.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{expense.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.createdBy?.name || 'User'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.description || '-'}
                  </td>
                  {canManageExpenses && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default ExpenseTracker;