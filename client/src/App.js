import React, { useState } from 'react';
import './App.css';
import { AiOutlineDashboard, AiOutlineCreditCard, AiOutlineTeam, AiOutlineShoppingCart } from 'react-icons/ai';
import { FaPlane } from 'react-icons/fa';
import Dashboard from './components/Dashboard';
import DebtTracker from './components/DebtTracker';
import ExpenseTrackerNew from './components/ExpenseTrackerNew';
import ContributionTracker from './components/ContributionTracker';
import TripTracker from './components/TripTracker';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>WK Couple Finance Tracker</h1>
          <nav className="nav-menu">
            <button 
              className={currentPage === 'dashboard' ? 'nav-button active' : 'nav-button'}
              onClick={() => setCurrentPage('dashboard')}
              title="Dashboard"
            >
              <AiOutlineDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button 
              className={currentPage === 'expenses' ? 'nav-button active' : 'nav-button'}
              onClick={() => setCurrentPage('expenses')}
              title="Expenses"
            >
              <AiOutlineShoppingCart size={20} />
              <span>Expenses</span>
            </button>
            <button 
              className={currentPage === 'debts' ? 'nav-button active' : 'nav-button'}
              onClick={() => setCurrentPage('debts')}
              title="Debts"
            >
              <AiOutlineCreditCard size={20} />
              <span>UTANG</span>
            </button>
            <button 
              className={currentPage === 'contributions' ? 'nav-button active' : 'nav-button'}
              onClick={() => setCurrentPage('contributions')}
              title="Contributions"
            >
              <AiOutlineTeam size={20} />
              <span>ABONO</span>
            </button>
            <button 
              className={currentPage === 'trips' ? 'nav-button active' : 'nav-button'}
              onClick={() => setCurrentPage('trips')}
              title="Trip Expenses"
            >
              <FaPlane size={20} />
              <span>Trips</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {currentPage === 'dashboard' && <Dashboard refreshTrigger={refreshTrigger} />}
        {currentPage === 'expenses' && (
          <ExpenseTrackerNew onRefresh={handleRefresh} />
        )}
        {currentPage === 'debts' && (
          <DebtTracker onRefresh={handleRefresh} />
        )}
        {currentPage === 'contributions' && (
          <ContributionTracker onRefresh={handleRefresh} />
        )}
        {currentPage === 'trips' && (
          <TripTracker />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2026 Couple Finance Tracker</p>
      </footer>
    </div>
  );
}

export default App;
