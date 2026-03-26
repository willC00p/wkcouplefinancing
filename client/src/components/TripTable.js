import React, { useState } from 'react';
import { BiTrash, BiDownload } from 'react-icons/bi';
import API_URL from '../config';
import './TripTable.css';

const TripTable = ({ trips, onTripDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip expense?')) {
      setDeletingId(id);
      try {
        const response = await fetch(`${API_URL}/api/trips/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete trip');
        if (onTripDeleted) onTripDeleted();
      } catch (err) {
        console.error(err);
        alert('Failed to delete trip expense');
      } finally {
        setDeletingId(null);
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

  return (
    <div className="trip-table-container">
      {/* Desktop Table View */}
      <div className="trip-table-wrapper">
        <table className="trip-table">
          <thead>
            <tr>
              <th>Trip Name</th>
              <th>Particulars</th>
              <th>Amount</th>
              <th>Classification</th>
              <th>Payment Mode</th>
              <th>Payer</th>
              <th>Details</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id} className="trip-row">
                <td><strong>{trip.trip_name}</strong></td>
                <td>{trip.particulars}</td>
                <td className="amount">₱{trip.amount.toFixed(2)}</td>
                <td>
                  <span
                    className="badge"
                    style={{ backgroundColor: getClassificationColor(trip.classification) }}
                  >
                    {trip.classification}
                  </span>
                </td>
                <td>
                  <span className="payment-mode">
                    {trip.mode_of_payment === 'cash' && 'Cash'}
                    {trip.mode_of_payment === 'bank_transfer' && `Bank (${trip.bank_name})`}
                    {trip.mode_of_payment === 'e_wallet' && `E-Wallet (${trip.e_wallet_name})`}
                  </span>
                </td>
                <td>{trip.payer}</td>
                <td>
                  <div className="trip-details-popup">
                    {trip.reference_number && (
                      <p><strong>Ref:</strong> {trip.reference_number}</p>
                    )}
                    {trip.receipt_url && (
                      <a href={trip.receipt_url} target="_blank" rel="noopener noreferrer" className="receipt-link">
                        <BiDownload /> View Receipt
                      </a>
                    )}
                  </div>
                </td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(trip.id)}
                    disabled={deletingId === trip.id}
                    title="Delete this trip expense"
                  >
                    <BiTrash /> {deletingId === trip.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="trip-cards">
        {trips.map((trip) => (
          <div key={trip.id} className="trip-card">
            <div className="card-header">
              <h4>{trip.trip_name}</h4>
              <span className="card-amount">₱{trip.amount.toFixed(2)}</span>
            </div>

            <div className="card-body">
              <div className="card-row">
                <span className="label">Particulars:</span>
                <span className="value">{trip.particulars}</span>
              </div>

              <div className="card-row">
                <span className="label">Classification:</span>
                <span
                  className="badge"
                  style={{ backgroundColor: getClassificationColor(trip.classification) }}
                >
                  {trip.classification}
                </span>
              </div>

              <div className="card-row">
                <span className="label">Payment:</span>
                <span className="value">
                  {trip.mode_of_payment === 'cash' && 'Cash'}
                  {trip.mode_of_payment === 'bank_transfer' && `Bank (${trip.bank_name})`}
                  {trip.mode_of_payment === 'e_wallet' && `E-Wallet (${trip.e_wallet_name})`}
                </span>
              </div>

              <div className="card-row">
                <span className="label">Payer:</span>
                <span className="value">{trip.payer}</span>
              </div>

              {trip.reference_number && (
                <div className="card-row">
                  <span className="label">Reference:</span>
                  <span className="value">{trip.reference_number}</span>
                </div>
              )}

              {trip.receipt_url && (
                <a href={trip.receipt_url} target="_blank" rel="noopener noreferrer" className="receipt-link">
                  <BiDownload /> View Receipt
                </a>
              )}
            </div>

            <div className="card-footer">
              <button
                className="btn-delete"
                onClick={() => handleDelete(trip.id)}
                disabled={deletingId === trip.id}
              >
                <BiTrash /> {deletingId === trip.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripTable;
