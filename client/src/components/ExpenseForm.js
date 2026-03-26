import React, { useState } from 'react';
import './ExpenseForm.css';
import { BiSave } from 'react-icons/bi';
import { AiOutlineClose } from 'react-icons/ai';
import API_URL from '../config';

const ExpenseForm = ({ onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    particulars: '',
    deadline: '',
    pay_to: 'Wayne',
    total_amount: '',
    custom_payer: ''
  });

  const [showCustomPayer, setShowCustomPayer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'pay_to' && value === 'Others') {
      setShowCustomPayer(true);
    } else if (name === 'pay_to') {
      setShowCustomPayer(false);
      setFormData(prev => ({
        ...prev,
        custom_payer: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.particulars || !formData.deadline || !formData.total_amount) {
      setMessage('Please fill in all required fields');
      return;
    }

    if (formData.pay_to === 'Others' && !formData.custom_payer) {
      setMessage('Please enter the custom payer name');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formData.date,
          particulars: formData.particulars,
          deadline: formData.deadline,
          pay_to: formData.pay_to,
          total_amount: parseFloat(formData.total_amount),
          custom_payer: formData.custom_payer || null
        })
      });

      if (!response.ok) throw new Error('Failed to add expense');

      setMessage('Expense added successfully!');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        particulars: '',
        deadline: '',
        pay_to: 'Wayne',
        total_amount: '',
        custom_payer: ''
      });
      setShowCustomPayer(false);

      setTimeout(() => {
        setMessage('');
        onExpenseAdded();
      }, 1000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      console.error('Error adding expense:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-form">
      <h3>Add New UTANG</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description (Particulars) *</label>
            <input
              type="text"
              name="particulars"
              value={formData.particulars}
              onChange={handleChange}
              placeholder="e.g., Grocery shopping"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Deadline *</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Amount *</label>
            <input
              type="number"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Pay to*</label>
            <select
              name="pay_to"
              value={formData.pay_to}
              onChange={handleChange}
              required
            >
              <option value="Wayne">Wayne</option>
              <option value="Kyla">Kyla</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {showCustomPayer && (
            <div className="form-group">
              <label>Custom Name</label>
              <input
                type="text"
                name="custom_payer"
                value={formData.custom_payer}
                onChange={handleChange}
                placeholder="Enter name"
              />
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Adding...' : <>
            <BiSave size={18} />
            <span>Add Expense</span>
          </>}
        </button>

        {message && <div className={`form-message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}
      </form>
    </div>
  );
};

export default ExpenseForm;
