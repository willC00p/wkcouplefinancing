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
      
      // Load expenses from localStorage
      const storedExpenses = localStorage.getItem('expenses');
      const expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
      
      // Calculate additional metrics from expenses
      const totalExpensesAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const expensesByCategory = {};
      const expensesByPayer = {};
      
      expenses.forEach(exp => {
        expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
        expensesByPayer[exp.paidBy] = (expensesByPayer[exp.paidBy] || 0) + exp.amount;
      });
      
      // Add expenses data to summary
      data.expenses = {
        ...data.expenses,
        fromExpenseTracker: {
          total: totalExpensesAmount,
          count: expenses.length,
          byCategory: expensesByCategory,
          byPayer: expensesByPayer,
          items: expenses
        }
      };
      
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

  // Get category icons for personal expenses
  const categoryIcons = {
    'food': '🍽️',
    'bills': '📄',
    'misc': '📦',
    'transport': '🚗',
    'entertainment': '🎬',
    'health': '⚕️',
    'utilities': '💡',
    'other': '📌'
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>💰 Financial Overview</h2>
          <p className="subtitle">Complete view of all your finances</p>
        </div>
        <button onClick={fetchDashboard} className="refresh-btn" title="Refresh">
          <BiRefresh size={22} />
        </button>
      </div>

      {/* Combined Summary Cards */}
      <div className="summary-cards">
        <div className="metric-card debts-total">
          <div className="metric-icon">🤝</div>
          <div className="metric-content">
            <p className="metric-label">Shared Debts (UTANG)</p>
            <p className="metric-value">{formatCurrency(summary.expenses.totalPaidAmount + summary.expenses.totalPartialAmount + summary.expenses.totalUnpaidAmount)}</p>
            <p className="metric-count">{summary.expenses.total} transactions</p>
          </div>
        </div>

        <div className="metric-card expenses-total">
          <div className="metric-icon">💳</div>
          <div className="metric-content">
            <p className="metric-label">Personal Expenses</p>
            <p className="metric-value">{formatCurrency(summary.expenses.fromExpenseTracker?.total || 0)}</p>
            <p className="metric-count">{summary.expenses.fromExpenseTracker?.count || 0} transactions</p>
          </div>
        </div>

        <div className="metric-card combined-total">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <p className="metric-label">Combined Total</p>
            <p className="metric-value">{formatCurrency((summary.expenses.totalPaidAmount + summary.expenses.totalPartialAmount + summary.expenses.totalUnpaidAmount) + (summary.expenses.fromExpenseTracker?.total || 0))}</p>
            <p className="metric-count">Overall spending</p>
          </div>
        </div>
      </div>

      {/* Shared Debts (UTANG) Summary */}
      <div className="section debts-section">
        <h3>🤝 UTANG (Shared Debts)</h3>
        <div className="status-cards">
          <div className="status-card paid">
            <div className="status-icon">✅</div>
            <div className="status-content">
              <p className="status-label">Paid</p>
              <p className="status-value">{summary.expenses.paid}</p>
              <p className="status-amount">{formatCurrency(summary.expenses.totalPaidAmount)}</p>
            </div>
          </div>
          <div className="status-card partial">
            <div className="status-icon">⏳</div>
            <div className="status-content">
              <p className="status-label">Partial</p>
              <p className="status-value">{summary.expenses.partial}</p>
              <p className="status-amount">{formatCurrency(summary.expenses.totalPartialAmount)}</p>
            </div>
          </div>
          <div className="status-card unpaid">
            <div className="status-icon">⚠️</div>
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

      {/* Personal Expenses Details */}
      {summary.expenses.fromExpenseTracker && summary.expenses.fromExpenseTracker.total > 0 && (
        <div className="section expenses-section">
          <h3>💳 Personal Expenses Breakdown</h3>
          <div className="status-cards">
            <div className="status-card">
              <div className="status-icon">💵</div>
              <div className="status-content">
                <p className="status-label">Total Spent</p>
                <p className="status-value">{formatCurrency(summary.expenses.fromExpenseTracker.total)}</p>
                <p className="status-count">{summary.expenses.fromExpenseTracker.count} transactions</p>
              </div>
            </div>
            <div className="status-card">
              <div className="status-icon">📈</div>
              <div className="status-content">
                <p className="status-label">Average per Transaction</p>
                <p className="status-value">{formatCurrency(summary.expenses.fromExpenseTracker.total / (summary.expenses.fromExpenseTracker.count || 1))}</p>
                <p className="status-count">Avg spend</p>
              </div>
            </div>
            <div className="status-card">
              <div className="status-icon">👤</div>
              <div className="status-content">
                <p className="status-label">Top Spender</p>
                <p className="status-value">
                  {Object.entries(summary.expenses.fromExpenseTracker.byPayer).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                </p>
                <p className="status-count">
                  {formatCurrency(Object.entries(summary.expenses.fromExpenseTracker.byPayer).sort((a, b) => b[1] - a[1])[0]?.[1] || 0)}
                </p>
              </div>
            </div>
          </div>
          
          {Object.keys(summary.expenses.fromExpenseTracker.byCategory).length > 0 && (
            <div className="expenses-breakdown">
              <h4>📊 Category Breakdown</h4>
              <div className="breakdown-list-advanced">
                {Object.entries(summary.expenses.fromExpenseTracker.byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const total = summary.expenses.fromExpenseTracker.total;
                    const percentage = ((amount / total) * 100).toFixed(1);
                    return (
                      <div key={category} className="breakdown-row-advanced">
                        <div className="breakdown-left">
                          <span className="category-icon">{categoryIcons[category] || '📌'}</span>
                          <div className="category-details">
                            <p className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</p>
                            <p className="category-pct">{percentage}%</p>
                          </div>
                        </div>
                        <div className="breakdown-chart">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                        <span className="category-amount">{formatCurrency(amount)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {Object.keys(summary.expenses.fromExpenseTracker.byPayer).length > 0 && (
            <div className="expenses-breakdown">
              <h4>👤 Payment Distribution</h4>
              <div className="payer-breakdown">
                {Object.entries(summary.expenses.fromExpenseTracker.byPayer).map(([payer, amount]) => {
                  const total = summary.expenses.fromExpenseTracker.total;
                  const percentage = ((amount / total) * 100).toFixed(1);
                  return (
                    <div key={payer} className="payer-row">
                      <span className="payer-name">{payer}</span>
                      <div className="payer-bar">
                        <div className="payer-fill" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="payer-amount">{formatCurrency(amount)}</span>
                    </div>
                  );
                })}
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
