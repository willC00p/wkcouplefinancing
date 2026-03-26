import React, { useState } from 'react';
import './ContributionForm.css';
import { BiSave, BiPlus } from 'react-icons/bi';
import { AiOutlineClose } from 'react-icons/ai';
import API_URL from '../config';

const ContributionForm = ({ onContributionAdded }) => {
  const [formData, setFormData] = useState({
    payer: 'Wayne',
    total_amount: '',
    number_of_people: 2,
    description: '',
    participants: ['Wayne', 'Kyla']
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'number_of_people' ? parseInt(value) : value
    }));
  };

  const handleParticipantChange = (index, value) => {
    const newParticipants = [...formData.participants];
    newParticipants[index] = value;
    setFormData(prev => ({
      ...prev,
      participants: newParticipants
    }));
  };

  const handleAddParticipant = () => {
    setFormData(prev => ({
      ...prev,
      number_of_people: prev.number_of_people + 1,
      participants: [...prev.participants, '']
    }));
  };

  const handleRemoveParticipant = (index) => {
    if (formData.participants.length > 1) {
      const newParticipants = formData.participants.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        number_of_people: prev.number_of_people - 1,
        participants: newParticipants
      }));
    }
  };

  const splitAmount = formData.total_amount ? (parseFloat(formData.total_amount) / formData.number_of_people).toFixed(2) : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.payer || !formData.total_amount || formData.participants.length === 0) {
      setMessage('Please fill in all required fields');
      return;
    }

    if (formData.participants.some(p => !p)) {
      setMessage('Please fill in all participant names');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payer: formData.payer,
          total_amount: parseFloat(formData.total_amount),
          number_of_people: formData.number_of_people,
          participants: formData.participants,
          description: formData.description
        })
      });

      if (!response.ok) throw new Error('Failed to add contribution');

      setMessage('Contribution added successfully!');
      setFormData({
        payer: 'Wayne',
        total_amount: '',
        number_of_people: 2,
        description: '',
        participants: ['Wayne', 'Kyla']
      });

      setTimeout(() => {
        setMessage('');
        onContributionAdded();
      }, 1000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      console.error('Error adding contribution:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contribution-form">
      <h3>Add New ABONO</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Payer (Who paid upfront) *</label>
            <select
              name="payer"
              value={formData.payer}
              onChange={handleChange}
              required
            >
              <option value="Wayne">Wayne</option>
              <option value="Kyla">Kyla</option>
            </select>
          </div>

          <div className="form-group">
            <label>Total Amount *</label>
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

          <div className="form-group">
            <label>Split Amount (Auto)</label>
            <input
              type="text"
              value={`₱${splitAmount}`}
              disabled
              className="disabled-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description (Optional)</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g., Dinner, Vacation costs"
          />
        </div>

        <div className="participants-section">
          <h4>Participants</h4>
          {formData.participants.map((participant, index) => (
            <div key={index} className="participant-row">
              <input
                type="text"
                value={participant}
                onChange={(e) => handleParticipantChange(index, e.target.value)}
                placeholder="Participant name"
                required
              />
              <span className="split-label">₱{splitAmount}</span>
              {formData.participants.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveParticipant(index)}
                  className="btn-remove"
                >
                  <AiOutlineClose size={20} />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddParticipant}
            className="btn-add-participant"
          >
            <BiPlus size={18} />
            <span>Add Participant</span>
          </button>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Adding...' : <>
            <BiSave size={18} />
            <span>Add Contribution</span>
          </>}
        </button>

        {message && <div className={`form-message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
      </form>
    </div>
  );
};

export default ContributionForm;
