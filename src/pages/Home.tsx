import React, { useEffect, useState } from 'react';
import postService from '../services/postService';
import categoryService from '../services/categoryService';
import tagService from '../services/tagService';
import type { Post, Category, Tag } from '../types/index';
import Layout from '../layouts/Layout';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, trendingData, categoriesData, tagsData] = await Promise.all([
          postService.getAllPosts(),
          postService.getTrendingPosts(),
          categoryService.getCategories(),
          tagService.getTags()
        ]);
        setPosts(postsData);
        setTrendingPosts(trendingData);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-8)' }}>
        <div className="loading-spinner">Loading...</div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="home-grid">
        <div className="posts-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
            <h1 style={{ margin: 0 }}>Recent Discussions</h1>
            <Link to="/create-post" className="btn btn-primary">
              + New Post
            </Link>
          </div>
          
          {posts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No posts found. Be the first to start a discussion!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="post-card">
                <h3 className="post-title">
                  <Link to={`/posts/${post.id}`}>{post.title}</Link>
                </h3>
                <p className="post-excerpt">{post.body}</p>
                <div className="post-meta">
                  <span>👤 <Link to={`/profiles/${post.user?.username}`}><strong>{post.user?.username || 'Unknown'}</strong></Link></span>
                  <span>📁 {post.category?.name || 'Uncategorized'}</span>
                  <span>👍 {post.likes_count}</span>
                  <span>💬 {post.comments_count || 0}</span>
                  <span>👁️ {post.view_count}</span>
                  <span style={{ marginLeft: 'auto' }}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="sidebar">
          <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
            <h2 className="sidebar-title">Search</h2>
            <form onSubmit={handleSearch}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Search discussions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: 'var(--spacing-2) var(--spacing-4)', 
                    paddingRight: 'var(--spacing-10)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#f9fafb'
                  }}
                />
                <button 
                  type="submit"
                  style={{ 
                    position: 'absolute', 
                    right: 'var(--spacing-2)', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  🔍
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <h2 className="sidebar-title">Categories</h2>
            <ul className="category-list">
              <li className="category-item">
                <Link to="/" className="category-link">All Categories</Link>
              </li>
              {categories.map(cat => (
                <li key={cat.id} className="category-item">
                  <Link to={`/categories/${cat.slug}`} className="category-link">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="card" style={{ marginTop: 'var(--spacing-6)' }}>
            <h2 className="sidebar-title">🔥 Trending</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              {trendingPosts.map(post => (
                <div key={post.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 'var(--spacing-3)' }}>
                  <Link to={`/posts/${post.id}`} style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
                    {post.title}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-1)' }}>
                    👍 {post.vote_score} • 💬 {post.comments_count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 'var(--spacing-6)' }}>
            <h2 className="sidebar-title">🏷️ Popular Tags</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
              {tags.map(tag => (
                <Link key={tag.id} to={`/search?q=${tag.name}`} className="tag-badge" style={{ fontSize: '0.75rem', textDecoration: 'none', backgroundColor: '#f3f4f6', color: 'var(--text-secondary)' }}>
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 'var(--spacing-6)' }}>
            <h2 className="sidebar-title">Community Stats</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Posts</span>
                <span style={{ fontWeight: 'bold' }}>{posts.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Categories</span>
                <span style={{ fontWeight: 'bold' }}>{categories.length}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default Home;
