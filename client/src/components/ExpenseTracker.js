import React, { useState, useEffect } from 'react';
import './ExpenseTracker.css';
import { BiPlus } from 'react-icons/bi';
import API_URL from '../config';
import ExpenseForm from './ExpenseForm';
import ExpenseTable from './ExpenseTable';

const ExpenseTracker = ({ onRefresh }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/expenses`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    fetchExpenses();
    onRefresh();
  };

  const handleExpenseUpdated = () => {
    fetchExpenses();
    onRefresh();
  };

  const handleExpenseDeleted = () => {
    fetchExpenses();
    onRefresh();
  };

  if (loading) return <div className="expense-tracker"><p>Loading expenses...</p></div>;

  return (
    <div className="expense-tracker">
      <div className="tracker-header">
        <h2>Shared Expenses</h2>
        <p className="tracker-subtitle">Track and manage shared expenses</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <ExpenseForm onExpenseAdded={handleExpenseAdded} />

      {expenses.length === 0 ? (
        <p className="no-data">No expenses yet. Create one to get started!</p>
      ) : (
        <ExpenseTable 
          expenses={expenses}
          onUpdate={handleExpenseUpdated}
          onDelete={handleExpenseDeleted}
        />
      )}
    </div>
  );
};

export default ExpenseTracker;
