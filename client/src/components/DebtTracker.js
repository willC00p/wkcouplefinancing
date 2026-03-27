import React, { useState, useEffect } from 'react';
import './DebtTracker.css';
import { BiPlus } from 'react-icons/bi';
import API_URL from '../config';
import DebtForm from './DebtForm';
import DebtTable from './DebtTable';

const DebtTracker = ({ onRefresh }) => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/expenses`);
      if (!response.ok) throw new Error('Failed to fetch debts');
      const data = await response.json();
      setDebts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching debts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDebtAdded = () => {
    fetchDebts();
    onRefresh();
  };

  const handleDebtUpdated = () => {
    fetchDebts();
    onRefresh();
  };

  const handleDebtDeleted = () => {
    fetchDebts();
    onRefresh();
  };

  if (loading) return <div className="debt-tracker"><p>Loading debts...</p></div>;

  return (
    <div className="debt-tracker">
      <div className="tracker-header">
        <h2>Shared Debts (UTANG)</h2>
        <p className="tracker-subtitle">Track and manage shared debts</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <DebtForm onDebtAdded={handleDebtAdded} />

      {debts.length === 0 ? (
        <p className="no-data">No debts yet. Create one to get started!</p>
      ) : (
        <DebtTable 
          debts={debts}
          onUpdate={handleDebtUpdated}
          onDelete={handleDebtDeleted}
        />
      )}
    </div>
  );
};

export default DebtTracker;
