import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import badgeService from '../services/badgeService';
import type { ReputationLog } from '../services/badgeService';

const ReputationHistory: React.FC = () => {
  const [logs, setLogs] = useState<ReputationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await badgeService.getReputationHistory();
        // Laravel pagination returns an object with a 'data' array
        setLogs(Array.isArray(data) ? data : (data as any).data || []);
      } catch (err) {
        console.error('Failed to fetch reputation history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: 'var(--spacing-8)' }}>Reputation History</h1>

        {loading ? (
          <div className="loading-spinner">Loading history...</div>
        ) : logs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--text-muted)' }}>
            You haven't earned any reputation points yet. Start contributing!
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: 'var(--spacing-4)', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: 'var(--spacing-4)', textAlign: 'left' }}>Reason</th>
                  <th style={{ padding: 'var(--spacing-4)', textAlign: 'right' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 'var(--spacing-4)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {new Date(log.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 'var(--spacing-4)', fontWeight: '500' }}>
                      {(log.action_type || 'Unknown Action').replace(/_/g, ' ').toUpperCase()}
                      {log.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginTop: 'var(--spacing-1)' }}>
                          {log.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: 'var(--spacing-4)', textAlign: 'right', fontWeight: 'bold', color: log.points > 0 ? '#059669' : '#ef4444' }}>
                      {log.points > 0 ? `+${log.points}` : log.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReputationHistory;
