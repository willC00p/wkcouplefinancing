const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../database');

// GET all trips
router.get('/', async (req, res) => {
  try {
    const trips = await dbAll('SELECT * FROM trips ORDER BY created_at DESC');
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single trip
router.get('/:id', async (req, res) => {
  try {
    const trip = await dbGet('SELECT * FROM trips WHERE id = ?', [req.params.id]);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE trip
router.post('/', async (req, res) => {
  try {
    const {
      trip_name,
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

    if (!trip_name || !particulars || !amount || !classification || !mode_of_payment || !payer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `
      INSERT INTO trips (
        trip_name, particulars, amount, classification, 
        mode_of_payment, bank_name, e_wallet_name, payer, 
        receipt_url, reference_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await dbRun(sql, [
      trip_name,
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

    res.status(201).json({ id: result.id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE trip
router.put('/:id', async (req, res) => {
  try {
    const {
      trip_name,
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
      UPDATE trips SET 
        trip_name = ?, particulars = ?, amount = ?, 
        classification = ?, mode_of_payment = ?, 
        bank_name = ?, e_wallet_name = ?, payer = ?, 
        receipt_url = ?, reference_number = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await dbRun(sql, [
      trip_name,
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

// DELETE trip
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM trips WHERE id = ?', [req.params.id]);
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
