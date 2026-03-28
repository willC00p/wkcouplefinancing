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
  const [showModal, setShowModal] = useState(false);

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
    setShowModal(false);
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

  // Calculate summary analytics
  const calculateSummary = () => {
    const summary = {
      total: debts.length,
      totalAmount: 0,
      paid: 0,
      paidAmount: 0,
      partial: 0,
      partialAmount: 0,
      unpaid: 0,
      unpaidAmount: 0,
      byPayer: {},
      outstanding: 0
    };

    debts.forEach(debt => {
      summary.totalAmount += debt.total_amount;
      
      if (debt.status === 'paid') {
        summary.paid += 1;
        summary.paidAmount += debt.total_amount;
      } else if (debt.status === 'partial') {
        summary.partial += 1;
        summary.partialAmount += (debt.total_amount - (debt.partial_amount_paid || 0));
      } else {
        summary.unpaid += 1;
        summary.unpaidAmount += debt.total_amount;
      }

      const payer = debt.custom_payer || debt.pay_to;
      summary.byPayer[payer] = (summary.byPayer[payer] || 0) + debt.total_amount;
    });

    summary.outstanding = summary.unpaidAmount + summary.partialAmount;
    return summary;
  };

  const summary = calculateSummary();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  if (loading) return <div className="debt-tracker"><p>Loading debts...</p></div>;

  return (
    <div className="debt-tracker">
      <div className="tracker-header">
        <div className="header-content">
          <h2>Shared Debts (UTANG)</h2>
          <p className="tracker-subtitle">Track and manage shared debts</p>
        </div>
        <button className="btn-add-debt" onClick={() => setShowModal(true)}>
          <BiPlus size={20} />
          <span>Add Debt</span>
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Summary Analytics Section */}
      <div className="summary-section">
        <div className="summary-card total">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <p className="summary-label">Total Debts</p>
            <p className="summary-value">{formatCurrency(summary.totalAmount)}</p>
            <p className="summary-count">{summary.total} transactions</p>
          </div>
        </div>

        <div className="summary-card paid">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <p className="summary-label">Paid</p>
            <p className="summary-value">{formatCurrency(summary.paidAmount)}</p>
            <p className="summary-count">{summary.paid} transactions</p>
          </div>
        </div>

        <div className="summary-card partial">
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <p className="summary-label">Partial</p>
            <p className="summary-value">{formatCurrency(summary.partialAmount)}</p>
            <p className="summary-count">{summary.partial} transactions</p>
          </div>
        </div>

        <div className="summary-card unpaid">
          <div className="summary-icon">⚠️</div>
          <div className="summary-content">
            <p className="summary-label">Outstanding</p>
            <p className="summary-value">{formatCurrency(summary.outstanding)}</p>
            <p className="summary-count">{summary.unpaid + summary.partial} pending</p>
          </div>
        </div>
      </div>

      {/* Modal for adding debt */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New UTANG (Debt)</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <DebtForm 
              onDebtAdded={handleDebtAdded}
              showModal={showModal}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}

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
