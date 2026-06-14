import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import userService from '../services/userService';
import authService from '../services/authService';
import type { User } from '../types/index';
import { ArrowLeft, Users, UserPlus, UserCheck, Star, Trophy, Search } from 'lucide-react';
import '../App.css';
import './Follows.css';

const Follows: React.FC = () => {
  const { username }     = useParams<{ username: string }>();
  const location         = useLocation();
  const navigate         = useNavigate();
  const currentUser      = authService.getCurrentUser();

  const isFollowersTab   = location.pathname.includes('followers');

  const [followers, setFollowers]     = useState<User[]>([]);
  const [following, setFollowing]     = useState<User[]>([]);
  const [following_ids, setFollowingIds] = useState<Set<string>>(new Set());
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [flrs, flng] = await Promise.all([
          userService.getFollowers(username),
          userService.getFollowing(username),
        ]);
        setFollowers(Array.isArray(flrs) ? flrs : []);
        setFollowing(Array.isArray(flng) ? flng : []);

        // Build set of who current user is following (for follow button state)
        if (currentUser) {
          const myFollowing = await userService.getFollowing(currentUser.username);
          setFollowingIds(new Set(Array.isArray(myFollowing) ? myFollowing.map((u: User) => u.id) : []));
        }
      } catch { console.error('Failed to fetch follows'); }
      finally { setLoading(false); }
    };

    fetchData();
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFollowToggle = async (targetUser: User) => {
    if (!currentUser) { navigate('/login'); return; }
    try {
      await userService.toggleFollow(targetUser.id);
      // Toggle locally for instant feedback
      setFollowingIds(prev => {
        const next = new Set(prev);
        if (next.has(targetUser.id)) next.delete(targetUser.id);
        else next.add(targetUser.id);
        return next;
      });
    } catch { console.error('Follow toggle failed'); }
  };

  const activeList   = isFollowersTab ? followers : following;
  const filtered     = activeList.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const switchTo = (tab: 'followers' | 'following') => {
    setSearch('');
    navigate(`/profiles/${username}/${tab}`);
  };

  return (
    <Layout>
      <div className="follows-page">

        {/* ── Back link ── */}
        <Link to={`/profiles/${username}`} className="follows-back-link">
          <ArrowLeft size={14} strokeWidth={2.5} />
          Back to {username}'s profile
        </Link>

        {/* ── Tabs ── */}
        <div className="follows-tabs">
          <button
            className={`follows-tab${isFollowersTab ? ' active' : ''}`}
            onClick={() => switchTo('followers')}
          >
            <Users size={14} strokeWidth={2.5} />
            Followers
            <span className="follows-tab-count">{followers.length}</span>
          </button>
          <button
            className={`follows-tab${!isFollowersTab ? ' active' : ''}`}
            onClick={() => switchTo('following')}
          >
            <UserCheck size={14} strokeWidth={2.5} />
            Following
            <span className="follows-tab-count">{following.length}</span>
          </button>
        </div>

        {/* ── Search ── */}
        {activeList.length > 0 && (
          <div className="follows-search-wrap">
            <Search size={14} strokeWidth={2} className="follows-search-icon" />
            <input
              type="text"
              placeholder={`Search ${isFollowersTab ? 'followers' : 'following'}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="follows-search-input"
            />
          </div>
        )}

        {/* ── List ── */}
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <Users size={48} strokeWidth={1.2} style={{ opacity: .3 }} />
            </span>
            <h3>
              {search
                ? `No results for "${search}"`
                : isFollowersTab
                  ? 'No followers yet'
                  : 'Not following anyone yet'}
            </h3>
            <p>
              {!search && (isFollowersTab
                ? 'Be the first to follow this user!'
                : 'Start exploring and connect with the community.')}
            </p>
          </div>
        ) : (
          <div className="follows-list">
            {filtered.map(u => {
              const isMe       = currentUser?.id === u.id;
              const isFollowed = following_ids.has(u.id);

              return (
                <div key={u.id} className="follows-user-card">
                  {/* Avatar */}
                  <Link to={`/profiles/${u.username}`} className="follows-user-avatar">
                    {u.avatar_url
                      ? <img src={u.avatar_url} alt={u.username} />
                      : u.username.charAt(0).toUpperCase()}
                  </Link>

                  {/* Info */}
                  <div className="follows-user-info">
                    <Link to={`/profiles/${u.username}`} className="follows-user-name">
                      {u.username}
                    </Link>
                    <div className="follows-user-meta">
                      <span className="follows-meta-chip">
                        <Trophy size={10} strokeWidth={2.5} /> Lv {u.level}
                      </span>
                      <span className="follows-meta-chip">
                        <Star size={10} strokeWidth={2.5} /> {u.reputation_points?.toLocaleString() ?? 0} pts
                      </span>
                      {u.roles?.map(r => (
                        <span key={r.id} className={`role-badge role-${r.name.toLowerCase()} follows-role-badge`}>
                          {r.name}
                        </span>
                      ))}
                    </div>
                    {u.bio && <p className="follows-user-bio">{u.bio}</p>}
                  </div>

                  {/* Action */}
                  <div className="follows-user-actions">
                    {!isMe && currentUser && (
                      <button
                        className={`btn btn-sm ${isFollowed ? 'btn-outline' : 'btn-primary'} follows-follow-btn`}
                        onClick={() => handleFollowToggle(u)}
                      >
                        {isFollowed
                          ? <><UserCheck size={13} strokeWidth={2.5} /> Following</>
                          : <><UserPlus  size={13} strokeWidth={2.5} /> Follow</>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Follows;
