import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import badgeService from '../services/badgeService';
import type { ReputationLog } from '../services/badgeService';
import { useAppSelector } from '../store/hooks';
import {
  Star, ThumbsUp, MessageCircle, PenLine, Award, Calendar, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import './ReputationHistory.css';

const getLogIcon = (actionType: string) => {
  const type = actionType.toLowerCase();
  if (type.includes('vote')) return <ThumbsUp size={11} strokeWidth={2.5} />;
  if (type.includes('comment')) return <MessageCircle size={11} strokeWidth={2.5} />;
  if (type.includes('post')) return <PenLine size={11} strokeWidth={2.5} />;
  if (type.includes('badge')) return <Award size={11} strokeWidth={2.5} />;
  return <Star size={11} strokeWidth={2.5} />;
};

const ReputationHistory: React.FC = () => {
  const [logs, setLogs]       = useState<ReputationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user }              = useAppSelector((s) => s.auth);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await badgeService.getReputationHistory();
        setLogs(Array.isArray(data) ? data : (data as any).data || []);
      } catch {
        console.error('Failed to fetch reputation history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalPoints = logs.reduce((sum, l) => sum + (l.points || 0), 0);
  const positiveLogs = logs.filter(l => l.points > 0).length;

  return (
    <Layout>
      {loading ? (
        <div className="loading-spinner">Loading history...</div>
      ) : (
        <div className="reputation-container page-enter">
          {/* ── Left Column: Profile & Stats Dashboard ── */}
          <div className="reputation-hero">
            {user && (
              <div className="reputation-user-profile">
                <div className="reputation-user-avatar">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="reputation-user-details">
                  <span className="reputation-user-username">{user.username}</span>
                  <span className="reputation-user-level">Level {user.level}</span>
                </div>
              </div>
            )}

            <div className="reputation-score-box">
              <div className="reputation-score-value">{totalPoints.toLocaleString()}</div>
              <div className="reputation-score-label">Total Reputation</div>
            </div>

            <div className="reputation-mini-stats">
              <div className="reputation-stat-item">
                <span className="reputation-stat-val">{logs.length}</span>
                <span className="reputation-stat-lbl">Activities</span>
              </div>
              <div className="reputation-stat-item">
                <span className="reputation-stat-val" style={{ color: 'var(--primary)' }}>
                  {positiveLogs}
                </span>
                <span className="reputation-stat-lbl">Rewards</span>
              </div>
            </div>
          </div>

          {/* ── Right Column: Interactive Timeline ── */}
          <div className="reputation-main">
            <div className="reputation-title-area">
              <h2>Reputation History</h2>
              <p>Track how you have been earning and building credibility in the community.</p>
            </div>

            {logs.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Star size={48} strokeWidth={1.2} style={{ opacity: 0.35 }} />
                </span>
                <h3>No reputation yet</h3>
                <p>Start contributing to the community to earn points!</p>
              </div>
            ) : (
              <div className="reputation-timeline">
                {logs.map((log) => {
                  const isPositive = log.points > 0;
                  return (
                    <div key={log.id} className="timeline-item">
                      {/* Circle Icon Badge on the line */}
                      <span className={`timeline-badge ${isPositive ? 'positive' : 'negative'}`}>
                        {getLogIcon(log.action_type || '')}
                      </span>

                      {/* Content Card */}
                      <div className="timeline-content">
                        <div className="timeline-info">
                          <div className="timeline-reason">
                            {isPositive ? (
                              <ArrowUpRight size={14} style={{ color: 'var(--success)', minWidth: 14 }} />
                            ) : (
                              <ArrowDownLeft size={14} style={{ color: 'var(--danger)', minWidth: 14 }} />
                            )}
                            {(log.action_type || 'Unknown Action')
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </div>
                          {log.description && (
                            <div className="timeline-desc">{log.description}</div>
                          )}
                          <div className="timeline-date">
                            <Calendar size={12} style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} />
                            <span style={{ verticalAlign: 'middle' }}>
                              {new Date(log.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Point Change Indicator */}
                        <div className={`timeline-points ${isPositive ? 'positive' : 'negative'}`}>
                          {isPositive ? `+${log.points}` : log.points}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ReputationHistory;
