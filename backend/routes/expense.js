// routes/expenses.js
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// Middleware to check if user is admin or treasurer
const adminTreasurerAuth = (req, res, next) => {
  if (req.user.role === 'Admin' || req.user.role === 'Treasurer') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Only Admin or Treasurer can perform this action.' });
  }
};

// Get all expenses (all authenticated users can view)
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find()
      .sort({ date: -1 })
      .populate('createdBy', 'name role');
    
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create expense (Admin or Treasurer only)
router.post('/', auth, adminTreasurerAuth, async (req, res) => {
  try {
    const { title, amount, date, category, description } = req.body;
    
    const expense = new Expense({
      title,
      amount,
      date: date || Date.now(),
      category,
      description,
      createdBy: req.user.userId
    });
    
    await expense.save();
    
    const populatedExpense = await Expense.findById(expense._id)
      .populate('createdBy', 'name role');
    
    res.status(201).json(populatedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update expense (Admin or Treasurer only)
router.put('/:id', auth, adminTreasurerAuth, async (req, res) => {
  try {
    const { title, amount, date, category, description } = req.body;
    
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        title,
        amount,
        date,
        category,
        description
      },
      { new: true }
    ).populate('createdBy', 'name role');
    
    res.json(updatedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete expense (Admin or Treasurer only)
router.delete('/:id', auth, adminTreasurerAuth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    await Expense.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;