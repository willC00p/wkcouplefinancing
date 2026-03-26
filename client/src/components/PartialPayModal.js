import React, { useState } from 'react';
import './PartialPayModal.css';

const PartialPayModal = ({ isOpen, expense, onClose, onConfirm, loading }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [error, setError] = useState('');

  const remainingAmount = expense ? expense.total_amount - (expense.partial_amount_paid || 0) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(paymentAmount);

    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > remainingAmount) {
      setError(`Payment cannot exceed remaining amount (₱${remainingAmount.toFixed(2)})`);
      return;
    }

    onConfirm(amount);
    setPaymentAmount('');
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Make Partial Payment</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="expense-info">
            <p><strong>Expense:</strong> {expense.particulars}</p>
            <p><strong>Original Amount:</strong> ₱{expense.total_amount.toFixed(2)}</p>
            <p><strong>Already Paid:</strong> ₱{(expense.partial_amount_paid || 0).toFixed(2)}</p>
            <p className="remaining-amount">
              <strong>Remaining:</strong> ₱{remainingAmount.toFixed(2)}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="payment-amount">Payment Amount *</label>
              <input
                id="payment-amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                max={remainingAmount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                autoFocus
                required
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartialPayModal;
