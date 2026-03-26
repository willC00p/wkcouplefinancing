import React, { useState, useEffect } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
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
    const remaining = totalBudget - totalSpent;
    const budgetUtilization = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;
    const avgExpensePerTrip = totalTrips > 0 ? (totalSpent / totalTrips).toFixed(2) : 0;
    const avgExpenseCost = totalExpenses > 0 ? (totalSpent / totalExpenses).toFixed(2) : 0;

    // Classify breakdown per category across all trips
    const categoryBreakdown = {};
    const payerBreakdown = {};
    trips.forEach(trip => {
      if (trip.expenses) {
        trip.expenses.forEach(expense => {
          if (!categoryBreakdown[expense.classification]) {
            categoryBreakdown[expense.classification] = 0;
          }
          categoryBreakdown[expense.classification] += expense.amount;

          if (!payerBreakdown[expense.payer]) {
            payerBreakdown[expense.payer] = 0;
          }
          payerBreakdown[expense.payer] += expense.amount;
        });
      }
    });

    const categoryChartData = Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: amount
      }))
      .sort((a, b) => b.value - a.value);

    return { 
      totalTrips, 
      totalBudget, 
      totalSpent, 
      totalExpenses, 
      remaining,
      budgetUtilization,
      avgExpensePerTrip,
      avgExpenseCost,
      categoryChartData,
      payerBreakdown
    };
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

      <div className="trip-stats-container">
        {/* Main KPI Cards */}
        <div className="trip-stats">
          <div className="stat-card primary">
            <div className="stat-icon">📊</div>
            <div className="stat-label">Total Trips</div>
            <div className="stat-value">{stats.totalTrips}</div>
          </div>
          <div className="stat-card secondary">
            <div className="stat-icon">💰</div>
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">₱{stats.totalSpent.toFixed(2)}</div>
          </div>
          <div className="stat-card tertiary">
            <div className="stat-icon">🎯</div>
            <div className="stat-label">Budget</div>
            <div className="stat-value">₱{stats.totalBudget.toFixed(2)}</div>
          </div>
          <div className="stat-card quaternary">
            <div className="stat-icon">🏷️</div>
            <div className="stat-label">Total Expenses</div>
            <div className="stat-value">{stats.totalExpenses}</div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="additional-metrics">
          <div className="metric-item">
            <span className="metric-label">Budget Utilized:</span>
            <span className="metric-value">{stats.budgetUtilization}%</span>
            <div className="metric-bar" style={{ width: `${Math.min(stats.budgetUtilization, 100)}%` }}></div>
          </div>
          <div className="metric-item">
            <span className="metric-label">Remaining Budget:</span>
            <span className={`metric-value ${stats.remaining < 0 ? 'over-budget' : ''}`}>
              ₱{stats.remaining.toFixed(2)}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Avg Expense per Trip:</span>
            <span className="metric-value">₱{stats.avgExpensePerTrip}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Avg Expense Cost:</span>
            <span className="metric-value">₱{stats.avgExpenseCost}</span>
          </div>
        </div>

        {/* Charts Section */}
        {stats.categoryChartData.length > 0 && (
          <div className="charts-section">
            <div className="chart-container">
              <h4>Spending by Category</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ₱${value.toFixed(0)}`}
                  >
                    {stats.categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a'][index % 7]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₱${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="breakdown-table">
              <h4>Category Breakdown</h4>
              <div className="breakdown-list">
                {stats.categoryChartData.map((item, idx) => (
                  <div key={idx} className="breakdown-item">
                    <span className="breakdown-name">{item.name}</span>
                    <span className="breakdown-amount">₱{item.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
