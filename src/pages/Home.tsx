import React, { useEffect, useState } from 'react';
import postService from '../services/postService';
import categoryService from '../services/categoryService';
import tagService from '../services/tagService';
import interactionService from '../services/interactionService';
import reportService from '../services/reportService';
import authService from '../services/authService';
import type { Post, Category, Tag, User } from '../types/index';
import userService from '../services/userService';
import Layout from '../layouts/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthModal } from '../context/AuthModalContext';
import {
  PenLine, Search, User as UserIcon, FolderOpen, ThumbsUp, MessageCircle,
  Eye, Flame, Tag as TagIcon, MessageSquarePlus,
  ChevronUp, ChevronDown, Heart, Bookmark, Flag, Trophy, Medal,
} from 'lucide-react';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { openLogin, openRegister } = useAuthModal();
  const [posts, setPosts]             = useState<Post[]>([]);
  const [trendingPosts, setTrending]  = useState<Post[]>([]);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [tags, setTags]               = useState<Tag[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState<User[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const user = authService.getCurrentUser();

  const fetchPosts = async () => {
    const p = await postService.getAllPosts();
    setPosts(p);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, t, c, tg, lb] = await Promise.all([
          postService.getAllPosts(),
          postService.getTrendingPosts(),
          categoryService.getCategories(),
          tagService.getTags(),
          userService.getLeaderboard(),
        ]);
        setPosts(p); setTrending(t); setCategories(c); setTags(tg); setLeaderboardUsers(lb);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Untuk guest: buka modal login, untuk user: jalankan callback
  const requireLogin = (cb: () => void) => {
    if (!user) { openLogin(); return; }
    cb();
  };

  const handleVote = (postId: string, type: 'upvote' | 'downvote') =>
    requireLogin(async () => {
      try { await interactionService.vote(postId, 'post', type); await fetchPosts(); } catch { /* */ }
    });

  const handleLike = (postId: string) =>
    requireLogin(async () => {
      try { await interactionService.toggleLike(postId, 'post'); await fetchPosts(); } catch { /* */ }
    });

  const handleBookmark = (postId: string) =>
    requireLogin(async () => {
      try { await interactionService.toggleBookmark(postId); await fetchPosts(); } catch { /* */ }
    });

  const handleReport = (postId: string) =>
    requireLogin(async () => {
      const reason = window.prompt('Alasan melaporkan post ini?');
      if (!reason) return;
      try { await reportService.submitReport(postId, 'post', reason); alert('Laporan terkirim!'); } catch { /* */ }
    });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  if (loading) return <Layout><div className="loading-spinner">Loading discussions...</div></Layout>;

  return (
    <Layout>
      <div className="home-grid">
        {/* ── FEED ── */}
        <div className="posts-section">
          <div className="page-header">
            <div>
              <h1 style={{ margin: 0 }}>Recent Discussions</h1>
              <p className="page-header-sub">{posts.length} active threads</p>
            </div>
            {user ? (
              <Link to="/create-post" className="btn btn-primary">
                <PenLine size={15} strokeWidth={2.5} /> New Post
              </Link>
            ) : (
              <button className="btn btn-primary" onClick={openLogin}>
                <PenLine size={15} strokeWidth={2.5} /> New Post
              </button>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">
                <MessageSquarePlus size={48} strokeWidth={1.2} style={{ opacity: .35 }} />
              </span>
              <h3>No discussions yet</h3>
              <p>Be the first to start a discussion!</p>
              {user
                ? <Link to="/create-post" className="btn btn-primary">Start a Discussion</Link>
                : <button className="btn btn-primary" onClick={openLogin}>Start a Discussion</button>
              }
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-card-header">
                  {post.category && (
                    <Link to={`/categories/${post.category.slug}`} className="post-category-chip">
                      {post.category.name}
                    </Link>
                  )}
                </div>
                <h3 className="post-title">
                  <Link to={`/posts/${post.id}`}>{post.title}</Link>
                </h3>
                <p className="post-excerpt">{post.body}</p>

                {/* Meta row */}
                <div className="post-meta">
                  <span>
                    <UserIcon size={12} strokeWidth={2.5} />
                    <Link to={`/profiles/${post.user?.username}`} style={{ fontWeight: 700, color: 'var(--text-1)', marginLeft: 4 }}>
                      {post.user?.username || 'Unknown'}
                    </Link>
                  </span>
                  <span className="meta-pill">
                    <FolderOpen size={12} strokeWidth={2.5} /> {post.category?.name || 'Uncategorized'}
                  </span>
                  <span><MessageCircle size={12} strokeWidth={2.5} /> {post.comments_count || 0}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                    {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Action bar */}
                <div className="post-action-bar">
                  <div className="vote-control-sm">
                    <button className="vote-btn-sm" onClick={e => { e.preventDefault(); handleVote(post.id, 'upvote'); }}>
                      <ChevronUp size={14} strokeWidth={2.5} />
                    </button>
                    <span className="vote-score-sm">{post.vote_score ?? 0}</span>
                    <button className="vote-btn-sm" onClick={e => { e.preventDefault(); handleVote(post.id, 'downvote'); }}>
                      <ChevronDown size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                  <button className="post-action-btn-sm" onClick={e => { e.preventDefault(); handleLike(post.id); }}>
                    <Heart size={13} strokeWidth={2.5} /> {post.likes_count ?? 0} Likes
                  </button>
                  <button className="post-action-btn-sm" onClick={e => { e.preventDefault(); handleBookmark(post.id); }}>
                    <Bookmark size={13} strokeWidth={2.5} /> {post.bookmarks_count ?? 0} Saves
                  </button>
                  <button className="post-action-btn-sm post-action-btn-danger" onClick={e => { e.preventDefault(); handleReport(post.id); }}>
                    <Flag size={13} strokeWidth={2.5} /> Report
                  </button>
                  <span className="post-action-views">
                    <Eye size={12} strokeWidth={2} /> {post.view_count ?? 0} views
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── SIDEBAR KANAN ── */}
        <aside className="sidebar">
          {/* ── Leaderboard Card ── */}
          {leaderboardUsers.length > 0 && (
            <div className="sidebar-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
                <p className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                  <Trophy size={13} strokeWidth={2.5} style={{ color: '#f59e0b' }} /> Leaderboard
                </p>
                <Link to="/leaderboard" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                  View All
                </Link>
              </div>
              {/* Top 3 Podium Cards */}
              <div className="mini-podium-container">
                {/* 2nd Place */}
                {leaderboardUsers[1] && (
                  <div className="mini-podium-col rank-2" data-rank="2">
                    <div className="mini-podium-badge">
                      <Medal size={15} style={{ color: '#94a3b8' }} />
                    </div>
                    <div className="podium-avatar-wrap">
                      <div className="mini-podium-avatar">
                        {leaderboardUsers[1].avatar_url ? (
                          <img src={leaderboardUsers[1].avatar_url} alt={leaderboardUsers[1].username} />
                        ) : (
                          leaderboardUsers[1].username.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                    <Link to={`/profiles/${leaderboardUsers[1].username}`} className="mini-podium-name">
                      {leaderboardUsers[1].username}
                    </Link>
                    <span className="mini-podium-points">
                      {leaderboardUsers[1].reputation_points?.toLocaleString()} <span className="mini-podium-points-label">pts</span>
                    </span>
                  </div>
                )}

                {/* 1st Place */}
                {leaderboardUsers[0] && (
                  <div className="mini-podium-col rank-1" data-rank="1">
                    <div className="mini-podium-badge">
                      <Trophy size={17} style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="podium-avatar-wrap">
                      <span className="podium-crown">👑</span>
                      <div className="mini-podium-avatar">
                        {leaderboardUsers[0].avatar_url ? (
                          <img src={leaderboardUsers[0].avatar_url} alt={leaderboardUsers[0].username} />
                        ) : (
                          leaderboardUsers[0].username.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                    <Link to={`/profiles/${leaderboardUsers[0].username}`} className="mini-podium-name">
                      {leaderboardUsers[0].username}
                    </Link>
                    <span className="mini-podium-points">
                      {leaderboardUsers[0].reputation_points?.toLocaleString()} <span className="mini-podium-points-label">pts</span>
                    </span>
                  </div>
                )}

                {/* 3rd Place */}
                {leaderboardUsers[2] && (
                  <div className="mini-podium-col rank-3" data-rank="3">
                    <div className="mini-podium-badge">
                      <Medal size={14} style={{ color: '#f97316' }} />
                    </div>
                    <div className="podium-avatar-wrap">
                      <div className="mini-podium-avatar">
                        {leaderboardUsers[2].avatar_url ? (
                          <img src={leaderboardUsers[2].avatar_url} alt={leaderboardUsers[2].username} />
                        ) : (
                          leaderboardUsers[2].username.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                    <Link to={`/profiles/${leaderboardUsers[2].username}`} className="mini-podium-name">
                      {leaderboardUsers[2].username}
                    </Link>
                    <span className="mini-podium-points">
                      {leaderboardUsers[2].reputation_points?.toLocaleString()} <span className="mini-podium-points-label">pts</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Ranks 4+ List */}
              <div className="mini-leaderboard-list">
                {leaderboardUsers.slice(3, 5).map((u, i) => {
                  const rank = i + 4;
                  return (
                    <div key={u.id} className="mini-lb-item">
                      <span className="mini-lb-rank rank-other">
                        {rank}
                      </span>
                      <div className="mini-lb-avatar">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.username} />
                        ) : (
                          u.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <Link to={`/profiles/${u.username}`} className="mini-lb-username">
                        {u.username}
                      </Link>
                      <span className="mini-lb-points">
                        {u.reputation_points?.toLocaleString()} <span className="mini-lb-points-label">pts</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="sidebar-card">
            <p className="sidebar-title">Search</p>
            <form onSubmit={handleSearch} className="sidebar-search">
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="sidebar-search-btn">
                <Search size={15} strokeWidth={2} />
              </button>
            </form>
          </div>

          <div className="sidebar-card">
            <p className="sidebar-title">Categories</p>
            <ul className="category-list">
              <li><Link to="/" className="category-link active">All Categories</Link></li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/categories/${cat.slug}`} className="category-link">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {trendingPosts.length > 0 && (
            <div className="sidebar-card">
              <p className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Flame size={13} strokeWidth={2.5} /> Trending
              </p>
              {trendingPosts.map((post, i) => (
                <div key={post.id} className="trending-item">
                  <div className="trending-rank">#{i + 1}</div>
                  <Link to={`/posts/${post.id}`}>{post.title}</Link>
                  <div className="trending-meta">
                    <span><ThumbsUp size={11} strokeWidth={2.5} /> {post.vote_score}</span>
                    <span><MessageCircle size={11} strokeWidth={2.5} /> {post.comments_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tags.length > 0 && (
            <div className="sidebar-card">
              <p className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TagIcon size={13} strokeWidth={2.5} /> Popular Tags
              </p>
              <div className="tag-cloud">
                {tags.map(tag => (
                  <Link key={tag.id} to={`/search?q=${tag.name}`} className="tag-cloud-item">
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-card">
            <p className="sidebar-title">Community Stats</p>
            <div className="stats-grid">
              <div className="stat-chip">
                <span className="stat-chip-value">{posts.length}</span>
                <span className="stat-chip-label">Posts</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-value">{categories.length}</span>
                <span className="stat-chip-label">Categories</span>
              </div>
            </div>
          </div>

          {/* CTA khusus guest */}
          {!user && (
            <div className="sidebar-card guest-cta-card">
              <p className="sidebar-title">Join the Community</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: 'var(--sp-4)', lineHeight: 1.6 }}>
                Sign in to vote, comment, and post discussions.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={openLogin}
                >
                  Sign In
                </button>
                <button
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={openRegister}
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </Layout>
  );
};

export default Home;
