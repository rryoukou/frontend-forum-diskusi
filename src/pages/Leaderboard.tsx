import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import userService from '../services/userService';
import type { User } from '../types/index';
import { Trophy, Medal } from 'lucide-react';
import '../App.css';

/* Rank icon by position */
const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Trophy size={26} strokeWidth={1.8} style={{ color: '#f59e0b' }} />;
  if (rank === 2) return <Medal  size={24} strokeWidth={1.8} style={{ color: '#94a3b8' }} />;
  if (rank === 3) return <Medal  size={22} strokeWidth={1.8} style={{ color: '#f97316' }} />;
  return <span style={{ fontWeight: 800, color: 'var(--text-3)', fontSize: '0.95rem' }}>#{rank}</span>;
};

const Leaderboard: React.FC = () => {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const d = await userService.getLeaderboard();
        
        // Inject aesthetic dummy contributors if total list is < 16
        const mergedUsers = [...d];
        const remainingCount = 16 - mergedUsers.length;
        if (remainingCount > 0) {
          const now = new Date().toISOString();
          const dummyContributors: User[] = [
            { id: 'd1', username: 'max_verstappen', email: 'max@demo.com', bio: null, reputation_points: 1250, level: 12, avatar_url: '/avatar_1.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd2', username: 'lewis_hamilton', email: 'lewis@demo.com', bio: null, reputation_points: 1120, level: 11, avatar_url: '/avatar_2.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd3', username: 'charles_leclerc', email: 'charles@demo.com', bio: null, reputation_points: 980, level: 10, avatar_url: '/avatar_3.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd4', username: 'lando_norris', email: 'lando@demo.com', bio: null, reputation_points: 920, level: 9, avatar_url: '/avatar_4.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd5', username: 'oscar_piastri', email: 'oscar@demo.com', bio: null, reputation_points: 880, level: 9, avatar_url: '/avatar_5.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd6', username: 'carlos_sainz', email: 'carlos@demo.com', bio: null, reputation_points: 820, level: 8, avatar_url: '/avatar_6.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd7', username: 'george_russell', email: 'george@demo.com', bio: null, reputation_points: 790, level: 8, avatar_url: '/avatar_1.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd8', username: 'fernando_alonso', email: 'fernando@demo.com', bio: null, reputation_points: 710, level: 7, avatar_url: '/avatar_2.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd9', username: 'valtteri_bottas', email: 'valtteri@demo.com', bio: null, reputation_points: 620, level: 6, avatar_url: '/avatar_3.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd10', username: 'esteban_ocon', email: 'esteban@demo.com', bio: null, reputation_points: 580, level: 6, avatar_url: '/avatar_4.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd11', username: 'pierre_gasly', email: 'pierre@demo.com', bio: null, reputation_points: 510, level: 5, avatar_url: '/avatar_5.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd12', username: 'alex_albon', email: 'alex@demo.com', bio: null, reputation_points: 480, level: 5, avatar_url: '/avatar_6.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd13', username: 'yuki_tsunoda', email: 'yuki@demo.com', bio: null, reputation_points: 430, level: 4, avatar_url: '/avatar_1.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd14', username: 'daniel_ricciardo', email: 'daniel@demo.com', bio: null, reputation_points: 390, level: 4, avatar_url: '/avatar_2.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd15', username: 'nico_hulkenberg', email: 'nico@demo.com', bio: null, reputation_points: 350, level: 3, avatar_url: '/avatar_3.png', is_banned: false, created_at: now, updated_at: now },
            { id: 'd16', username: 'kevin_magnussen', email: 'kevin@demo.com', bio: null, reputation_points: 290, level: 3, avatar_url: '/avatar_4.png', is_banned: false, created_at: now, updated_at: now }
          ];
          const existingUsernames = new Set(mergedUsers.map(u => u.username));
          const filteredDummies = dummyContributors.filter(u => !existingUsernames.has(u.username));
          mergedUsers.push(...filteredDummies.slice(0, remainingCount));
        }

        // Sort by reputation points descending
        mergedUsers.sort((a, b) => (b.reputation_points || 0) - (a.reputation_points || 0));
        setUsers(mergedUsers);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <Layout><div className="loading-spinner">Loading leaderboard...</div></Layout>;

  // Empty state handling
  if (users.length === 0) {
    return (
      <Layout>
        <div className="leaderboard-wrapper">
          <div className="leaderboard-header">
            <h1>Community Leaderboard</h1>
            <p>Top contributors ranked by reputation points.</p>
          </div>
          <div className="leaderboard-table-card">
            <div className="empty-state" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
              <span className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <Trophy size={48} strokeWidth={1.2} style={{ opacity: .35, color: 'var(--primary)' }} />
              </span>
              <p>No users on the leaderboard yet.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const top10 = users.slice(0, 10);
  const podiumUsers = top10.slice(0, 3);
  /* Podium order: 2nd · 1st · 3rd */
  const podiumOrder = [podiumUsers[1], podiumUsers[0], podiumUsers[2]].filter(Boolean);
  const remainingTop10 = top10.slice(3);
  const rank11AndBelow = users.slice(10);

  return (
    <Layout>
      <div className="leaderboard-wrapper">
        <div className="leaderboard-header">
          <h1>Community Leaderboard</h1>
          <p>Top contributors ranked by reputation points.</p>
        </div>

        <div className="leaderboard-grid">
          {/* Left Column: Top 10 Contributors */}
          <div className="leaderboard-left">
            <h2 className="leaderboard-sec-title">
              <Trophy size={20} className="sec-icon" /> Top 10 Contributors
            </h2>

            {/* Podium for Top 3 */}
            {podiumUsers.length >= 2 && (
              <div className="leaderboard-podium">
                {podiumOrder.map((user) => {
                  if (!user) return null;
                  const actualRank = top10.findIndex((u) => u.id === user.id) + 1;
                  return (
                    <Link
                      key={user.id}
                      to={`/profiles/${user.username}`}
                      className={`podium-card rank-${actualRank}`}
                      data-rank={actualRank}
                    >
                      <span className="podium-rank-badge"><RankIcon rank={actualRank} /></span>
                      <div className="podium-avatar-wrap">
                        {actualRank === 1 && <span className="podium-crown">👑</span>}
                        <div className="podium-avatar">
                          {user.avatar_url ? <img src={user.avatar_url} alt={user.username} /> : user.username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <span className="podium-username">{user.username}</span>
                      <span className="podium-rep">{user.reputation_points?.toLocaleString()} pts</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Table for Ranks 4 to 10 */}
            {remainingTop10.length > 0 && (
              <div className="leaderboard-table-card">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>User</th>
                      <th>Reputation</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remainingTop10.map((user) => {
                      const actualRank = users.findIndex((u) => u.id === user.id) + 1;
                      return (
                        <tr key={user.id}>
                          <td>
                            <span className="lb-rank">
                              <RankIcon rank={actualRank} />
                            </span>
                          </td>
                          <td>
                            <div className="lb-user">
                              <div className="lb-avatar">
                                {user.avatar_url ? <img src={user.avatar_url} alt={user.username} /> : user.username.charAt(0).toUpperCase()}
                              </div>
                              <Link to={`/profiles/${user.username}`} className="lb-username">{user.username}</Link>
                            </div>
                          </td>
                          <td><span className="lb-rep">{user.reputation_points?.toLocaleString()}</span></td>
                          <td><span className="lb-level">Lvl {user.level}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column: Top 11 and Below */}
          <div className="leaderboard-right">
            <h2 className="leaderboard-sec-title">
              <Medal size={20} className="sec-icon" /> Rankings #11+
            </h2>

            <div className="leaderboard-table-card">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Reputation</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {rank11AndBelow.map((user) => {
                    const actualRank = users.findIndex((u) => u.id === user.id) + 1;
                    return (
                      <tr key={user.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--text-3)', fontSize: '0.85rem' }}>
                            #{actualRank}
                          </span>
                        </td>
                        <td>
                          <div className="lb-user">
                            <div className="lb-avatar">
                              {user.avatar_url ? <img src={user.avatar_url} alt={user.username} /> : user.username.charAt(0).toUpperCase()}
                            </div>
                            <Link to={`/profiles/${user.username}`} className="lb-username">{user.username}</Link>
                          </div>
                        </td>
                        <td><span className="lb-rep">{user.reputation_points?.toLocaleString()}</span></td>
                        <td><span className="lb-level">Lvl {user.level}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {rank11AndBelow.length === 0 && (
                <div className="empty-state" style={{ padding: 'var(--sp-6)' }}>
                  <p>Tidak ada kontributor lain di peringkat 11 ke bawah.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;

