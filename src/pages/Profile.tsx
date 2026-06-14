import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import userService from '../services/userService';
import postService from '../services/postService';
import authService from '../services/authService';
import moderationService from '../services/moderationService';
import type { User, Post } from '../types/index';
import { resolveAvatar } from '../utils/avatar';
import { useAppDispatch } from '../store/hooks';
import { setUser } from '../store/authSlice';
import {
  PenLine, UserPlus, UserCheck, AlertTriangle, Ban, ShieldCheck,
  Star, Target, CalendarDays, ThumbsUp, Eye, Medal, FileText,
} from 'lucide-react';
import './Profile.css';
import ModerationModal, { type ModerationActionType } from '../components/ModerationModal';

interface ModalState {
  isOpen: boolean;
  type: ModerationActionType;
}

const Profile: React.FC = () => {
  const { username }  = useParams<{ username: string }>();
  const [profile, setProfile]     = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading]     = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'warn',
  });

  const currentUser = authService.getCurrentUser();
  const dispatch = useAppDispatch();

  const fetchProfileData = async () => {
    if (!username) return;
    try {
      const pd = await userService.getProfile(username);
      setProfile(pd); setIsFollowing(pd.is_following || false);
      // Sync auth state when viewing own profile so sidebar/navbar stay up-to-date
      if (currentUser?.username === pd.username) {
        dispatch(setUser(pd));
      }
      const posts = await postService.getAllPosts({ username });
      setUserPosts(posts);
    } catch { console.error('Failed to fetch profile'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    const load = async () => {
      try {
        const pd = await userService.getProfile(username);
        const posts = await postService.getAllPosts({ username });
        if (!cancelled) {
          setProfile(pd);
          setIsFollowing(pd.is_following || false);
          if (currentUser?.username === pd.username) {
            dispatch(setUser(pd));
          }
          setUserPosts(posts);
        }
      } catch {
        console.error('Failed to fetch profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleFollowToggle = async () => {
    if (!currentUser) return alert('Please login to follow users');
    if (!profile) return;
    try { await userService.toggleFollow(profile.id); setIsFollowing(!isFollowing); const u = await userService.getProfile(username!); setProfile(u); } catch { /* */ }
  };

  const openModModal = (type: ModerationActionType) => {
    setModal({
      isOpen: true,
      type,
    });
  };

  const closeModModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleModConfirm = async (reason: string) => {
    if (!profile) return;
    const { type } = modal;
    
    try {
      if (type === 'warn') {
        await moderationService.warnUser(profile.id, reason);
      } else if (type === 'ban') {
        await moderationService.banUser(profile.id, reason);
        fetchProfileData();
      } else if (type === 'unban') {
        await moderationService.unbanUser(profile.id, reason);
        fetchProfileData();
      }
      closeModModal();
    } catch {
      alert(`Failed to ${type} user`);
      closeModModal();
    }
  };

  if (loading) return <Layout><div className="loading-spinner">Loading profile...</div></Layout>;
  if (!profile) return <Layout><div className="card">User not found.</div></Layout>;

  return (
    <Layout>
      <div className="profile-grid">
        {/* ── SIDEBAR ── */}
        <aside>
          <div className="profile-sidebar-card">
            <div className="profile-banner" />
            <div className="profile-avatar-wrap">
              <div className="avatar-large">
                {profile.avatar_url ? <img src={resolveAvatar(profile.avatar_url)!} alt="avatar" /> : profile.username[0].toUpperCase()}
              </div>
            </div>

            <div className="profile-body">
              <h2 className="profile-username">{profile.username}</h2>

              <div className="badge-container" style={{ justifyContent: 'center' }}>
                {profile.roles?.map(role => (
                  <span key={role.id} className={`role-badge role-${role.name.toLowerCase()}`}>{role.name}</span>
                ))}
              </div>

              {profile.is_banned && (
                <div className="banned-banner" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--sp-1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    <Ban size={14} strokeWidth={2.5} /> This account is currently banned
                  </div>
                  {profile.ban_reason && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      opacity: 0.9, 
                      padding: 'var(--sp-2)', 
                      background: 'rgba(0,0,0,0.1)', 
                      borderRadius: 'var(--radius-sm)',
                      width: '100%',
                      marginTop: 'var(--sp-1)',
                      borderLeft: '2px solid rgba(255,255,255,0.3)'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '2px', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason:</strong>
                      {profile.ban_reason}
                    </div>
                  )}
                </div>
              )}

              {currentUser?.username === profile.username ? (
                <div className="profile-actions">
                  <Link to="/profile/edit" className="btn btn-outline">
                    <PenLine size={14} strokeWidth={2.5} /> Edit Profile
                  </Link>
                </div>
              ) : currentUser && (
                <div className="profile-actions">
                  <button onClick={handleFollowToggle} className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`}>
                    {isFollowing
                      ? <><UserCheck  size={14} strokeWidth={2.5} /> Following</>
                      : <><UserPlus   size={14} strokeWidth={2.5} /> Follow</>}
                  </button>
                </div>
              )}

              {currentUser && authService.isModerator() && currentUser.id !== profile.id && (
                <div className="mod-actions">
                  <button onClick={() => openModModal('warn')}  className="mod-btn mod-btn-warn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <AlertTriangle size={12} strokeWidth={2.5} /> Warn
                  </button>
                  {profile.is_banned
                    ? <button onClick={() => openModModal('unban')} className="mod-btn mod-btn-unban" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <ShieldCheck size={12} strokeWidth={2.5} /> Unban
                      </button>
                    : <button onClick={() => openModModal('ban')}   className="mod-btn mod-btn-ban" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <Ban size={12} strokeWidth={2.5} /> Ban
                      </button>
                  }
                </div>
              )}

              <div className="follow-counter-row">
                <Link to={`/profiles/${profile.username}/followers`} className="follow-counter-item">
                  <span className="follow-count">{profile.followers_count || 0}</span>
                  <span className="follow-label">Followers</span>
                </Link>
                <Link to={`/profiles/${profile.username}/following`} className="follow-counter-item">
                  <span className="follow-count">{profile.following_count || 0}</span>
                  <span className="follow-label">Following</span>
                </Link>
                <div className="follow-counter-item" style={{ cursor: 'default' }}>
                  <span className="follow-count">{profile.posts_count || 0}</span>
                  <span className="follow-label">Posts</span>
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-label">Level</span>
                  <span className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Target size={13} strokeWidth={2.5} /> {profile.level}
                  </span>
                </div>
                <div className="stat-item stat-reputation">
                  <span className="stat-label">Reputation</span>
                  <span className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Star size={13} strokeWidth={2.5} /> {profile.reputation_points}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 'var(--sp-5)', textAlign: 'left' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--sp-2)' }}>About</p>
                <p style={{ color: 'var(--text-2)', fontSize: '0.9375rem', lineHeight: 1.65 }}>
                  {profile.bio || 'This user prefers to keep their secrets...'}
                </p>
              </div>

              {profile.badges && profile.badges.length > 0 && (
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--sp-3)' }}>Badges</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                    {profile.badges.map((badge: { id: string; name: string; description: string; icon_url?: string }) => (
                      <div key={badge.id} title={badge.description} style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--gradient-soft)', border: '1.5px solid var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'help' }}>
                        {badge.icon_url ? <img src={badge.icon_url} alt={badge.name} style={{ width: 22 }} /> : <Medal size={18} strokeWidth={2} style={{ color: 'var(--primary)' }} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── CONTRIBUTIONS ── */}
        <main>
          <div className="contributions-header">
            <h2 style={{ margin: 0 }}>Contributions</h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{userPosts.length} posts</span>
          </div>

          {userPosts.length === 0 ? (
            <div className="empty-contributions">
              <span className="empty-icon">
                <FileText size={48} strokeWidth={1.2} style={{ opacity: .3 }} />
              </span>
              <p>This user hasn't posted anything yet.</p>
            </div>
          ) : (
            userPosts.map(post => (
              <div key={post.id} className="contribution-card">
                <h3><Link to={`/posts/${post.id}`}>{post.title}</Link></h3>
                <div className="contribution-meta">
                  <span><CalendarDays size={11} strokeWidth={2.5} /> {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span><ThumbsUp size={11} strokeWidth={2.5} /> {post.vote_score} votes</span>
                  <span><Eye size={11} strokeWidth={2.5} /> {post.view_count} views</span>
                </div>
              </div>
            ))
          )}
        </main>
      </div>

      <ModerationModal
        isOpen={modal.isOpen}
        type={modal.type}
        username={profile.username}
        onClose={closeModModal}
        onConfirm={handleModConfirm}
      />
    </Layout>
  );
};

export default Profile;
