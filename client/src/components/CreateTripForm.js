import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import API_URL from '../config';
import './CreateTripForm.css';

function CreateTripForm({ onTripCreated, onClose }) {
  const [formData, setFormData] = useState({
    trip_name: '',
    start_date: '',
    end_date: '',
    destination: '',
    budget: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.trip_name.trim()) {
      setMessage('❌ Trip name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_name: formData.trip_name,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          destination: formData.destination || null,
          budget: formData.budget ? parseFloat(formData.budget) : null
        })
      });

      if (!response.ok) throw new Error('Failed to create trip');
      const newTrip = await response.json();
      
      setMessage('✅ Trip created successfully!');
      setFormData({ trip_name: '', start_date: '', end_date: '', destination: '', budget: '' });
      
      setTimeout(() => {
        onTripCreated(newTrip);
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
      <div className="modal-content create-trip-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Trip</h2>
          <button className="close-btn" onClick={onClose}>
            <AiOutlineClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-trip-form">
          <div className="form-group">
            <label>Trip Name *</label>
            <input
              type="text"
              name="trip_name"
              value={formData.trip_name}
              onChange={handleChange}
              placeholder="e.g., Summer Vacation 2026"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Destination</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="e.g., Boracay, Siargao"
            />
          </div>

          <div className="form-group">
            <label>Budget</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          {message && <div className={`form-message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTripForm;
