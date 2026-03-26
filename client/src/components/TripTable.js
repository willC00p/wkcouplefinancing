import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineDelete, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import { BiDownload } from 'react-icons/bi';
import API_URL from '../config';
import './TripTable.css';

function TripTable({ trips, onAddExpense, onTripDeleted, refreshTrips }) {
  const [expandedTripId, setExpandedTripId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip and all its expenses?')) {
      setDeletingId(tripId);
      try {
        const response = await fetch(`${API_URL}/api/trips/${tripId}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete trip');
        onTripDeleted(tripId);
      } catch (err) {
        console.error(err);
        alert('Failed to delete trip');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setDeletingExpenseId(expenseId);
      try {
        const response = await fetch(`${API_URL}/api/trips/expenses/${expenseId}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete expense');
        refreshTrips();
      } catch (err) {
        console.error(err);
        alert('Failed to delete expense');
      } finally {
        setDeletingExpenseId(null);
      }
    }
  };

  const getClassificationColor = (classification) => {
    const colors = {
      transpo: '#3b82f6',
      pasalubong: '#ec4899',
      food: '#f59e0b',
      accommodation: '#10b981',
      activity: '#8b5cf6',
      necessities: '#ef4444',
      misc: '#6b7280'
    };
    return colors[classification] || '#6b7280';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PH');
  };

  const getBudgetStatus = (budget, spent) => {
    if (!budget) return 'N/A';
    const percentage = (spent / budget) * 100;
    const remaining = budget - spent;
    return {
      percentage: Math.round(percentage),
      remaining: Math.max(0, remaining),
      isOverBudget: spent > budget
    };
  };

  return (
    <div className="trip-table-container">
      {trips.map((trip) => {
        const isExpanded = expandedTripId === trip.id;
        const budgetStatus = getBudgetStatus(trip.budget, trip.total_spent);
        const expenses = trip.expenses || [];

        return (
          <div key={trip.id} className="trip-card">
            <div className="trip-card-header" onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}>
              <div className="trip-main-info">
                <h3>{trip.trip_name}</h3>
                {trip.destination && <span className="destination">📍 {trip.destination}</span>}
                <div className="trip-dates">
                  {trip.start_date && (
                    <span>
                      {formatDate(trip.start_date)}
                      {trip.end_date && ` - ${formatDate(trip.end_date)}`}
                    </span>
                  )}
                </div>
              </div>

              <div className="trip-summary-info">
                <div className="summary-item">
                  <span className="label">Spent:</span>
                  <span className="value">₱{trip.total_spent.toFixed(2)}</span>
                </div>
                {trip.budget && (
                  <div className="summary-item">
                    <span className="label">Budget:</span>
                    <span className="value">₱{trip.budget.toFixed(2)}</span>
                  </div>
                )}
                <span className="expense-count">{trip.expense_count} expense{trip.expense_count !== 1 ? 's' : ''}</span>
                <span className="toggle-icon">
                  {isExpanded ? <AiOutlineUp /> : <AiOutlineDown />}
                </span>
              </div>
            </div>

            {trip.budget && (
              <div className="budget-bar">
                <div
                  className={`budget-progress ${budgetStatus.isOverBudget ? 'over-budget' : ''}`}
                  style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}
                ></div>
                <span className="budget-text">
                  {budgetStatus.percentage}% {budgetStatus.isOverBudget ? '⚠️ Over' : `(₱${budgetStatus.remaining.toFixed(2)} left)`}
                </span>
              </div>
            )}

            {isExpanded && (
              <div className="trip-card-body">
                <div className="expenses-header">
                  <h4>{expenses.length} Expense{expenses.length !== 1 ? 's' : ''}</h4>
                  <button
                    className="btn-add-expense"
                    onClick={() => onAddExpense(trip)}
                  >
                    <AiOutlinePlus size={18} /> Add Expense
                  </button>
                </div>

                {expenses.length === 0 ? (
                  <div className="no-expenses">
                    <p>No expenses added yet. Click "Add Expense" to get started!</p>
                  </div>
                ) : (
                  <div className="expenses-list">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="expense-item">
                        <div className="expense-left">
                          <span
                            className="classification-badge"
                            style={{ backgroundColor: getClassificationColor(expense.classification) }}
                          >
                            {expense.classification}
                          </span>
                          <div className="expense-details">
                            <p className="particulars">{expense.particulars}</p>
                            <p className="payer">Paid by: {expense.payer}</p>
                            {expense.mode_of_payment !== 'cash' && (
                              <p className="payment-type">
                                {expense.mode_of_payment === 'bank_transfer' && `Bank: ${expense.bank_name}`}
                                {expense.mode_of_payment === 'e_wallet' && `E-Wallet: ${expense.e_wallet_name}`}
                                {expense.reference_number && ` (Ref: ${expense.reference_number})`}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="expense-right">
                          <span className="amount">₱{expense.amount.toFixed(2)}</span>
                          <div className="expense-actions">
                            {expense.receipt_url && (
                              <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer" className="btn-receipt" title="View receipt">
                                <BiDownload size={16} />
                              </a>
                            )}
                            <button
                              className="btn-delete-expense"
                              onClick={() => handleDeleteExpense(expense.id)}
                              disabled={deletingExpenseId === expense.id}
                              title="Delete expense"
                            >
                              <AiOutlineDelete size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="trip-card-footer">
              <button
                className="btn-delete-trip"
                onClick={() => handleDeleteTrip(trip.id)}
                disabled={deletingId === trip.id}
              >
                <AiOutlineDelete /> {deletingId === trip.id ? 'Deleting...' : 'Delete Trip'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TripTable;
