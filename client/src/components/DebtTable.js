import React, { useState } from 'react';
import './DebtTable.css';
import { BiSave, BiX } from 'react-icons/bi';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { BsCheckCircle, BsClockHistory, BsExclamationCircle } from 'react-icons/bs';
import API_URL from '../config';
import PartialPayModal from './PartialPayModal';

const DebtTable = ({ debts, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [partialPayModalOpen, setPartialPayModalOpen] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  const handleEdit = (debt) => {
    setEditingId(debt.id);
    setEditData({ ...debt });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleSave = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) throw new Error('Failed to update debt');
      
      setEditingId(null);
      setEditData(null);
      onUpdate();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this debt?')) {
      try {
        const response = await fetch(`${API_URL}/api/expenses/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete debt');
        onDelete();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const handleOpenPartialPayModal = (debt) => {
    setSelectedDebtForPayment(debt);
    setPartialPayModalOpen(true);
  };

  const handleClosePartialPayModal = () => {
    setPartialPayModalOpen(false);
    setSelectedDebtForPayment(null);
  };

  const handleConfirmPartialPayment = async (paymentAmount) => {
    setPaymentLoading(true);
    try {
      const newPartialAmount = (selectedDebtForPayment.partial_amount_paid || 0) + paymentAmount;
      const totalAmount = selectedDebtForPayment.total_amount;
      const newStatus = newPartialAmount >= totalAmount ? 'paid' : 'partial';

      const response = await fetch(`${API_URL}/api/expenses/${selectedDebtForPayment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...selectedDebtForPayment,
          status: newStatus,
          partial_amount_paid: newPartialAmount
        })
      });

      if (!response.ok) throw new Error('Failed to update payment');

      handleClosePartialPayModal();
      onUpdate();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setPaymentLoading(false);
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

  return (
    <div className="debt-table-container">
      {/* Desktop Table View */}
      <table className="debt-table desktop-view">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Deadline</th>
            <th>Days Left</th>
            <th>Amount</th>
            <th>Paid By</th>
            <th>Status</th>
            <th>Partial Paid</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {debts.map(debt => (
            <tr key={debt.id} className={`row-${debt.status}`}>
              <td data-label="Date">
                {editingId === debt.id ? (
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                  />
                ) : (
                  debt.date
                )}
              </td>
              <td data-label="Description">
                {editingId === debt.id ? (
                  <input
                    type="text"
                    value={editData.particulars}
                    onChange={(e) => setEditData({ ...editData, particulars: e.target.value })}
                  />
                ) : (
                  debt.particulars
                )}
              </td>
              <td data-label="Deadline">
                {editingId === debt.id ? (
                  <input
                    type="date"
                    value={editData.deadline}
                    onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                  />
                ) : (
                  debt.deadline
                )}
              </td>
              <td data-label="Days Left" className={debt.days_remaining < 0 ? 'debt-overdue' : ''}>
                {debt.days_remaining < 0 ? `Overdue (${Math.abs(debt.days_remaining)}d)` : `${debt.days_remaining}d`}
              </td>
              <td data-label="Amount">
                {editingId === debt.id ? (
                  <input
                    type="number"
                    value={editData.total_amount}
                    onChange={(e) => setEditData({ ...editData, total_amount: parseFloat(e.target.value) })}
                    step="0.01"
                  />
                ) : (
                  formatCurrency(debt.total_amount)
                )}
              </td>
              <td data-label="Paid By">
                {editingId === debt.id ? (
                  <select
                    value={editData.pay_to}
                    onChange={(e) => setEditData({ ...editData, pay_to: e.target.value })}
                  >
                    <option value="Wayne">Wayne</option>
                    <option value="Kyla">Kyla</option>
                    <option value="Others">Others</option>
                  </select>
                ) : (
                  debt.custom_payer || debt.pay_to
                )}
              </td>
              <td data-label="Status">
                {editingId === debt.id ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                ) : (
                  <span className={`debt-status-badge status-${debt.status}`}>
                    {getStatusIcon(debt.status)}
                    <span>{debt.status.toUpperCase()}</span>
                  </span>
                )}
              </td>
              <td data-label="Partial Paid">
                {editingId === debt.id ? (
                  <input
                    type="number"
                    value={editData.partial_amount_paid}
                    onChange={(e) => setEditData({ ...editData, partial_amount_paid: parseFloat(e.target.value) })}
                    step="0.01"
                  />
                ) : (
                  <div className="debt-partial-pay-cell">
                    <span className="debt-partial-amount">{formatCurrency(debt.partial_amount_paid || 0)} / {formatCurrency(debt.total_amount)}</span>
                    <button 
                      className="debt-btn-partial-pay" 
                      onClick={() => handleOpenPartialPayModal(debt)}
                      title="Make Partial Payment"
                    >
                      Pay
                    </button>
                  </div>
                )}
              </td>
              <td data-label="Actions" className="debt-actions-cell">
                {editingId === debt.id ? (
                  <>
                    <button className="debt-btn-save" onClick={() => handleSave(debt.id)} title="Save">
                      <BiSave size={18} />
                    </button>
                    <button className="debt-btn-cancel" onClick={handleCancel} title="Cancel">
                      <BiX size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button className="debt-btn-partial-pay" onClick={() => handleOpenPartialPayModal(debt)} title="Make Partial Payment">
                      💰
                    </button>
                    <button className="debt-btn-edit" onClick={() => handleEdit(debt)} title="Edit">
                      <AiOutlineEdit size={16} />
                    </button>
                    <button className="debt-btn-delete" onClick={() => handleDelete(debt.id)} title="Delete">
                      <AiOutlineDelete size={16} />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="debt-cards mobile-view">
        {debts.map(debt => (
          <div key={debt.id} className={`debt-card status-${debt.status}`}>
            <div className="debt-card-header">
              <h4>{debt.particulars}</h4>
              <span className={`debt-status-badge status-${debt.status}`}>
                {getStatusIcon(debt.status)}
                <span>{debt.status.toUpperCase()}</span>
              </span>
            </div>

            {editingId === debt.id ? (
              <div className="debt-card-edit-form">
                <div className="debt-form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                  />
                </div>
                <div className="debt-form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={editData.particulars}
                    onChange={(e) => setEditData({ ...editData, particulars: e.target.value })}
                  />
                </div>
                <div className="debt-form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={editData.deadline}
                    onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                  />
                </div>
                <div className="debt-form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    value={editData.total_amount}
                    onChange={(e) => setEditData({ ...editData, total_amount: parseFloat(e.target.value) })}
                    step="0.01"
                  />
                </div>
                <div className="debt-form-group">
                  <label>Paid By</label>
                  <select
                    value={editData.pay_to}
                    onChange={(e) => setEditData({ ...editData, pay_to: e.target.value })}
                  >
                    <option value="Wayne">Wayne</option>
                    <option value="Kyla">Kyla</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="debt-form-group">
                  <label>Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="debt-form-group">
                  <label>Partial Amount Paid</label>
                  <input
                    type="number"
                    value={editData.partial_amount_paid}
                    onChange={(e) => setEditData({ ...editData, partial_amount_paid: parseFloat(e.target.value) })}
                    step="0.01"
                  />
                </div>
              </div>
            ) : (
              <div className="debt-card-body">
                <div className="debt-card-row">
                  <span className="debt-card-label">Date:</span>
                  <span className="debt-card-value">{debt.date}</span>
                </div>
                <div className="debt-card-row">
                  <span className="debt-card-label">Deadline:</span>
                  <span className="debt-card-value">{debt.deadline}</span>
                </div>
                <div className="debt-card-row">
                  <span className="debt-card-label">Days Left:</span>
                  <span className={`debt-card-value ${debt.days_remaining < 0 ? 'overdue' : ''}`}>
                    {debt.days_remaining < 0 ? `Overdue (${Math.abs(debt.days_remaining)}d)` : `${debt.days_remaining}d`}
                  </span>
                </div>
                <div className="debt-card-row">
                  <span className="debt-card-label">Amount:</span>
                  <span className="debt-card-value amount">{formatCurrency(debt.total_amount)}</span>
                </div>
                <div className="debt-card-row">
                  <span className="debt-card-label">Paid By:</span>
                  <span className="debt-card-value">{debt.custom_payer || debt.pay_to}</span>
                </div>
                <div className="debt-card-row">
                  <span className="debt-card-label">Partial Paid:</span>
                  <span className="debt-card-value">{formatCurrency(debt.partial_amount_paid || 0)} / {formatCurrency(debt.total_amount)}</span>
                </div>
              </div>
            )}

            <div className="debt-card-actions">
              {editingId === debt.id ? (
                <>
                  <button className="debt-btn-save" onClick={() => handleSave(debt.id)} title="Save">
                    <BiSave size={18} />
                    <span>Save</span>
                  </button>
                  <button className="debt-btn-cancel" onClick={handleCancel} title="Cancel">
                    <BiX size={18} />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="debt-btn-partial-pay" onClick={() => handleOpenPartialPayModal(debt)} title="Make Partial Payment">
                    <span>💰</span>
                    <span>Pay</span>
                  </button>
                  <button className="debt-btn-edit" onClick={() => handleEdit(debt)} title="Edit">
                    <AiOutlineEdit size={16} />
                    <span>Edit</span>
                  </button>
                  <button className="debt-btn-delete" onClick={() => handleDelete(debt.id)} title="Delete">
                    <AiOutlineDelete size={16} />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <PartialPayModal
        isOpen={partialPayModalOpen}
        expense={selectedDebtForPayment}
        onClose={handleClosePartialPayModal}
        onConfirm={handleConfirmPartialPayment}
        loading={paymentLoading}
      />
    </div>
  );
};

export default DebtTable;
