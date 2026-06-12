import React from 'react';
import ModeratorLayout from '../../layouts/ModeratorLayout';
import {
  FileText,
  CheckCircle2,
  BarChart3,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import '../../App.css';

interface ReportTarget {
  user_id: string;
  title?: string;
  body?: string;
  user?: {
    username: string;
    is_banned: boolean;
  };
}

interface Report {
  id: string;
  target_type: 'post' | 'comment';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  target?: ReportTarget;
  reporter?: {
    username: string;
  };
}

interface ModeratorDashboardViewProps {
  reports: Report[];
  loading: boolean;
  pendingCount: number;
  resolvedCount: number;
  handleResolve: (
    id: string,
    status: 'resolved' | 'dismissed'
  ) => Promise<void>;
  handleWarnUser: (
    userId: string,
    username: string
  ) => Promise<void>;
  handleBanUser: (
    userId: string,
    username: string
  ) => Promise<void>;
  handleUnbanUser: (
    userId: string,
    username: string
  ) => Promise<void>;
}

const ModeratorDashboardView: React.FC<ModeratorDashboardViewProps> = ({
  reports,
  loading,
  pendingCount,
  resolvedCount,
  handleResolve,
  handleWarnUser,
  handleBanUser,
  handleUnbanUser,
}) => {
  return (
    <ModeratorLayout>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ margin: 0 }}>Moderator Panel</h1>
        <p
          style={{
            color: 'var(--text-3)',
            fontSize: '0.9rem',
            marginTop: 4,
          }}
        >
          Review reports and keep the community healthy.
        </p>
      </div>

      <div
        className="admin-stats-grid"
        style={{ marginBottom: 'var(--sp-8)' }}
      >
        <div className="admin-stat-card danger">
          <span className="admin-stat-icon">
            <FileText
              size={28}
              strokeWidth={1.8}
              style={{ color: 'var(--danger)' }}
            />
          </span>
          <span
            className="admin-stat-value"
            style={{ color: 'var(--danger)' }}
          >
            {pendingCount}
          </span>
          <span className="admin-stat-label">
            Pending Reports
          </span>
        </div>

        <div className="admin-stat-card success">
          <span className="admin-stat-icon">
            <CheckCircle2
              size={28}
              strokeWidth={1.8}
              style={{ color: 'var(--success)' }}
            />
          </span>
          <span
            className="admin-stat-value"
            style={{ color: 'var(--success)' }}
          >
            {resolvedCount}
          </span>
          <span className="admin-stat-label">
            Resolved
          </span>
        </div>

        <div className="admin-stat-card">
          <span className="admin-stat-icon">
            <BarChart3
              size={28}
              strokeWidth={1.8}
              style={{ color: 'var(--primary)' }}
            />
          </span>
          <span className="admin-stat-value">
            {reports.length}
          </span>
          <span className="admin-stat-label">
            Total Reports
          </span>
        </div>
      </div>

      <div
        style={{
          marginBottom: 'var(--sp-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.05rem' }}>
          Pending Reports
        </h2>
      </div>

      {loading ? (
        <div className="loading-spinner">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <span
            className="empty-state-icon"
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2
              size={48}
              strokeWidth={1.2}
              style={{ opacity: 0.35 }}
            />
          </span>
          <h3>All clear!</h3>
          <p>No pending reports at the moment.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-4)',
          }}
        >
          {reports.map((report) => (
            <div
              key={report.id}
              className={`mod-report-card ${
                report.status === 'pending'
                  ? 'pending'
                  : 'resolved'
              }`}
            >
              <div className="mod-report-header">
                <div className="mod-report-title">
                  <span
                    style={{
                      textTransform: 'capitalize',
                      color: 'var(--text-3)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    {report.target_type} report
                  </span>

                  <div
                    style={{
                      color: 'var(--danger)',
                      fontWeight: 700,
                      marginTop: 2,
                    }}
                  >
                    Reason: {report.reason}
                  </div>
                </div>

                <span
                  className={`mod-status-badge ${
                    report.status || 'pending'
                  }`}
                >
                  {report.status || 'pending'}
                </span>
              </div>

              <div
                style={{
                  padding:
                    'var(--sp-3) var(--sp-4)',
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--radius)',
                  border:
                    '1.5px solid var(--border)',
                  marginBottom: 'var(--sp-4)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--text-3)',
                    marginBottom: 'var(--sp-2)',
                  }}
                >
                  Owner:{' '}
                  <span
                    style={{
                      color: 'var(--text-1)',
                    }}
                  >
                    {report.target?.user?.username ||
                      'Unknown'}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-1)',
                  }}
                >
                  {report.target_type === 'post' ? (
                    <span>
                      <strong>Title:</strong>{' '}
                      {report.target?.title}
                    </span>
                  ) : (
                    <span>
                      <strong>Comment:</strong>{' '}
                      {report.target?.body}
                    </span>
                  )}
                </div>

                {report.target?.user && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 'var(--sp-2)',
                      marginTop: 'var(--sp-3)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={() =>
                        handleWarnUser(
                          report.target!.user_id,
                          report.target!.user!.username
                        )
                      }
                      className="admin-action-btn warn"
                    >
                      <AlertTriangle
                        size={12}
                        strokeWidth={2.5}
                      />
                      Warn User
                    </button>

                    {report.target.user
                      .is_banned ? (
                      <button
                        onClick={() =>
                          handleUnbanUser(
                            report.target!.user_id,
                            report.target!.user!
                              .username
                          )
                        }
                        className="admin-action-btn unban"
                      >
                        <ShieldCheck
                          size={12}
                          strokeWidth={2.5}
                        />
                        Unban User
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleBanUser(
                            report.target!.user_id,
                            report.target!.user!
                              .username
                          )
                        }
                        className="admin-action-btn ban"
                      >
                        <ShieldAlert
                          size={12}
                          strokeWidth={2.5}
                        />
                        Ban User
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--sp-3)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-3)',
                  }}
                >
                  Reported by:{' '}
                  <strong
                    style={{
                      color: 'var(--text-2)',
                    }}
                  >
                    {report.reporter?.username}
                  </strong>
                </span>

                {report.status === 'pending' && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 'var(--sp-2)',
                    }}
                  >
                    <button
                      onClick={() =>
                        handleResolve(
                          report.id,
                          'dismissed'
                        )
                      }
                      className="admin-action-btn"
                      style={{
                        background:
                          'var(--surface-3)',
                        border:
                          '1.5px solid var(--border)',
                        color: 'var(--text-2)',
                      }}
                    >
                      Dismiss
                    </button>

                    <button
                      onClick={() =>
                        handleResolve(
                          report.id,
                          'resolved'
                        )
                      }
                      className="admin-action-btn unban"
                    >
                      <CheckCircle2
                        size={12}
                        strokeWidth={2.5}
                      />
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ModeratorLayout>
  );
};

export default ModeratorDashboardView;