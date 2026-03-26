import React, { useState } from 'react';
import { BiPlus } from 'react-icons/bi';
import API_URL from '../config';
import './TripForm.css';

const TripForm = ({ onTripAdded }) => {
  const [tripName, setTripName] = useState('');
  const [particulars, setParticulars] = useState('');
  const [amount, setAmount] = useState('');
  const [classification, setClassification] = useState('transpo');
  const [modeOfPayment, setModeOfPayment] = useState('cash');
  const [bankName, setBankName] = useState('');
  const [eWalletName, setEWalletName] = useState('');
  const [payer, setPayer] = useState('Wayne');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const classifications = ['transpo', 'pasalubong', 'food', 'accommodation', 'activity', 'necessities', 'misc'];
  const payers = ['Wayne', 'Kyla', 'Both'];

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!tripName || !particulars || !amount) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const tripData = {
        trip_name: tripName,
        particulars,
        amount: parseFloat(amount),
        classification,
        mode_of_payment: modeOfPayment,
        bank_name: modeOfPayment === 'bank_transfer' ? bankName : null,
        e_wallet_name: modeOfPayment === 'e_wallet' ? eWalletName : null,
        payer,
        reference_number: modeOfPayment !== 'cash' ? referenceNumber : null,
        receipt_url: receiptFile ? URL.createObjectURL(receiptFile) : null
      };

      const response = await fetch(`${API_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData)
      });

      if (!response.ok) throw new Error('Failed to add trip expense');

      // Reset form
      setTripName('');
      setParticulars('');
      setAmount('');
      setClassification('transpo');
      setModeOfPayment('cash');
      setBankName('');
      setEWalletName('');
      setPayer('Wayne');
      setReferenceNumber('');
      setReceiptFile(null);

      if (onTripAdded) onTripAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="trip-form">
      <h3>Add Trip Expense</h3>

      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="trip-name">Trip Name *</label>
        <input
          id="trip-name"
          type="text"
          placeholder="e.g., Boracay 2026"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="particulars">Particulars/Description *</label>
        <input
          id="particulars"
          type="text"
          placeholder="What was this expense for?"
          value={particulars}
          onChange={(e) => setParticulars(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">Amount *</label>
          <input
            id="amount"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="classification">Classification *</label>
          <select
            id="classification"
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
          >
            {classifications.map((cls) => (
              <option key={cls} value={cls}>
                {cls.charAt(0).toUpperCase() + cls.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="mode-of-payment">Mode of Payment *</label>
          <select
            id="mode-of-payment"
            value={modeOfPayment}
            onChange={(e) => setModeOfPayment(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="e_wallet">E-Wallet Transfer</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="payer">Paid By *</label>
          <select value={payer} onChange={(e) => setPayer(e.target.value)}>
            {payers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {modeOfPayment === 'bank_transfer' && (
        <div className="form-group">
          <label htmlFor="bank-name">Bank Name</label>
          <input
            id="bank-name"
            type="text"
            placeholder="e.g., BPI, BDO, Metrobank"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
        </div>
      )}

      {modeOfPayment === 'e_wallet' && (
        <div className="form-group">
          <label htmlFor="e-wallet-name">E-Wallet Name</label>
          <input
            id="e-wallet-name"
            type="text"
            placeholder="e.g., GCash, PayMaya"
            value={eWalletName}
            onChange={(e) => setEWalletName(e.target.value)}
          />
        </div>
      )}

      {modeOfPayment !== 'cash' && (
        <div className="form-group">
          <label htmlFor="reference-number">Reference Number</label>
          <input
            id="reference-number"
            type="text"
            placeholder="Transaction reference (optional)"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="receipt">Receipt (Optional)</label>
        <input
          id="receipt"
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />
        {receiptFile && <p className="file-selected">{receiptFile.name}</p>}
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        <BiPlus /> {loading ? 'Adding...' : 'Add Trip Expense'}
      </button>
    </form>
  );
};

export default TripForm;
