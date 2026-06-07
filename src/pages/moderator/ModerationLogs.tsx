import React, { useEffect, useState } from 'react';
import ModeratorLayout from '../../layouts/ModeratorLayout';
import moderationService from '../../services/moderationService';

const ModerationLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await moderationService.getLogs();
        setLogs(data.data || data);
      } catch (err) {
        console.error('Failed to fetch moderation logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <ModeratorLayout>
      <h1>Moderation Logs</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-8)' }}>
        Track all moderation actions performed in the community.
      </p>

      {loading ? (
        <div className="loading-spinner">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          No moderation logs found.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: 'var(--spacing-4)', textAlign: 'left' }}>Date</th>
                <th style={{ padding: 'var(--spacing-4)', textAlign: 'left' }}>Moderator</th>
                <th style={{ padding: 'var(--spacing-4)', textAlign: 'left' }}>Action</th>
                <th style={{ padding: 'var(--spacing-4)', textAlign: 'left' }}>Target</th>
                <th style={{ padding: 'var(--spacing-4)', textAlign: 'left' }}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: 'var(--spacing-4)', fontSize: '0.875rem' }}>
                    {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
                  </td>
                  <td style={{ padding: 'var(--spacing-4)', fontWeight: 'bold' }}>
                    {log.moderator?.username || 'Unknown'}
                  </td>
                  <td style={{ padding: 'var(--spacing-4)' }}>
                    <span 
                      className={`role-badge role-${(log.action_type || '').toLowerCase()}`} 
                      style={{ 
                        backgroundColor: log.action_type === 'ban' ? '#fee2e2' : log.action_type === 'warning' ? '#fef3c7' : '#e0f2fe', 
                        color: log.action_type === 'ban' ? '#ef4444' : log.action_type === 'warning' ? '#b45309' : '#0369a1',
                        textTransform: 'capitalize'
                      }}
                    >
                      {log.action_type || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--spacing-4)' }}>
                    {log.target_user?.username || `ID: ${log.target_user_id || 'N/A'}`}
                  </td>
                  <td style={{ padding: 'var(--spacing-4)', fontSize: '0.875rem' }}>
                    {log.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ModeratorLayout>
  );
};

export default ModerationLogs;
