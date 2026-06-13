import React from 'react';
import ModeratorLayout from '../../layouts/ModeratorLayout';
import { ScrollText } from 'lucide-react';
import '../../App.css';

interface ModerationLog {
  id: number;
  action_type: string;
  created_at: string;
  reason: string;
  moderator?: {
    username: string;
  };
  target_user?: {
    username: string;
  };
  target_user_id?: number;
}

interface ModerationLogsViewProps {
  logs: ModerationLog[];
  loading: boolean;
}

const ACTION_STYLES: Record<string, { bg: string; color: string }> = {
  ban: { bg: 'var(--danger-light)', color: 'var(--danger)' },
  unban: { bg: 'var(--success-light)', color: 'var(--success)' },
  warning: { bg: 'var(--warning-light)', color: '#92400e' },
  resolve: { bg: 'var(--info-light)', color: '#1d4ed8' },
};

const ModerationLogsView: React.FC<ModerationLogsViewProps> = ({
  logs,
  loading,
}) => {
  return (
    <ModeratorLayout>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ margin: 0 }}>Moderation Logs</h1>
        <p
          style={{
            color: 'var(--text-3)',
            fontSize: '0.9rem',
            marginTop: 4,
          }}
        >
          Track all moderation actions performed in the community.
        </p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <span
            className="empty-state-icon"
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <ScrollText
              size={48}
              strokeWidth={1.2}
              style={{ opacity: 0.35 }}
            />
          </span>
          <h3>No logs yet</h3>
          <p>Moderation actions will appear here.</p>
        </div>
      ) : (
        <div className="admin-table-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Moderator</th>
                  <th>Action</th>
                  <th>Target User</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const style =
                    ACTION_STYLES[log.action_type?.toLowerCase()] || {
                      bg: 'var(--surface-3)',
                      color: 'var(--text-3)',
                    };

                  return (
                    <tr key={log.id}>
                      <td
                        style={{
                          color: 'var(--text-3)',
                          fontSize: '0.82rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString()
                          : '—'}
                      </td>

                      <td style={{ fontWeight: 700 }}>
                        {log.moderator?.username || 'Unknown'}
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.2rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            background: style.bg,
                            color: style.color,
                          }}
                        >
                          {log.action_type || 'unknown'}
                        </span>
                      </td>

                      <td style={{ fontWeight: 600 }}>
                        {log.target_user?.username ||
                          `ID: ${log.target_user_id || '—'}`}
                      </td>

                      <td
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-2)',
                          maxWidth: 280,
                        }}
                      >
                        {log.reason || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ModeratorLayout>
  );
};

export default ModerationLogsView;