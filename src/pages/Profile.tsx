import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import userService from '../services/userService';
import postService from '../services/postService';
import authService from '../services/authService';
import type { User, Post } from '../types/index';
import './Profile.css';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const currentUser = authService.getCurrentUser();

  const fetchProfileData = async () => {
    if (!username) return;
    try {
      const profileData = await userService.getProfile(username);
      setProfile(profileData);
      setIsFollowing(profileData.is_following || false);
      
      // Fetch user posts
      const postsData = await postService.getAllPosts({ username });
      setUserPosts(postsData);
    } catch (err) {
      console.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!currentUser) return alert('Please login to follow users');
    if (!profile) return;
    try {
      await userService.toggleFollow(profile.id);
      setIsFollowing(!isFollowing);
      // Optional: Refresh profile to get updated follower count
      const updatedProfile = await userService.getProfile(username!);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to toggle follow');
    }
  };

  if (loading) return <Layout><div className="loading-spinner">Loading profile...</div></Layout>;
  if (!profile) return <Layout><div className="card">User not found.</div></Layout>;

  return (
    <Layout>
      <div className="profile-grid">
        {/* Sidebar: Profile Info */}
        <aside>
          <div className="card profile-sidebar-card">
            <div className="avatar-large">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                profile.username[0].toUpperCase()
              )}
            </div>
            <h2 className="profile-username">{profile.username}</h2>
            
            <div className="badge-container" style={{ justifyContent: 'center', marginBottom: 'var(--spacing-4)' }}>
              {profile.roles?.map(role => (
                <span key={role.id} className={`role-badge role-${role.name.toLowerCase()}`}>
                  {role.name}
                </span>
              ))}
            </div>

            {currentUser && currentUser.username === profile.username ? (
              <Link to="/profile/edit" className="btn btn-outline" style={{ width: '100%', marginBottom: 'var(--spacing-4)' }}>
                Edit Profile
              </Link>
            ) : currentUser && (
              <button 
                onClick={handleFollowToggle} 
                className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                style={{ width: '100%', marginBottom: 'var(--spacing-4)' }}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-label">Level</span>
                <span className="stat-value">{profile.level}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Reputation</span>
                <span className="stat-value">{profile.reputation_points}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 'var(--spacing-4)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-4)' }}>
              <Link to={`/profiles/${profile.username}/followers`} style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontWeight: 'bold' }}>{profile.followers_count || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Followers</div>
              </Link>
              <Link to={`/profiles/${profile.username}/following`} style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontWeight: 'bold' }}>{profile.following_count || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Following</div>
              </Link>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold' }}>{profile.posts_count || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Posts</div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-2)' }}>About</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {profile.bio || 'This user prefers to keep their secrets...'}
              </p>
            </div>

            {profile.badges && profile.badges.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-3)' }}>Badges</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
                  {profile.badges.map((badge: any) => (
                    <div key={badge.id} title={badge.description} style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '8px', 
                      backgroundColor: '#f3f4f6', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      cursor: 'help'
                    }}>
                      {badge.icon_url ? <img src={badge.icon_url} alt={badge.name} style={{ width: '24px' }} /> : '🏅'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content: User Posts */}
        <main>
          <h2 style={{ marginBottom: 'var(--spacing-6)' }}>Contributions</h2>
          <div className="user-posts-list">
            {userPosts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                This user hasn't posted anything yet.
              </div>
            ) : (
              userPosts.map(post => (
                <div key={post.id} className="card" style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-4)' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-2)' }}>
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                  </h3>
                  <div style={{ display: 'flex', gap: 'var(--spacing-4)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <span>📅 {new Date(post.created_at).toLocaleDateString()}</span>
                    <span>👍 {post.vote_score} votes</span>
                    <span>👁️ {post.view_count} views</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Profile;
