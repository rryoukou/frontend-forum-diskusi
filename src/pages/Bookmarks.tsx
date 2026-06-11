import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import bookmarkService from '../services/bookmarkService';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Bookmark } from 'lucide-react';
import './Home.css';
import '../App.css';

const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try { const d = await bookmarkService.getMyBookmarks(); setBookmarks(d.data); }
      catch { console.error('Failed to fetch bookmarks'); }
      finally { setLoading(false); }
    };
    fetchBookmarks();
  }, []);

  return (
    <Layout>
      <div className="bookmarks-wrapper">
        <div className="bookmarks-header">
          <h1>My Bookmarks</h1>
          <p>Posts you've saved to read later.</p>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading bookmarks...</div>
        ) : bookmarks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <Bookmark size={48} strokeWidth={1.2} style={{ opacity: .35 }} />
            </span>
            <h3>Nothing saved yet</h3>
            <p>Bookmark interesting posts to find them here later.</p>
            <Link to="/" className="btn btn-primary">Discover Discussions</Link>
          </div>
        ) : (
          <div className="bookmarks-list">
            {bookmarks.map(item => {
              const post = item.post;
              if (!post) return null;
              return (
                <div key={item.id} className="post-card">
                  <div className="post-card-header">
                    {post.category && (
                      <span className="post-category-chip">{post.category.name}</span>
                    )}
                    <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-3)' }}>
                      Saved {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="post-title">
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                  </h3>
                  <div className="post-meta">
                    <span>
                      <div className="post-author-avatar" style={{ display: 'inline-flex' }}>
                        {post.user?.username?.charAt(0).toUpperCase()}
                      </div>
                      <Link to={`/profiles/${post.user?.username}`} style={{ fontWeight: 600, color: 'var(--text-2)', marginLeft: 4 }}>
                        {post.user?.username}
                      </Link>
                    </span>
                    <span><ThumbsUp    size={12} strokeWidth={2.5} /> {post.vote_score ?? 0}</span>
                    <span><MessageCircle size={12} strokeWidth={2.5} /> {post.comments_count ?? 0}</span>
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

export default Bookmarks;
