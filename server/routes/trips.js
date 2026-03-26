const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../database');

// GET all trips with expense summaries and nested expenses
router.get('/', async (req, res) => {
  try {
    const trips = await dbAll(`
      SELECT 
        t.id, t.trip_name, t.start_date, t.end_date, t.destination, t.budget,
        COUNT(te.id) as expense_count,
        COALESCE(SUM(te.amount), 0) as total_spent,
        t.created_at, t.updated_at
      FROM trips t
      LEFT JOIN trip_expenses te ON t.id = te.trip_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    
    // Fetch expenses for each trip
    for (let trip of trips) {
      const expenses = await dbAll(
        'SELECT * FROM trip_expenses WHERE trip_id = ? ORDER BY created_at DESC',
        [trip.id]
      );
      trip.expenses = expenses;
    }
    
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single trip with all its expenses
router.get('/:id', async (req, res) => {
  try {
    const trip = await dbGet('SELECT * FROM trips WHERE id = ?', [req.params.id]);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    const expenses = await dbAll('SELECT * FROM trip_expenses WHERE trip_id = ? ORDER BY created_at DESC', [req.params.id]);
    trip.expenses = expenses;
    
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE new trip
router.post('/', async (req, res) => {
  try {
    const { trip_name, start_date, end_date, destination, budget } = req.body;

    if (!trip_name) {
      return res.status(400).json({ error: 'Trip name is required' });
    }

    const sql = `
      INSERT INTO trips (trip_name, start_date, end_date, destination, budget)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await dbRun(sql, [
      trip_name,
      start_date || null,
      end_date || null,
      destination || null,
      budget || null
    ]);

    res.status(201).json({ 
      id: result.id, 
      ...req.body,
      expense_count: 0,
      total_spent: 0,
      expenses: []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE trip
router.put('/:id', async (req, res) => {
  try {
    const { trip_name, start_date, end_date, destination, budget } = req.body;

    const sql = `
      UPDATE trips SET 
        trip_name = ?, start_date = ?, end_date = ?, 
        destination = ?, budget = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await dbRun(sql, [
      trip_name,
      start_date || null,
      end_date || null,
      destination || null,
      budget || null,
      req.params.id
    ]);

    res.json({ id: req.params.id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE trip (cascades to expenses due to foreign key)
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM trips WHERE id = ?', [req.params.id]);
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET expenses for a specific trip
router.get('/:tripId/expenses', async (req, res) => {
  try {
    const expenses = await dbAll(
      'SELECT * FROM trip_expenses WHERE trip_id = ? ORDER BY created_at DESC',
      [req.params.tripId]
    );
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE expense for a trip
router.post('/:tripId/expenses', async (req, res) => {
  try {
    const {
      particulars,
      amount,
      classification,
      mode_of_payment,
      bank_name,
      e_wallet_name,
      payer,
      receipt_url,
      reference_number
    } = req.body;

    if (!particulars || !amount || !classification || !mode_of_payment || !payer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify trip exists
    const trip = await dbGet('SELECT id FROM trips WHERE id = ?', [req.params.tripId]);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const sql = `
      INSERT INTO trip_expenses (
        trip_id, particulars, amount, classification, 
        mode_of_payment, bank_name, e_wallet_name, payer, 
        receipt_url, reference_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await dbRun(sql, [
      req.params.tripId,
      particulars,
      amount,
      classification,
      mode_of_payment,
      bank_name || null,
      e_wallet_name || null,
      payer,
      receipt_url || null,
      reference_number || null
    ]);

    res.status(201).json({ id: result.id, trip_id: req.params.tripId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE expense
router.put('/expenses/:id', async (req, res) => {
  try {
    const {
      particulars,
      amount,
      classification,
      mode_of_payment,
      bank_name,
      e_wallet_name,
      payer,
      receipt_url,
      reference_number
    } = req.body;

    const sql = `
      UPDATE trip_expenses SET 
        particulars = ?, amount = ?, classification = ?, 
        mode_of_payment = ?, bank_name = ?, e_wallet_name = ?, 
        payer = ?, receipt_url = ?, reference_number = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await dbRun(sql, [
      particulars,
      amount,
      classification,
      mode_of_payment,
      bank_name || null,
      e_wallet_name || null,
      payer,
      receipt_url || null,
      reference_number || null,
      req.params.id
    ]);

    res.json({ id: req.params.id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE expense
router.delete('/expenses/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM trip_expenses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
