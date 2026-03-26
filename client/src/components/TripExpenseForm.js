import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import './TripExpenseForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function TripExpenseForm({ tripId, onExpenseAdded, onClose }) {
  const [formData, setFormData] = useState({
    particulars: '',
    amount: '',
    classification: 'transpo',
    mode_of_payment: 'cash',
    bank_name: '',
    e_wallet_name: '',
    payer: '',
    reference_number: ''
  });
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.particulars || !formData.amount || !formData.payer) {
      setMessage('❌ Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let receiptUrl = null;
      if (receipt) {
        const reader = new FileReader();
        receiptUrl = await new Promise((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(receipt);
        });
      }

      const response = await fetch(`${API_URL}/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          particulars: formData.particulars,
          amount: parseFloat(formData.amount),
          classification: formData.classification,
          mode_of_payment: formData.mode_of_payment,
          bank_name: formData.bank_name || null,
          e_wallet_name: formData.e_wallet_name || null,
          payer: formData.payer,
          receipt_url: receiptUrl,
          reference_number: formData.reference_number || null
        })
      });

      if (!response.ok) throw new Error('Failed to add expense');
      const newExpense = await response.json();

      setMessage('✅ Expense added successfully!');
      setFormData({
        particulars: '',
        amount: '',
        classification: 'transpo',
        mode_of_payment: 'cash',
        bank_name: '',
        e_wallet_name: '',
        payer: '',
        reference_number: ''
      });
      setReceipt(null);

      setTimeout(() => {
        onExpenseAdded(newExpense);
        onClose();
      }, 1500);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content trip-expense-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Trip Expense</h2>
          <button className="close-btn" onClick={onClose}>
            <AiOutlineClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="trip-expense-form">
          <div className="form-group">
            <label>Description *</label>
            <input
              type="text"
              name="particulars"
              value={formData.particulars}
              onChange={handleChange}
              placeholder="e.g., Hotel booking, Lunch"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Classification *</label>
              <select
                name="classification"
                value={formData.classification}
                onChange={handleChange}
                required
              >
                <option value="transpo">Transportation</option>
                <option value="pasalubong">Pasalubong</option>
                <option value="food">Food</option>
                <option value="accommodation">Accommodation</option>
                <option value="activity">Activity</option>
                <option value="necessities">Necessities</option>
                <option value="misc">Miscellaneous</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Payment Mode *</label>
            <select
              name="mode_of_payment"
              value={formData.mode_of_payment}
              onChange={handleChange}
              required
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="e_wallet">E-Wallet</option>
            </select>
          </div>

          {formData.mode_of_payment === 'bank_transfer' && (
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="e.g., BPI, BDO"
              />
            </div>
          )}

          {formData.mode_of_payment === 'e_wallet' && (
            <div className="form-group">
              <label>E-Wallet Name</label>
              <input
                type="text"
                name="e_wallet_name"
                value={formData.e_wallet_name}
                onChange={handleChange}
                placeholder="e.g., GCash, PayMaya"
              />
            </div>
          )}

          <div className="form-group">
            <label>Payer *</label>
            <input
              type="text"
              name="payer"
              value={formData.payer}
              onChange={handleChange}
              placeholder="Who paid?"
              required
            />
          </div>

          {formData.mode_of_payment !== 'cash' && (
            <div className="form-group">
              <label>Reference Number</label>
              <input
                type="text"
                name="reference_number"
                value={formData.reference_number}
                onChange={handleChange}
                placeholder="Transaction reference"
              />
            </div>
          )}

          <div className="form-group">
            <label>Receipt (Optional)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleReceiptChange}
              className="file-input"
            />
            {receipt && <p className="file-name">📎 {receipt.name}</p>}
          </div>

          {message && <div className={`form-message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TripExpenseForm;
