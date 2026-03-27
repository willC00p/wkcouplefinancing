import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AiOutlinePlus, AiOutlineCalendar, AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import API_URL from '../config';
import './ExpenseTracker.css';

const ExpenseTracker = ({ onRefresh }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all'); // all, monthly, yearly
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7));
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'food',
    amount: '',
    paidBy: 'Wayne',
    notes: ''
  });

  const categories = [
    { id: 'food', label: 'Food', color: '#f59e0b', icon: '🍽️' },
    { id: 'bills', label: 'Monthly Bills', color: '#3b82f6', icon: '📄' },
    { id: 'misc', label: 'Miscellaneous', color: '#8b5cf6', icon: '📦' },
    { id: 'transport', label: 'Transport', color: '#10b981', icon: '🚗' },
    { id: 'entertainment', label: 'Entertainment', color: '#ec4899', icon: '🎬' },
    { id: 'health', label: 'Health', color: '#ef4444', icon: '⚕️' },
    { id: 'utilities', label: 'Utilities', color: '#06b6d4', icon: '💡' },
    { id: 'other', label: 'Other', color: '#6b7280', icon: '📌' }
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      // For now, use localStorage
      const stored = localStorage.getItem('expenses');
      setExpenses(stored ? JSON.parse(stored) : []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newExpense = {
        id: editingId || Date.now(),
        ...formData,
        amount: parseFloat(formData.amount),
        createdAt: editingId ? findExpenseById(editingId)?.createdAt : new Date().toISOString()
      };

      let updated;
      if (editingId) {
        updated = expenses.map(exp => exp.id === editingId ? newExpense : exp);
      } else {
        updated = [...expenses, newExpense];
      }

      setExpenses(updated);
      localStorage.setItem('expenses', JSON.stringify(updated));
      
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'food',
        amount: '',
        paidBy: 'Wayne',
        notes: ''
      });
      setEditingId(null);
      setShowForm(false);
      onRefresh?.();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const findExpenseById = (id) => expenses.find(exp => exp.id === id);

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setFormData({
      date: expense.date,
      description: expense.description,
      category: expense.category,
      amount: expense.amount.toString(),
      paidBy: expense.paidBy,
      notes: expense.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this expense?')) {
      const updated = expenses.filter(exp => exp.id !== id);
      setExpenses(updated);
      localStorage.setItem('expenses', JSON.stringify(updated));
      onRefresh?.();
    }
  };

  const getFilteredExpenses = () => {
    let filtered = expenses;

    if (filterPeriod === 'monthly') {
      filtered = filtered.filter(exp => exp.date.startsWith(selectedMonth));
    } else if (filterPeriod === 'yearly') {
      const year = selectedMonth.slice(0, 4);
      filtered = filtered.filter(exp => exp.date.startsWith(year));
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getChartData = () => {
    const filtered = getFilteredExpenses();
    const categoryTotals = {};
    
    categories.forEach(cat => {
      categoryTotals[cat.id] = {
        name: cat.label,
        value: 0,
        color: cat.color
      };
    });

    filtered.forEach(exp => {
      if (categoryTotals[exp.category]) {
        categoryTotals[exp.category].value += exp.amount;
      }
    });

    return Object.values(categoryTotals).filter(cat => cat.value > 0);
  };

  const getTotalsByCategory = () => {
    const filtered = getFilteredExpenses();
    const byCategory = {};

    filtered.forEach(exp => {
      if (!byCategory[exp.category]) {
        byCategory[exp.category] = 0;
      }
      byCategory[exp.category] += exp.amount;
    });

    return Object.entries(byCategory).map(([catId, total]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        label: cat?.label || catId,
        total,
        color: cat?.color || '#999'
      };
    }).sort((a, b) => b.total - a.total);
  };

  const filteredExpenses = getFilteredExpenses();
  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const chartData = getChartData();
  const categoryBreakdown = getTotalsByCategory();

  return (
    <div className="expense-tracker-new">
      <div className="tracker-header">
        <div>
          <h2>Expenses</h2>
          <p className="tracker-subtitle">Track your personal expenses</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          <AiOutlinePlus /> {showForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Period:</label>
          <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
            <option value="all">All Time</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          {filterPeriod !== 'all' && (
            <input
              type={filterPeriod === 'monthly' ? 'month' : 'year'}
              value={filterPeriod === 'yearly' ? selectedMonth.slice(0, 4) : selectedMonth}
              onChange={(e) => setFilterPeriod === 'yearly' 
                ? setSelectedMonth(e.target.value + '-01')
                : setSelectedMonth(e.target.value)
              }
            />
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="expense-form-container">
          <form onSubmit={handleAddExpense} className="expense-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Lunch at restaurant"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Paid By</label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                >
                  <option value="Wayne">Wayne</option>
                  <option value="Kyla">Kyla</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <button type="submit" className="btn-submit">
              {editingId ? 'Update Expense' : 'Add Expense'}
            </button>
          </form>
        </div>
      )}

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">₱{totalSpent.toFixed(2)}</div>
          <div className="stat-count">{filteredExpenses.length} transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average</div>
          <div className="stat-value">₱{filteredExpenses.length > 0 ? (totalSpent / filteredExpenses.length).toFixed(2) : '0.00'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Top Category</div>
          <div className="stat-value">{categoryBreakdown[0]?.label || 'N/A'}</div>
          <div className="stat-count">₱{categoryBreakdown[0]?.total.toFixed(2) || '0.00'}</div>
        </div>
      </div>

      {/* Visualizations */}
      <div className="visualizations">
        {chartData.length > 0 && (
          <div className="chart-container">
            <h4>Spending by Category</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ₱${value.toFixed(0)}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₱${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="breakdown-container">
          <h4>Category Breakdown</h4>
          <div className="breakdown-list">
            {categoryBreakdown.map(cat => (
              <div key={cat.id} className="breakdown-row">
                <span className="category-name">{cat.label}</span>
                <span className="category-amount">₱{cat.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length > 0 && (
        <div className="expenses-list-container">
          <h4>Recent Expenses</h4>
          <div className="expenses-list">
            {filteredExpenses.map(exp => {
              const cat = categories.find(c => c.id === exp.category);
              return (
                <div key={exp.id} className="expense-row">
                  <div className="expense-left">
                    <span className="expense-icon">{cat?.icon}</span>
                    <div className="expense-info">
                      <p className="expense-desc">{exp.description}</p>
                      <p className="expense-meta">{exp.date} • {cat?.label} • {exp.paidBy}</p>
                    </div>
                  </div>
                  <div className="expense-right">
                    <span className="expense-amount">₱{exp.amount.toFixed(2)}</span>
                    <div className="expense-actions">
                      <button onClick={() => handleEdit(exp)} className="btn-edit" title="Edit">
                        <AiOutlineEdit />
                      </button>
                      <button onClick={() => handleDelete(exp.id)} className="btn-delete" title="Delete">
                        <AiOutlineDelete />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredExpenses.length === 0 && (
        <div className="empty-state">
          <p>No expenses for this period. Start tracking!</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
