import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import bookmarkService from '../services/bookmarkService';
import { Link } from 'react-router-dom';
import './Home.css'; // Reusing post card styles

const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const data = await bookmarkService.getMyBookmarks();
        setBookmarks(data.data);
      } catch (err) {
        console.error('Failed to fetch bookmarks');
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: 'var(--spacing-2)' }}>My Bookmarks</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-8)' }}>Posts you've saved to read later.</p>

        {loading ? <div className="loading-spinner">Loading bookmarks...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            {bookmarks.length === 0 ? (
              <div className="card" style={{ padding: 'var(--spacing-8)', textAlign: 'center', borderStyle: 'dashed' }}>
                <p style={{ marginBottom: 'var(--spacing-4)', color: 'var(--text-muted)' }}>You haven't bookmarked any posts yet.</p>
                <Link to="/" className="btn btn-primary">Discover interesting posts</Link>
              </div>
            ) : bookmarks.map(item => {
              const post = item.post;
              if (!post) return null;
              return (
                <div key={item.id} className="post-card">
                  <h3 className="post-title">
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                  </h3>
                  <div className="post-meta">
                    <span>👤 By: <strong>{post.user?.username}</strong></span>
                    <span>📁 {post.category?.name}</span>
                    <span style={{ marginLeft: 'auto' }}>Saved on {new Date(item.created_at).toLocaleDateString()}</span>
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
