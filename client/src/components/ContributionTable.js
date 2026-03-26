import React, { useState } from 'react';
import './ContributionTable.css';
import { BiX, BiSave } from 'react-icons/bi';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { BsCheckCircle, BsClockHistory, BsExclamationCircle } from 'react-icons/bs';
import API_URL from '../config';

const ContributionTable = ({ contributions, onUpdate, onDelete }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [editingParticipantId, setEditingParticipantId] = useState(null);
  const [editingParticipantData, setEditingParticipantData] = useState(null);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#4caf50';
      case 'partial':
        return '#ff9800';
      case 'unpaid':
        return '#f44336';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <BsCheckCircle size={16} />;
      case 'partial':
        return <BsClockHistory size={16} />;
      case 'unpaid':
        return <BsExclamationCircle size={16} />;
      default:
        return null;
    }
  };

  const handleEditParticipant = (participant) => {
    setEditingParticipantId(participant.id);
    setEditingParticipantData({ ...participant });
  };

  const handleSaveParticipant = async (contributionId, participantId) => {
    try {
      const response = await fetch(`${API_URL}/api/contributions/${contributionId}/participant/${participantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount_paid: parseFloat(editingParticipantData.amount_paid),
          status: editingParticipantData.status
        })
      });

      if (!response.ok) throw new Error('Failed to update participant');

      setEditingParticipantId(null);
      setEditingParticipantData(null);
      onUpdate();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteContribution = async (id) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      try {
        const response = await fetch(`${API_URL}/api/contributions/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete contribution');
        onDelete();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="contribution-table-container">
      {contributions.map(contrib => (
        <div key={contrib.id} className="contribution-card">
          <div className="contribution-header" onClick={() => setExpandedId(expandedId === contrib.id ? null : contrib.id)}>
            <div className="contribution-main">
              <h4>{contrib.payer} paid {formatCurrency(contrib.total_amount)}</h4>
              <p className="contribution-meta">{contrib.number_of_people} people • ₱{(contrib.split_amount).toFixed(2)} per person</p>
              {contrib.description && <p className="contribution-desc">{contrib.description}</p>}
            </div>
            <div className="contribution-actions">
              <button
                className="btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteContribution(contrib.id);
                }}
              >
                <AiOutlineDelete size={20} />
              </button>
              <span className="expand-icon">{expandedId === contrib.id ? '▼' : '▶'}</span>
            </div>
          </div>

          {expandedId === contrib.id && (
            <div className="contribution-details">
              <h5>Participants & Payments</h5>
              <div className="participants-list">
                {contrib.participants.map(participant => (
                  <div key={participant.id} className={`participant-card ${participant.status}`}>
                    {editingParticipantId === participant.id ? (
                      <div className="edit-participant">
                        <input
                          type="text"
                          value={editingParticipantData.name}
                          disabled
                          className="disabled"
                        />
                        <div className="edit-fields">
                          <input
                            type="number"
                            value={editingParticipantData.amount_paid}
                            onChange={(e) => setEditingParticipantData({
                              ...editingParticipantData,
                              amount_paid: e.target.value
                            })}
                            step="0.01"
                            placeholder="Amount paid"
                          />
                          <select
                            value={editingParticipantData.status}
                            onChange={(e) => setEditingParticipantData({
                              ...editingParticipantData,
                              status: e.target.value
                            })}
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="partial">Partial</option>
                            <option value="paid">Paid</option>
                          </select>
                        </div>
                        <div className="edit-actions">
                          <button
                            className="btn-save"
                            onClick={() => handleSaveParticipant(contrib.id, participant.id)}
                          >
                            <BiSave size={18} />
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => {
                              setEditingParticipantId(null);
                              setEditingParticipantData(null);
                            }}
                          >
                            <BiX size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="participant-info">
                        <div>
                          <p className="participant-name">{participant.name}</p>
                          <p className="participant-amount">
                            Due: {formatCurrency(participant.amount_due)} | Paid: {formatCurrency(participant.amount_paid)}
                          </p>
                          <p className="participant-remaining">
                            Remaining: {formatCurrency(Math.max(0, participant.amount_due - participant.amount_paid))}
                          </p>
                        </div>
                        <div className="participant-status">
                          <span className="status-badge" style={{ backgroundColor: getStatusColor(participant.status) }}>
                            {getStatusIcon(participant.status)}
                            <span>{participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}</span>
                          </span>
                          <button
                            className="btn-edit-participant"
                            onClick={() => handleEditParticipant(participant)}
                          >
                            <AiOutlineEdit size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContributionTable;
