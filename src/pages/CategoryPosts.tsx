import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import categoryService from '../services/categoryService';
import type { Post, Category } from '../types/index';
import Layout from '../layouts/Layout';
import './Home.css';

const CategoryPosts: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
        
        const category = categoriesData.find(c => c.slug === slug);
        setCurrentCategory(category || null);

        const postsData = await postService.getAllPosts(
          category ? { category_id: category.id } : { category_slug: slug }
        );
        setPosts(postsData);
      } catch (error) {
        console.error('Failed to fetch category posts', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) return <Layout><div className="loading-spinner">Loading discussions...</div></Layout>;

  return (
    <Layout>
      <div className="home-grid">
        <div className="posts-section">
          <div style={{ marginBottom: 'var(--spacing-8)' }}>
            <h1 style={{ margin: 0 }}>Category: {currentCategory ? currentCategory.name : slug}</h1>
            {currentCategory?.description && (
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-2)' }}>{currentCategory.description}</p>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No posts found in this category yet.</p>
              <Link to="/create-post" className="btn btn-primary" style={{ marginTop: 'var(--spacing-4)' }}>Start a discussion</Link>
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
                  <span>👍 {post.vote_score} votes</span>
                  <span>👁️ {post.view_count} views</span>
                  <span style={{ marginLeft: 'auto' }}>{new Date(post.created_at).toLocaleDateString()}</span>
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
            <h2 className="sidebar-title">All Categories</h2>
            <ul className="category-list">
              <li className="category-item">
                <Link to="/" className="category-link">All Categories</Link>
              </li>
              {categories.map(cat => (
                <li key={cat.id} className="category-item">
                  <Link 
                    to={`/categories/${cat.slug}`} 
                    className="category-link"
                    style={{ 
                      backgroundColor: cat.slug === slug ? '#f3f4f6' : 'transparent',
                      color: cat.slug === slug ? 'var(--primary-color)' : 'var(--text-secondary)',
                      fontWeight: cat.slug === slug ? 'bold' : 'normal'
                    }}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default CategoryPosts;
