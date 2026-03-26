const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../database');

// GET all contributions
router.get('/', async (req, res) => {
  try {
    const contributions = await dbAll('SELECT * FROM contributions ORDER BY created_at DESC');
    
    // Get participants for each contribution
    const contributionsWithParticipants = await Promise.all(
      contributions.map(async (contrib) => {
        const participants = await dbAll(
          'SELECT * FROM contribution_participants WHERE contribution_id = ?',
          [contrib.id]
        );
        return {
          ...contrib,
          participants
        };
      })
    );

    res.json(contributionsWithParticipants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single contribution
router.get('/:id', async (req, res) => {
  try {
    const contribution = await dbGet('SELECT * FROM contributions WHERE id = ?', [req.params.id]);
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    const participants = await dbAll(
      'SELECT * FROM contribution_participants WHERE contribution_id = ?',
      [req.params.id]
    );

    res.json({
      ...contribution,
      participants
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new contribution
router.post('/', async (req, res) => {
  try {
    const { payer, total_amount, number_of_people, participants, description } = req.body;

    // Validation
    if (!payer || !total_amount || !number_of_people || !participants || participants.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const split_amount = total_amount / number_of_people;

    const result = await dbRun(
      `INSERT INTO contributions (payer, total_amount, number_of_people, split_amount, description)
       VALUES (?, ?, ?, ?, ?)`,
      [payer, total_amount, number_of_people, split_amount, description || null]
    );

    const contributionId = result.id;

    // Insert participants
    for (const participant of participants) {
      await dbRun(
        `INSERT INTO contribution_participants (contribution_id, name, amount_due, status)
         VALUES (?, ?, ?, ?)`,
        [contributionId, participant, split_amount, 'unpaid']
      );
    }

    res.status(201).json({
      id: contributionId,
      message: 'Contribution created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE participant payment status
router.put('/:id/participant/:participantId', async (req, res) => {
  try {
    const { amount_paid, status } = req.body;
    const { id, participantId } = req.params;

    const participant = await dbGet(
      'SELECT * FROM contribution_participants WHERE id = ? AND contribution_id = ?',
      [participantId, id]
    );

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    await dbRun(
      `UPDATE contribution_participants 
       SET amount_paid = ?, status = ?
       WHERE id = ?`,
      [amount_paid || participant.amount_paid, status || participant.status, participantId]
    );

    res.json({ message: 'Participant payment updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE contribution
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM contributions WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Contribution not found' });
    }
    res.json({ message: 'Contribution deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
