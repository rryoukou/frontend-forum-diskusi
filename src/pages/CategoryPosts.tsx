import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import categoryService from '../services/categoryService';
import type { Post, Category } from '../types/index';
import Layout from '../layouts/Layout';
import {  
  Search, User, ThumbsUp, Eye, FolderOpen, PenLine,
} from 'lucide-react';
import './Home.css';
import '../App.css';

const CategoryPosts: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [posts, setPosts]                     = useState<Post[]>([]);
  const [categories, setCategories]           = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [searchQuery, setSearchQuery]         = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cats = await categoryService.getCategories();
        setCategories(cats);
        const cat = cats.find(c => c.slug === slug);
        setCurrentCategory(cat || null);
        const p = await postService.getAllPosts(
          cat ? { category_id: cat.id } : { category_slug: slug }
        );
        setPosts(p);
      } catch (err) { console.error('Failed to fetch category posts', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  if (loading) return <Layout><div className="loading-spinner">Loading discussions...</div></Layout>;

  return (
    <Layout>
      <div className="home-grid">
        <div className="posts-section">
          {/* Category hero */}
          <div className="category-hero">
            <h1>{currentCategory?.name ?? slug}</h1>
            {currentCategory?.description && (
              <p style={{ color: 'rgba(255,255,255,0.82)', marginTop: 'var(--sp-2)', fontSize: '0.9375rem' }}>
                {currentCategory.description}
              </p>
            )}
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 'var(--sp-2)', fontSize: '0.82rem', fontWeight: 600 }}>
              {posts.length} discussion{posts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <FolderOpen size={48} strokeWidth={1.2} style={{ opacity: .35 }} />
              </span>
              <h3>No posts yet</h3>
              <p>Be the first to start a discussion in this category!</p>
              <Link to="/create-post" className="btn btn-primary">
                <PenLine size={14} strokeWidth={2.5} /> Start a Discussion
              </Link>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="post-card">
                <h3 className="post-title">
                  <Link to={`/posts/${post.id}`}>{post.title}</Link>
                </h3>
                <p className="post-excerpt">{post.body}</p>
                <div className="post-meta">
                  <span>
                    <User size={12} strokeWidth={2.5} />
                    <Link to={`/profiles/${post.user?.username}`}
                      style={{ fontWeight: 700, color: 'var(--text-1)', marginLeft: 4 }}>
                      {post.user?.username || 'Unknown'}
                    </Link>
                  </span>
                  <span><ThumbsUp size={12} strokeWidth={2.5} /> {post.vote_score} votes</span>
                  <span><Eye     size={12} strokeWidth={2.5} /> {post.view_count} views</span>
                  <span style={{ marginLeft: 'auto' }}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
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
            <p className="sidebar-title">All Categories</p>
            <ul className="category-list">
              <li><Link to="/" className="category-link">All Categories</Link></li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link
                    to={`/categories/${cat.slug}`}
                    className={`category-link${cat.slug === slug ? ' active' : ''}`}
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
