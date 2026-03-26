import React, { useState, useEffect } from 'react';
import TripForm from './TripForm';
import TripTable from './TripTable';
import API_URL from '../config';
import './TripTracker.css';

const TripTracker = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    byClassification: {},
    byPayer: {}
  });

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/trips`);
      if (!response.ok) throw new Error('Failed to fetch trips');
      const data = await response.json();
      setTrips(data || []);
      calculateSummary(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (tripList) => {
    const byClassification = {};
    const byPayer = {};
    let totalAmount = 0;

    tripList.forEach((trip) => {
      totalAmount += trip.amount;

      // By classification
      if (!byClassification[trip.classification]) {
        byClassification[trip.classification] = 0;
      }
      byClassification[trip.classification] += trip.amount;

      // By payer
      if (!byPayer[trip.payer]) {
        byPayer[trip.payer] = 0;
      }
      byPayer[trip.payer] += trip.amount;
    });

    setSummary({
      totalAmount,
      byClassification,
      byPayer
    });
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleTripDeleted = () => {
    fetchTrips();
  };

  return (
    <div className="trip-tracker-container">
      <div className="trip-header">
        <h2>Trip Expenses</h2>
        <div className="trip-summary">
          <div className="summary-card">
            <span className="summary-label">Total Trip Expenses</span>
            <span className="summary-amount">₱{summary.totalAmount.toFixed(2)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Expenses Logged</span>
            <span className="summary-amount">{trips.length}</span>
          </div>
        </div>
      </div>

      <TripForm onTripAdded={fetchTrips} />

      {loading ? (
        <div className="loading">Loading trip expenses...</div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <p>No trip expenses yet. Add one to get started!</p>
        </div>
      ) : (
        <>
          <TripTable trips={trips} onTripDeleted={handleTripDeleted} />
          
          {Object.keys(summary.byClassification).length > 0 && (
            <div className="summary-section">
              <div className="summary-box">
                <h4>By Classification</h4>
                <div className="classification-list">
                  {Object.entries(summary.byClassification).map(([cls, amount]) => (
                    <div key={cls} className="classification-item">
                      <span>{cls.charAt(0).toUpperCase() + cls.slice(1)}</span>
                      <span className="amount">₱{amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="summary-box">
                <h4>By Payer</h4>
                <div className="payer-list">
                  {Object.entries(summary.byPayer).map(([payer, amount]) => (
                    <div key={payer} className="payer-item">
                      <span>{payer}</span>
                      <span className="amount">₱{amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TripTracker;
