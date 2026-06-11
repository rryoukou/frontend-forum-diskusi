import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Layout from '../layouts/Layout';
import userService from '../services/userService';
import type { User } from '../types/index';
import { ArrowLeft, Users } from 'lucide-react';
import '../App.css';

const Follows: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const location     = useLocation();
  const [users, setUsers]     = useState<User[]>([]);
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
      } catch { console.error('Failed to fetch follows'); }
      finally { setLoading(false); }
    };
    fetchFollows();
  }, [username, isFollowers]);

  return (
    <Layout>
      <div className="follows-wrapper">
        <Link to={`/profiles/${username}`} className="follows-back">
          <ArrowLeft size={14} strokeWidth={2.5} /> Back to {username}'s profile
        </Link>
        <div className="follows-header">
          <h1>{isFollowers ? `${username}'s Followers` : `${username} is Following`}</h1>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading list...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <Users size={48} strokeWidth={1.2} style={{ opacity: .35 }} />
            </span>
            <h3>{isFollowers ? 'No followers yet' : 'Not following anyone yet'}</h3>
            <p>{isFollowers ? 'Be the first to follow this user!' : 'Start exploring the community.'}</p>
          </div>
        ) : (
          <div className="follows-list">
            {users.map(user => (
              <div key={user.id} className="follow-user-card">
                <div className="follow-user-avatar">
                  {user.avatar_url ? <img src={user.avatar_url} alt={user.username} /> : user.username.charAt(0).toUpperCase()}
                </div>
                <div className="follow-user-info">
                  <Link to={`/profiles/${user.username}`} className="follow-user-name">{user.username}</Link>
                  <span className="follow-user-meta">
                    {user.reputation_points?.toLocaleString()} reputation &nbsp;·&nbsp; Level {user.level}
                  </span>
                </div>
                <Link to={`/profiles/${user.username}`} className="btn btn-outline btn-sm">View Profile</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Follows;
