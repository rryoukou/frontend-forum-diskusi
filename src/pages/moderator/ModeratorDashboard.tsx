import React, { useEffect, useState } from 'react';
import ModeratorLayout from '../../layouts/ModeratorLayout';
import moderationService from '../../services/moderationService';

const ModeratorDashboard: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await moderationService.getReports();
      setReports(data.data);
    } catch (err) {
      console.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string, status: 'resolved' | 'dismissed') => {
    try {
      await moderationService.resolveReport(id, status);
      fetchReports();
    } catch (err) {
      alert('Failed to resolve report');
    }
  };

  return (
    <ModeratorLayout>
      <h1>Moderator Panel</h1>
      <p>Welcome to the moderation area. You can manage reports and logs here.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Pending Reports</h3>
        {loading ? <p>Loading reports...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {reports.length === 0 ? <p>No pending reports.</p> : reports.map(report => (
              <div key={report.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Type: {report.reportable_type}</strong>
                  <span style={{ color: 'red' }}>Reason: {report.reason}</span>
                </div>
                <p style={{ margin: '0.5rem 0' }}>Reported by: {report.reporter?.username}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button onClick={() => handleResolve(report.id, 'resolved')} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px' }}>
                    Mark Resolved
                  </button>
                  <button onClick={() => handleResolve(report.id, 'dismissed')} style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px' }}>
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModeratorLayout>
  );
};

export default ModeratorDashboard;
