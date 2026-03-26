import React, { useState } from 'react';
import './ExpenseTable.css';
import { BiSave, BiX } from 'react-icons/bi';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { BsCheckCircle, BsClockHistory, BsExclamationCircle } from 'react-icons/bs';
import API_URL from '../config';
import PartialPayModal from './PartialPayModal';

const ExpenseTable = ({ expenses, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [partialPayModalOpen, setPartialPayModalOpen] = useState(false);
  const [selectedExpenseForPayment, setSelectedExpenseForPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setEditData({ ...expense });
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

      if (!response.ok) throw new Error('Failed to update expense');
      
      setEditingId(null);
      setEditData(null);
      onUpdate();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const response = await fetch(`${API_URL}/api/expenses/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete expense');
        onDelete();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const handleOpenPartialPayModal = (expense) => {
    setSelectedExpenseForPayment(expense);
    setPartialPayModalOpen(true);
  };

  const handleClosePartialPayModal = () => {
    setPartialPayModalOpen(false);
    setSelectedExpenseForPayment(null);
  };

  const handleConfirmPartialPayment = async (paymentAmount) => {
    setPaymentLoading(true);
    try {
      const newPartialAmount = (selectedExpenseForPayment.partial_amount_paid || 0) + paymentAmount;
      const totalAmount = selectedExpenseForPayment.total_amount;
      const newStatus = newPartialAmount >= totalAmount ? 'paid' : 'partial';

      const response = await fetch(`${API_URL}/api/expenses/${selectedExpenseForPayment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...selectedExpenseForPayment,
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

  return (
    <div className="expense-table-container">
      {/* Desktop Table View */}
      <table className="expense-table desktop-view">
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
          {expenses.map(expense => (
            <tr key={expense.id} className={`row-${expense.status}`}>
              <td data-label="Date">
                {editingId === expense.id ? (
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                  />
                ) : (
                  expense.date
                )}
              </td>
              <td data-label="Description">
                {editingId === expense.id ? (
                  <input
                    type="text"
                    value={editData.particulars}
                    onChange={(e) => setEditData({ ...editData, particulars: e.target.value })}
                  />
                ) : (
                  expense.particulars
                )}
              </td>
              <td data-label="Deadline">
                {editingId === expense.id ? (
                  <input
                    type="date"
                    value={editData.deadline}
                    onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                  />
                ) : (
                  expense.deadline
                )}
              </td>
              <td data-label="Days Left" className={expense.days_remaining < 0 ? 'overdue' : ''}>
                {expense.days_remaining < 0 ? `Overdue (${Math.abs(expense.days_remaining)}d)` : `${expense.days_remaining}d`}
              </td>
              <td data-label="Amount">
                {editingId === expense.id ? (
                  <input
                    type="number"
                    value={editData.total_amount}
                    onChange={(e) => setEditData({ ...editData, total_amount: parseFloat(e.target.value) })}
                    step="0.01"
                  />
                ) : (
                  formatCurrency(expense.total_amount)
                )}
              </td>
              <td data-label="Paid By">
                {editingId === expense.id ? (
                  <select
                    value={editData.pay_to}
                    onChange={(e) => setEditData({ ...editData, pay_to: e.target.value })}
                  >
                    <option value="Wayne">Wayne</option>
                    <option value="Kyla">Kyla</option>
                    <option value="Others">Others</option>
                  </select>
                ) : (
                  expense.custom_payer || expense.pay_to
                )}
              </td>
              <td data-label="Status">
                {editingId === expense.id ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                ) : (
                  <span className={`status-badge status-${expense.status}`}>
                    {getStatusIcon(expense.status)}
                    <span>{expense.status.toUpperCase()}</span>
                  </span>
                )}
              </td>
              <td data-label="Partial Paid">
                {editingId === expense.id ? (
                  <input
                    type="number"
                    value={editData.partial_amount_paid}
                    onChange={(e) => setEditData({ ...editData, partial_amount_paid: parseFloat(e.target.value) })}
                    step="0.01"
                  />
                ) : (
                  <div className="partial-pay-cell">
                    <span className="partial-amount">{formatCurrency(expense.partial_amount_paid || 0)} / {formatCurrency(expense.total_amount)}</span>
                    <button 
                      className="btn-partial-pay" 
                      onClick={() => handleOpenPartialPayModal(expense)}
                      title="Make Partial Payment"
                    >
                      Pay
                    </button>
                  </div>
                )}
              </td>
              <td data-label="Actions" className="actions-cell">
                {editingId === expense.id ? (
                  <>
                    <button className="btn-save" onClick={() => handleSave(expense.id)} title="Save">
                      <BiSave size={18} />
                    </button>
                    <button className="btn-cancel" onClick={handleCancel} title="Cancel">
                      <BiX size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-partial-pay" onClick={() => handleOpenPartialPayModal(expense)} title="Make Partial Payment">
                      💰
                    </button>
                    <button className="btn-edit" onClick={() => handleEdit(expense)} title="Edit">
                      <AiOutlineEdit size={16} />
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(expense.id)} title="Delete">
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
      <div className="expense-cards mobile-view">
        {expenses.map(expense => (
          <div key={expense.id} className={`expense-card status-${expense.status}`}>
            <div className="card-header">
              <h4>{expense.particulars}</h4>
              <span className={`status-badge status-${expense.status}`}>
                {getStatusIcon(expense.status)}
                <span>{expense.status.toUpperCase()}</span>
              </span>
            </div>

            {editingId === expense.id ? (
              <div className="card-edit-form">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={editData.particulars}
                    onChange={(e) => setEditData({ ...editData, particulars: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={editData.deadline}
                    onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    value={editData.total_amount}
                    onChange={(e) => setEditData({ ...editData, total_amount: parseFloat(e.target.value) })}
                    step="0.01"
                  />
                </div>
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
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
              <div className="card-body">
                <div className="card-row">
                  <span className="card-label">Date:</span>
                  <span className="card-value">{expense.date}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Deadline:</span>
                  <span className="card-value">{expense.deadline}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Days Left:</span>
                  <span className={`card-value ${expense.days_remaining < 0 ? 'overdue' : ''}`}>
                    {expense.days_remaining < 0 ? `Overdue (${Math.abs(expense.days_remaining)}d)` : `${expense.days_remaining}d`}
                  </span>
                </div>
                <div className="card-row">
                  <span className="card-label">Amount:</span>
                  <span className="card-value amount">{formatCurrency(expense.total_amount)}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Paid By:</span>
                  <span className="card-value">{expense.custom_payer || expense.pay_to}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Partial Paid:</span>
                  <span className="card-value">{formatCurrency(expense.partial_amount_paid || 0)} / {formatCurrency(expense.total_amount)}</span>
                </div>
              </div>
            )}

            <div className="card-actions">
              {editingId === expense.id ? (
                <>
                  <button className="btn-save" onClick={() => handleSave(expense.id)} title="Save">
                    <BiSave size={18} />
                    <span>Save</span>
                  </button>
                  <button className="btn-cancel" onClick={handleCancel} title="Cancel">
                    <BiX size={18} />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-partial-pay" onClick={() => handleOpenPartialPayModal(expense)} title="Make Partial Payment">
                    <span>💰</span>
                    <span>Pay</span>
                  </button>
                  <button className="btn-edit" onClick={() => handleEdit(expense)} title="Edit">
                    <AiOutlineEdit size={16} />
                    <span>Edit</span>
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(expense.id)} title="Delete">
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
        expense={selectedExpenseForPayment}
        onClose={handleClosePartialPayModal}
        onConfirm={handleConfirmPartialPayment}
        loading={paymentLoading}
      />
    </div>
  );
};

export default ExpenseTable;
