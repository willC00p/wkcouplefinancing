import React, { useState, useEffect } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import API_URL from '../config';
import CreateTripForm from './CreateTripForm';
import TripExpenseForm from './TripExpenseForm';
import TripTable from './TripTable';
import './TripTracker.css';

function TripTracker() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateTripForm, setShowCreateTripForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedTripForExpense, setSelectedTripForExpense] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/trips`);
      if (!response.ok) throw new Error('Failed to fetch trips');
      const data = await response.json();
      setTrips(data || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTripCreated = (newTrip) => {
    setTrips(prev => [newTrip, ...prev]);
    setShowCreateTripForm(false);
  };

  const handleAddExpenseClick = (trip) => {
    setSelectedTripForExpense(trip);
    setShowExpenseForm(true);
  };

  const handleExpenseAdded = async (newExpense) => {
    // Refresh all trips to get updated data
    fetchTrips();
    setShowExpenseForm(false);
  };

  const handleTripDeleted = (tripId) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
  };

  const calculateStats = () => {
    const totalTrips = trips.length;
    const totalBudget = trips.reduce((sum, t) => sum + (t.budget || 0), 0);
    const totalSpent = trips.reduce((sum, t) => sum + (t.total_spent || 0), 0);
    const totalExpenses = trips.reduce((sum, t) => sum + (t.expense_count || 0), 0);

    return { totalTrips, totalBudget, totalSpent, totalExpenses };
  };

  const stats = calculateStats();

  return (
    <div className="trip-tracker">
      <div className="tracker-header">
        <h2>Trip Expenses</h2>
        <button
          className="btn-create-trip"
          onClick={() => setShowCreateTripForm(true)}
        >
          + New Trip
        </button>
      </div>

      <div className="trip-stats">
        <div className="stat-card">
          <div className="stat-label">Total Trips</div>
          <div className="stat-value">{stats.totalTrips}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">{stats.totalExpenses}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Budget</div>
          <div className="stat-value">₱{stats.totalBudget.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Spent</div>
          <div className="stat-value">₱{stats.totalSpent.toFixed(2)}</div>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <AiOutlineLoading3Quarters className="spinner" size={40} />
          <p>Loading trips...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <p>No trips created yet. Create one to get started!</p>
        </div>
      ) : (
        <TripTable
          trips={trips}
          onAddExpense={handleAddExpenseClick}
          onTripDeleted={handleTripDeleted}
          refreshTrips={fetchTrips}
        />
      )}

      {showCreateTripForm && (
        <CreateTripForm
          onTripCreated={handleTripCreated}
          onClose={() => setShowCreateTripForm(false)}
        />
      )}

      {showExpenseForm && selectedTripForExpense && (
        <TripExpenseForm
          tripId={selectedTripForExpense.id}
          onExpenseAdded={handleExpenseAdded}
          onClose={() => setShowExpenseForm(false)}
        />
      )}
    </div>
  );
}

export default TripTracker;
