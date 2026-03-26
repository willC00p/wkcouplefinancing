import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { BiRefresh } from 'react-icons/bi';
import { FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import API_URL from '../config';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const Dashboard = ({ refreshTrigger }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, [refreshTrigger]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/dashboard/summary`);
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      const data = await response.json();
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard"><p className="loading">Loading dashboard...</p></div>;
  if (error) return <div className="dashboard error-message">{error}</div>;
  if (!summary) return <div className="dashboard"><p>No data available</p></div>;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  // Prepare chart data
  const statusChartData = [
    {
      name: 'Paid',
      value: summary.expenses.totalPaidAmount
    },
    {
      name: 'Partial',
      value: summary.expenses.totalPartialAmount
    },
    {
      name: 'Unpaid',
      value: summary.expenses.totalUnpaidAmount
    }
  ];

  const expenseCountData = [
    {
      name: 'Paid',
      count: summary.expenses.paid
    },
    {
      name: 'Partial',
      count: summary.expenses.partial
    },
    {
      name: 'Unpaid',
      count: summary.expenses.unpaid
    }
  ];

  // Prepare breakdown data for who paid expenses and who contributed
  const expensesByPayerData = summary.transactions
    .filter(trans => trans.type === 'expense')
    .reduce((acc, trans) => {
      const existing = acc.find(item => item.name === trans.payer);
      if (existing) {
        existing.value += trans.amount;
      } else {
        acc.push({ name: trans.payer, value: trans.amount });
      }
      return acc;
    }, []);

  const contributionsByPayerData = summary.transactions
    .filter(trans => trans.type === 'contribution')
    .reduce((acc, trans) => {
      const existing = acc.find(item => item.name === trans.payer);
      if (existing) {
        existing.value += trans.amount;
      } else {
        acc.push({ name: trans.payer, value: trans.amount });
      }
      return acc;
    }, []);

  // Alternative approach: Get from summary if available
  const expensesByPayer = expensesByPayerData.length > 0 
    ? expensesByPayerData 
    : Object.entries(summary.expenses).length > 0
      ? Object.keys(summary.expenses)
          .filter(key => !['total', 'paid', 'partial', 'unpaid', 'totalPaidAmount', 'totalPartialAmount', 'totalUnpaidAmount'].includes(key))
          .map(payer => ({
            name: payer.charAt(0).toUpperCase() + payer.slice(1),
            value: summary.expenses[payer] || 0
          }))
      : [];

  const contributionsByPayer = contributionsByPayerData.length > 0
    ? contributionsByPayerData
    : [];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Financial Overview</h2>
          <p className="subtitle">Real-time tracking of expenses and contributions</p>
        </div>
        <button onClick={fetchDashboard} className="refresh-btn" title="Refresh">
          <BiRefresh size={22} />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="summary-cards">
        <div className="metric-card">
          <div className="metric-icon total">
            <FiClock size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Expenses</p>
            <p className="metric-value">{formatCurrency(summary.overallSummary.totalExpenses)}</p>
            <p className="metric-count">{summary.expenses.total} transactions</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon contribution">
            <FiCheckCircle size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Contributions</p>
            <p className="metric-value">{formatCurrency(summary.overallSummary.totalContributions)}</p>
            <p className="metric-count">{summary.contributions.total} contributions</p>
          </div>
        </div>

        <div className="metric-card alert">
          <div className="metric-icon outstanding">
            <FiAlertCircle size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Outstanding Amount</p>
            <p className="metric-value">{formatCurrency(summary.overallSummary.totalOutstanding)}</p>
            <p className="metric-count">Needs attention</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Expense Amount Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Expense Count by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseCountData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {expensesByPayer.length > 0 && (
          <div className="chart-container">
            <h3>Expenses by Payer</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByPayer}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByPayer.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {contributionsByPayer.length > 0 && (
          <div className="chart-container">
            <h3>Contributions by Payer</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contributionsByPayer}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contributionsByPayer.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Expenses Summary */}
      <div className="section">
        <h3>Shared Expenses</h3>
        <div className="status-cards">
          <div className="status-card paid">
            <div className="status-icon"><FiCheckCircle size={20} /></div>
            <div className="status-content">
              <p className="status-label">Paid</p>
              <p className="status-value">{summary.expenses.paid}</p>
              <p className="status-amount">{formatCurrency(summary.expenses.totalPaidAmount)}</p>
            </div>
          </div>
          <div className="status-card partial">
            <div className="status-icon"><FiClock size={20} /></div>
            <div className="status-content">
              <p className="status-label">Partial</p>
              <p className="status-value">{summary.expenses.partial}</p>
              <p className="status-amount">{formatCurrency(summary.expenses.totalPartialAmount)}</p>
            </div>
          </div>
          <div className="status-card unpaid">
            <div className="status-icon"><FiAlertCircle size={20} /></div>
            <div className="status-content">
              <p className="status-label">Unpaid</p>
              <p className="status-value">{summary.expenses.unpaid}</p>
              <p className="status-amount">{formatCurrency(summary.expenses.totalUnpaidAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contributions Summary */}
      <div className="section">
        <h3>Contributions</h3>
        <div className="status-cards">
          <div className="status-card partial">
            <div className="status-icon"><FiClock size={20} /></div>
            <div className="status-content">
              <p className="status-label">Pending Payments</p>
              <p className="status-value">{summary.contributions.participantsUnpaid}</p>
              <p className="status-amount">{formatCurrency(summary.contributions.totalUnpaidAmount)}</p>
            </div>
          </div>
          <div className="status-card">
            <div className="status-icon"><FiCheckCircle size={20} /></div>
            <div className="status-content">
              <p className="status-label">Completed</p>
              <p className="status-value">{summary.contributions.participantsPaid}</p>
              <p className="status-amount">{formatCurrency(summary.contributions.totalPaidAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Expenses Analytics */}
      {summary.trips && summary.trips.total > 0 && (
        <div className="section">
          <h3>✈️ Trip Expenses</h3>
          <div className="status-cards">
            <div className="status-card">
              <div className="status-icon"><FiCheckCircle size={20} /></div>
              <div className="status-content">
                <p className="status-label">Total Trips</p>
                <p className="status-value">{summary.trips.total}</p>
                <p className="status-amount">{summary.trips.totalExpenses} expenses</p>
              </div>
            </div>
            <div className="status-card">
              <div className="status-icon"><FiClock size={20} /></div>
              <div className="status-content">
                <p className="status-label">Total Spent</p>
                <p className="status-value">{formatCurrency(summary.trips.totalSpent)}</p>
                <p className="status-amount">{summary.trips.totalBudget > 0 ? `Budget: ${formatCurrency(summary.trips.totalBudget)}` : 'No budget set'}</p>
              </div>
            </div>
          </div>
          
          {Object.keys(summary.trips.byClassification).length > 0 && (
            <div className="trip-breakdown">
              <h4>Expenses by Category</h4>
              <div className="breakdown-list">
                {Object.entries(summary.trips.byClassification).map(([classification, amount]) => (
                  <div key={classification} className="breakdown-item">
                    <span className="classification">{classification.charAt(0).toUpperCase() + classification.slice(1)}</span>
                    <span className="amount">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(summary.trips.byPayer).length > 0 && (
            <div className="trip-breakdown">
              <h4>Paid By</h4>
              <div className="breakdown-list">
                {Object.entries(summary.trips.byPayer).map(([payer, amount]) => (
                  <div key={payer} className="breakdown-item">
                    <span className="payer">{payer}</span>
                    <span className="amount">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Outstanding Transactions */}
      {summary.transactions.length > 0 && (
        <div className="section">
          <h3>Outstanding Balances</h3>
          <div className="transactions-list">
            {summary.transactions.map((trans, idx) => (
              <div key={idx} className={`transaction-item ${trans.status}`}>
                <div className="trans-details">
                  <span className="trans-payer">{trans.payer}</span>
                  <span className="trans-type">• {trans.type}</span>
                </div>
                <div className="trans-right">
                  <span className="trans-amount">{formatCurrency(trans.amount)}</span>
                  <span className={`trans-status ${trans.status}`}>
                    {trans.status === 'unpaid' ? 'Unpaid' : 'Partial'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.transactions.length === 0 && (
        <div className="section">
          <p className="no-data">All expenses are settled! No outstanding balances.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
