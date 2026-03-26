const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../database');

// Calculate days remaining
const calculateDaysRemaining = (deadline) => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const timeDiff = deadlineDate - today;
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await dbAll('SELECT * FROM expenses ORDER BY deadline ASC');
    const expensesWithDays = expenses.map(exp => ({
      ...exp,
      days_remaining: calculateDaysRemaining(exp.deadline)
    }));
    res.json(expensesWithDays);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await dbGet('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    expense.days_remaining = calculateDaysRemaining(expense.deadline);
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new expense
router.post('/', async (req, res) => {
  try {
    const { date, particulars, deadline, pay_to, total_amount, custom_payer } = req.body;

    // Validation
    if (!date || !particulars || !deadline || !pay_to || !total_amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await dbRun(
      `INSERT INTO expenses (date, particulars, deadline, pay_to, total_amount, status, custom_payer)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, particulars, deadline, pay_to, total_amount, 'unpaid', custom_payer || null]
    );

    res.status(201).json({
      id: result.id,
      message: 'Expense created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE expense
router.put('/:id', async (req, res) => {
  try {
    const { date, particulars, deadline, pay_to, total_amount, status, partial_amount_paid, custom_payer } = req.body;
    const id = req.params.id;

    const expense = await dbGet('SELECT * FROM expenses WHERE id = ?', [id]);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await dbRun(
      `UPDATE expenses 
       SET date = ?, particulars = ?, deadline = ?, pay_to = ?, total_amount = ?, 
           status = ?, partial_amount_paid = ?, custom_payer = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [date || expense.date, particulars || expense.particulars, deadline || expense.deadline,
       pay_to || expense.pay_to, total_amount || expense.total_amount, status || expense.status,
       partial_amount_paid || expense.partial_amount_paid, custom_payer || expense.custom_payer, id]
    );

    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
