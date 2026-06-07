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

  const handleWarnUser = async (userId: string, username: string) => {
    const reason = window.prompt(`Enter warning reason for user @${username}:`);
    if (!reason) return;
    try {
      await moderationService.warnUser(userId, reason);
      alert(`User @${username} has been warned.`);
    } catch (err) {
      alert('Failed to warn user');
    }
  };

  const handleBanUser = async (userId: string, username: string) => {
    const reason = window.prompt(`Enter BAN reason for user @${username}:`);
    if (!reason) return;
    if (!window.confirm(`Are you SURE you want to BAN user @${username}?`)) return;
    try {
      await moderationService.banUser(userId, reason);
      alert(`User @${username} has been BANNED.`);
    } catch (err) {
      alert('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string, username: string) => {
    const reason = window.prompt(`Enter UNBAN reason for user @${username}:`);
    if (!reason) return;
    try {
      await moderationService.unbanUser(userId, reason);
      alert(`User @${username} has been UNBANNED.`);
      fetchReports();
    } catch (err) {
      alert('Failed to unban user');
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>Type: {report.target_type}</strong>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', marginTop: '0.25rem' }}>Reason: {report.reason}</div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>ID: {report.id}</span>
                </div>
                
                <div style={{ margin: '1rem 0', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '4px', borderLeft: '4px solid #d1d5db' }}>
                  <div style={{ fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem' }}>
                    <strong>Target Owner: </strong> {report.target?.user?.username || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                    {report.target_type === 'post' ? (
                      <div><strong>Title:</strong> {report.target?.title}</div>
                    ) : (
                      <div><strong>Comment Content:</strong> {report.target?.body}</div>
                    )}
                  </div>
                  
                  {report.target?.user && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleWarnUser(report.target.user_id, report.target.user.username)}
                        style={{ backgroundColor: '#fff', color: '#b45309', border: '1px solid #fcd34d', padding: '2px 8px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        ⚠️ Warn User
                      </button>
                      {report.target.user.is_banned ? (
                        <button 
                          onClick={() => handleUnbanUser(report.target.user_id, report.target.user.username)}
                          style={{ backgroundColor: '#fff', color: '#1890ff', border: '1px solid #91d5ff', padding: '2px 8px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          🔓 Unban User
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleBanUser(report.target.user_id, report.target.user.username)}
                          style={{ backgroundColor: '#fff', color: '#ef4444', border: '1px solid #fca5a5', padding: '2px 8px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          🚫 Ban User
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Reported by: <strong>{report.reporter?.username}</strong></p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleResolve(report.id, 'dismissed')} style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px' }}>
                      Dismiss
                    </button>
                    <button onClick={() => handleResolve(report.id, 'resolved')} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px' }}>
                      Mark Resolved
                    </button>
                  </div>
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
