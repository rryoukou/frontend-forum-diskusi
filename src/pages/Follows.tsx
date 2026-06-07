import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Layout from '../layouts/Layout';
import userService from '../services/userService';
import type { User } from '../types/index';

const Follows: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const isFollowers = location.pathname.includes('followers');

  useEffect(() => {
    const fetchFollows = async () => {
      if (!username) return;
      try {
        const data = isFollowers 
          ? await userService.getFollowers(username)
          : await userService.getFollowing(username);
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch follows');
      } finally {
        setLoading(false);
      }
    };
    fetchFollows();
  }, [username, isFollowers]);

  return (
    <Layout>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <Link to={`/profiles/${username}`} style={{ textDecoration: 'none', color: 'var(--primary-color)', fontSize: '0.875rem' }}>
            ← Back to {username}'s Profile
          </Link>
          <h1 style={{ marginTop: 'var(--spacing-2)' }}>
            {isFollowers ? 'Followers' : 'Following'}
          </h1>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading list...</div>
        ) : users.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            No users found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            {users.map(user => (
              <div key={user.id} className="card" style={{ padding: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--primary-color)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 'bold'
                }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <Link to={`/profiles/${user.username}`} style={{ fontWeight: 'bold', fontSize: '1.1rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
                    {user.username}
                  </Link>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {user.reputation_points} reputation • Level {user.level}
                  </div>
                </div>
                <Link to={`/profiles/${user.username}`} className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Follows;
