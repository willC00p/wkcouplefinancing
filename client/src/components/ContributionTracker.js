import React, { useState, useEffect } from 'react';
import './ContributionTracker.css';
import API_URL from '../config';
import ContributionForm from './ContributionForm';
import ContributionTable from './ContributionTable';

const ContributionTracker = ({ onRefresh }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/contributions`);
      if (!response.ok) throw new Error('Failed to fetch contributions');
      const data = await response.json();
      setContributions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching contributions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContributionAdded = () => {
    fetchContributions();
    onRefresh();
  };

  const handleParticipantUpdated = () => {
    fetchContributions();
    onRefresh();
  };

  const handleContributionDeleted = () => {
    fetchContributions();
    onRefresh();
  };

  if (loading) return <div className="contribution-tracker"><p>Loading contributions...</p></div>;

  return (
    <div className="contribution-tracker">
      <div className="tracker-header">
        <h2>Contributions</h2>
        <p className="tracker-subtitle">Track shared costs and reimbursements</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <ContributionForm onContributionAdded={handleContributionAdded} />

      {contributions.length === 0 ? (
        <p className="no-data">No contributions yet. Create one to get started!</p>
      ) : (
        <ContributionTable 
          contributions={contributions}
          onUpdate={handleParticipantUpdated}
          onDelete={handleContributionDeleted}
        />
      )}
    </div>
  );
};

export default ContributionTracker;
