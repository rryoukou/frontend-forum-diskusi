import React from 'react';
import ModeratorLayout from '../../layouts/ModeratorLayout';
import { 
  ScrollText, 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  CheckSquare, 
  User, 
  UserCheck 
} from 'lucide-react';
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

// Skema warna aksen hijau sukses agar matching dengan dashboard utama
const ACTION_STYLES: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  ban: { 
    bg: 'rgba(239, 68, 68, 0.15)', 
    color: '#f87171', 
    icon: <ShieldAlert size={12} style={{ marginRight: 4 }} /> 
  },
  unban: { 
    bg: 'rgba(34, 197, 94, 0.15)', 
    color: '#4ade80', 
    icon: <ShieldCheck size={12} style={{ marginRight: 4 }} /> 
  },
  warning: { 
    bg: 'rgba(245, 158, 11, 0.15)', 
    color: '#fbbf24', 
    icon: <AlertCircle size={12} style={{ marginRight: 4 }} /> 
  },
  resolve: { 
    bg: 'rgba(16, 185, 129, 0.15)', 
    color: '#10b981', 
    icon: <CheckSquare size={12} style={{ marginRight: 4 }} /> 
  },
};

const ModerationLogsView: React.FC<ModerationLogsViewProps> = ({
  logs,
  loading,
}) => {
  return (
    <ModeratorLayout>
      {/* Header Halaman */}
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.025em' }}>Moderation Logs</h1>
        <p
          style={{
            color: 'var(--text-3)',
            fontSize: '0.9rem',
            marginTop: 6,
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
        <div className="admin-table-card" style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', background: '#0e0e10' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Moderator</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Action</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Target User</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => {
                  const actionKey = log.action_type?.toLowerCase() || 'unknown';
                  const style = ACTION_STYLES[actionKey] || {
                    bg: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-2)',
                    icon: null,
                  };

                  return (
                    <tr 
                      key={log.id} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
                      }}
                    >
                      {/* KOLOM TANGGAL */}
                      <td
                        style={{
                          padding: '16px',
                          color: 'var(--text-3)',
                          fontSize: '0.82rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                          : '—'}
                      </td>

                      {/* KOLOM MODERATOR */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
                            <UserCheck size={12} />
                          </div>
                          <span style={{ fontWeight: 700, color: '#e4e4e7' }}>
                            @{log.moderator?.username || 'Unknown'}
                          </span>
                        </div>
                      </td>

                      {/* KOLOM BADGE AKSI */}
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            background: style.bg,
                            color: style.color,
                          }}
                        >
                          {style.icon}
                          {log.action_type || 'unknown'}
                        </span>
                      </td>

                      {/* KOLOM TARGET USER */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-2)' }}>
                            <User size={12} />
                          </div>
                          <span style={{ fontWeight: 600, color: '#d4d4d8' }}>
                            {log.target_user?.username ? `@${log.target_user.username}` : `ID: ${log.target_user_id || '—'}`}
                          </span>
                        </div>
                      </td>

                      {/* KOLOM ALASAN */}
                      <td
                        style={{
                          padding: '16px',
                          fontSize: '0.875rem',
                          color: 'var(--text-2)',
                          maxWidth: 280,
                          lineHeight: '1.4',
                        }}
                      >
                        <span style={{ 
                          fontStyle: log.reason ? 'normal' : 'italic', 
                          color: log.reason ? 'var(--text-2)' : 'var(--text-3)' 
                        }}>
                          {log.reason || 'No reason provided.'}
                        </span>
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