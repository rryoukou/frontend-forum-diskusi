import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import userService from '../services/userService';
import type { User } from '../types/index';
import './Home.css'; // Reusing some home styles for now

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await userService.getLeaderboard();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <Layout><div className="loading-spinner">Loading leaderboard...</div></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: 'var(--spacing-8)', textAlign: 'center' }}>Community Leaderboard</h1>
        
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: 'var(--spacing-4)', textAlign: 'left', width: '80px' }}>Rank</th>
                <th style={{ padding: 'var(--spacing-4)', textAlign: 'left' }}>User</th>
                <th style={{ padding: 'var(--spacing-4)', textAlign: 'right' }}>Reputation</th>
                <th style={{ padding: 'var(--spacing-4)', textAlign: 'right' }}>Level</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: 'var(--spacing-4)', fontWeight: 'bold', color: index < 3 ? 'var(--primary-color)' : 'inherit' }}>
                    #{index + 1}
                  </td>
                  <td style={{ padding: 'var(--spacing-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--primary-color)', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <Link to={`/profiles/${user.username}`} style={{ fontWeight: '600', textDecoration: 'none', color: 'var(--text-primary)' }}>
                        {user.username}
                      </Link>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--spacing-4)', textAlign: 'right', fontWeight: 'bold' }}>
                    {user.reputation_points.toLocaleString()}
                  </td>
                  <td style={{ padding: 'var(--spacing-4)', textAlign: 'right' }}>
                    <span className="role-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                      Lvl {user.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;
