const express = require('express');
const router = express.Router();
const { dbAll } = require('../database');

// GET dashboard summary
router.get('/summary', async (req, res) => {
  try {
    // Get expense statistics
    const expenses = await dbAll('SELECT * FROM expenses');
    const unpaidExpenses = expenses.filter(e => e.status === 'unpaid');
    const paidExpenses = expenses.filter(e => e.status === 'paid');
    const partialExpenses = expenses.filter(e => e.status === 'partial');

    const totalUnpaid = unpaidExpenses.reduce((sum, e) => sum + e.total_amount, 0);
    const totalPaid = paidExpenses.reduce((sum, e) => sum + e.total_amount, 0);
    const totalPartial = partialExpenses.reduce((sum, e) => sum + (e.total_amount - e.partial_amount_paid), 0);

    // Get contribution statistics
    const contributions = await dbAll('SELECT * FROM contributions');
    const contributionParticipants = await dbAll('SELECT * FROM contribution_participants');

    const unpaidContributions = contributionParticipants.filter(p => p.status === 'unpaid');
    const paidContributions = contributionParticipants.filter(p => p.status === 'paid');

    const totalContributionUnpaid = unpaidContributions.reduce((sum, p) => sum + (p.amount_due - p.amount_paid), 0);
    const totalContributionPaid = paidContributions.reduce((sum, p) => sum + p.amount_paid, 0);

    // Calculate who owes whom
    const allTransactions = [];

    // Add expense transactions
    expenses.forEach(exp => {
      const actualPayer = exp.custom_payer || exp.pay_to;
      if (exp.status === 'unpaid' || exp.status === 'partial') {
        const amountOwed = exp.status === 'partial' ? (exp.total_amount - exp.partial_amount_paid) : exp.total_amount;
        allTransactions.push({
          type: 'expense',
          payer: actualPayer,
          amount: amountOwed,
          status: exp.status,
          description: exp.particulars
        });
      }
    });

    // Add contribution transactions
    contributionParticipants.forEach(participant => {
      if (participant.status === 'unpaid' || participant.status === 'partial') {
        const amountOwed = participant.amount_due - participant.amount_paid;
        allTransactions.push({
          type: 'contribution',
          payer: participant.name,
          amount: amountOwed,
          status: participant.status
        });
      }
    });

    res.json({
      expenses: {
        total: expenses.length,
        unpaid: unpaidExpenses.length,
        paid: paidExpenses.length,
        partial: partialExpenses.length,
        totalUnpaidAmount: totalUnpaid,
        totalPaidAmount: totalPaid,
        totalPartialAmount: totalPartial
      },
      contributions: {
        total: contributions.length,
        participantsUnpaid: unpaidContributions.length,
        participantsPaid: paidContributions.length,
        totalUnpaidAmount: totalContributionUnpaid,
        totalPaidAmount: totalContributionPaid
      },
      transactions: allTransactions,
      overallSummary: {
        totalExpenses: expenses.reduce((sum, e) => sum + e.total_amount, 0),
        totalContributions: contributions.reduce((sum, c) => sum + c.total_amount, 0),
        totalOutstanding: totalUnpaid + totalPartial + totalContributionUnpaid
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
