import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import categoryService from '../services/categoryService';
import tagService from '../services/tagService';
import type { Post, Category, Tag } from '../types/index';
import Layout from '../layouts/Layout';
import './Home.css';

const Search: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';
  const categoryFilter = queryParams.get('category_id') || '';
  const tagFilter = queryParams.get('tag') || '';
  const userFilter = queryParams.get('username') || '';

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cats, ts] = await Promise.all([
          categoryService.getCategories(),
          tagService.getTags()
        ]);
        setCategories(cats);
        setTags(ts);
      } catch (error) {
        console.error('Failed to fetch metadata');
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const results = await postService.getAllPosts({ 
          search: query,
          category_id: categoryFilter,
          tag: tagFilter,
          username: userFilter
        });
        // Handle pagination object if returned
        setPosts(Array.isArray(results) ? results : (results as any).data || []);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, categoryFilter, tagFilter, userFilter]);

  const handleFilterChange = (name: string, value: string) => {
    const newParams = new URLSearchParams(location.search);
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    navigate(`/search?${newParams.toString()}`);
  };

  return (
    <Layout>
      <div className="home-grid">
        <div className="posts-section">
          <h1 style={{ marginBottom: 'var(--spacing-6)' }}>
            {query ? `Search Results for "${query}"` : 'Search Discussions'}
          </h1>

          {/* Mobile Filter View (Simplified) */}
          <div className="card" style={{ marginBottom: 'var(--spacing-6)', display: 'block' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: 'var(--spacing-1)' }}>Category</label>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => handleFilterChange('category_id', e.target.value)}
                  style={{ width: '100%', padding: 'var(--spacing-2)', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: 'var(--spacing-1)' }}>Tag</label>
                <select 
                  value={tagFilter} 
                  onChange={(e) => handleFilterChange('tag', e.target.value)}
                  style={{ width: '100%', padding: 'var(--spacing-2)', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                >
                  <option value="">All Tags</option>
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.slug}>{tag.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: 'var(--spacing-1)' }}>Username</label>
                <input 
                  type="text"
                  placeholder="Filter by user..."
                  value={userFilter}
                  onChange={(e) => handleFilterChange('username', e.target.value)}
                  style={{ width: '100%', padding: 'var(--spacing-2)', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">Searching...</div>
          ) : posts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>No discussions found matching your search.</p>
              <button onClick={() => navigate('/search')} className="btn btn-outline" style={{ marginTop: 'var(--spacing-4)' }}>Clear All Filters</button>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <h3 className="post-title">
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="post-excerpt">{post.body.substring(0, 200)}...</p>
                  <div className="post-meta">
                    <span>👤 <Link to={`/profiles/${post.user?.username}`}><strong>{post.user?.username}</strong></Link></span>
                    <span>📁 {post.category?.name}</span>
                    <span>👍 {post.vote_score}</span>
                    <span>💬 {post.comments_count || 0}</span>
                    <span style={{ marginLeft: 'auto' }}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="sidebar">
          <div className="card">
            <h2 className="sidebar-title">Quick Links</h2>
            <ul className="category-list">
              <li className="category-item">
                <Link to="/" className="category-link">Home</Link>
              </li>
              <li className="category-item">
                <Link to="/leaderboard" className="category-link">Leaderboard</Link>
              </li>
              <li className="category-item">
                <Link to="/badges" className="category-link">Badges</Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default Search;
