// context/ExpenseContext.js
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL;
const ExpenseContext = createContext();

export const useExpense = () => useContext(ExpenseContext);

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get all expenses
  const getExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/api/expenses`);
      setExpenses(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch expenses');
      setLoading(false);
    }
  };

  // Add a new expense
  const addExpense = async (expenseData) => {
    try {
      const res = await axios.post(`${baseURL}/api/expenses`, expenseData);
      setExpenses([...expenses, res.data]);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
      throw err;
    }
  };

  // Update an expense
  const updateExpense = async (id, expenseData) => {
    try {
      const res = await axios.put(`${baseURL}/api/expenses/${id}`, expenseData);
      setExpenses(
        expenses.map((expense) => (expense._id === id ? res.data : expense))
      );
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update expense');
      throw err;
    }
  };

  // Delete an expense
  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${baseURL}/api/expenses/${id}`);
      setExpenses(expenses.filter((expense) => expense._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense');
      throw err;
    }
  };

  // Calculate totals by category
  const getTotalsByCategory = () => {
    const totals = {};
    expenses.forEach((expense) => {
      const { category, amount } = expense;
      totals[category] = (totals[category] || 0) + parseFloat(amount);
    });
    return totals;
  };

  // Clear error
  const clearError = () => setError(null);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        error,
        getExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        getTotalsByCategory,
        clearError
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseContext;