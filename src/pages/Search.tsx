import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import postService from '../services/postService';
import categoryService from '../services/categoryService';
import tagService from '../services/tagService';
import type { Post, Category, Tag } from '../types/index';
import Layout from '../layouts/Layout';
import { Search as SearchIcon, ThumbsUp, MessageCircle, X, Home, Trophy, ChevronDown, Check } from 'lucide-react';
import './Home.css';
import '../App.css';

const Search: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [posts, setPosts]           = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags]             = useState<Tag[]>([]);
  const [loading, setLoading]       = useState(true);

  const queryParams    = new URLSearchParams(location.search);
  const query          = queryParams.get('q')           || '';
  const categoryFilter = queryParams.get('category_id') || '';
  const tagFilter      = queryParams.get('tag')         || '';
  const userFilter     = queryParams.get('username')    || '';

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cats, ts] = await Promise.all([categoryService.getCategories(), tagService.getTags()]);
        setCategories(cats); setTags(ts);
      } catch { console.error('Failed to fetch metadata'); }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const results = await postService.getAllPosts({
          search: query || undefined,
          category_id: categoryFilter || undefined,
          tag: tagFilter || undefined,
          username: userFilter || undefined,
          per_page: 50,
        });
        setPosts(Array.isArray(results) ? results : []);
      } catch { console.error('Search failed'); }
      finally { setLoading(false); }
    };
    fetchResults();
  }, [query, categoryFilter, tagFilter, userFilter]);

  const handleFilterChange = (name: string, value: string) => {
    const p = new URLSearchParams(location.search);
    if (value) p.set(name, value); else p.delete(name);
    navigate(`/search?${p.toString()}`);
  };

  const hasFilters = query || categoryFilter || tagFilter || userFilter;

  return (
    <Layout>
      <div className="search-page-grid">
        {/* Row 1: Page Header — full width */}
        <div className="search-area-header">
          <div className="page-header">
            <div>
              <h1 style={{ margin: 0 }}>{query ? `Results for "${query}"` : 'Search Discussions'}</h1>
              {!loading && (
                <p className="page-header-sub">
                  {posts.length} discussion{posts.length !== 1 ? 's' : ''} found
                  {query && <span style={{ color: 'var(--text-3)' }}> — searching title, body, username &amp; category</span>}
                </p>
              )}
            </div>
            {hasFilters && (
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/search')}>
                <X size={13} strokeWidth={2.8} /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Row 2 col 1: Filter Card */}
        <div className="search-area-filter">
          <div className="search-filter-card">
            <div className="search-filter-grid">
              {/* Category Select — Radix UI */}
              <div className="search-filter-group">
                <Label.Root className="search-filter-label" htmlFor="category-select">Category</Label.Root>
                <Select.Root value={categoryFilter} onValueChange={val => handleFilterChange('category_id', val === '__all__' ? '' : val)}>
                  <Select.Trigger className="radix-select-trigger" id="category-select" aria-label="Category">
                    <Select.Value placeholder="All Categories" />
                    <Select.Icon className="radix-select-icon"><ChevronDown size={14} strokeWidth={2.5} /></Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="radix-select-content" position="popper" sideOffset={6}>
                      <Select.Viewport className="radix-select-viewport">
                        <Select.Item value="__all__" className="radix-select-item">
                          <Select.ItemText>All Categories</Select.ItemText>
                          <Select.ItemIndicator className="radix-select-indicator"><Check size={12} /></Select.ItemIndicator>
                        </Select.Item>
                        {categories.map(cat => (
                          <Select.Item key={cat.id} value={String(cat.id)} className="radix-select-item">
                            <Select.ItemText>{cat.name}</Select.ItemText>
                            <Select.ItemIndicator className="radix-select-indicator"><Check size={12} /></Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              {/* Tag Select — Radix UI */}
              <div className="search-filter-group">
                <Label.Root className="search-filter-label" htmlFor="tag-select">Tag</Label.Root>
                <Select.Root value={tagFilter} onValueChange={val => handleFilterChange('tag', val === '__all__' ? '' : val)}>
                  <Select.Trigger className="radix-select-trigger" id="tag-select" aria-label="Tag">
                    <Select.Value placeholder="All Tags" />
                    <Select.Icon className="radix-select-icon"><ChevronDown size={14} strokeWidth={2.5} /></Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="radix-select-content" position="popper" sideOffset={6}>
                      <Select.Viewport className="radix-select-viewport">
                        <Select.Item value="__all__" className="radix-select-item">
                          <Select.ItemText>All Tags</Select.ItemText>
                          <Select.ItemIndicator className="radix-select-indicator"><Check size={12} /></Select.ItemIndicator>
                        </Select.Item>
                        {tags.map(tag => (
                          <Select.Item key={tag.id} value={tag.slug} className="radix-select-item">
                            <Select.ItemText>{tag.name}</Select.ItemText>
                            <Select.ItemIndicator className="radix-select-indicator"><Check size={12} /></Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              {/* Username input */}
              <div className="search-filter-group">
                <Label.Root className="search-filter-label" htmlFor="username-filter">Username</Label.Root>
                <input
                  id="username-filter"
                  type="text"
                  className="search-filter-input"
                  placeholder="Filter by user..."
                  value={userFilter}
                  onChange={e => handleFilterChange('username', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 col 2: Quick Links — sejajar filter card */}
        <div className="sidebar-card search-sidebar-top">
          <p className="sidebar-title">Quick Links</p>
          <ul className="category-list">
            <li><Link to="/"            className="category-link"><Home   size={14} strokeWidth={2} style={{ marginRight: 6 }} />Home</Link></li>
            <li><Link to="/leaderboard" className="category-link"><Trophy size={14} strokeWidth={2} style={{ marginRight: 6 }} />Leaderboard</Link></li>
          </ul>
        </div>

        {/* Row 3 col 1: Results — sejajar Search card */}
        <div className="search-area-results">
          {loading ? (
            <div className="loading-spinner">Searching...</div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <SearchIcon size={48} strokeWidth={1.2} style={{ opacity: .35 }} />
              </span>
              <h3>No results found</h3>
              <p>Try different keywords or remove some filters.</p>
              <button className="btn btn-outline" onClick={() => navigate('/search')}>Clear All Filters</button>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-card-header">
                    {post.category && <Link to={`/categories/${post.category.slug}`} className="post-category-chip">{post.category.name}</Link>}
                  </div>
                  <h3 className="post-title"><Link to={`/posts/${post.id}`}>{post.title}</Link></h3>
                  {post.body && <p className="post-excerpt">{post.body.substring(0, 200)}...</p>}
                  <div className="post-meta">
                    <span>
                      <span className="post-author-avatar" style={{ display: 'inline-flex', width: 20, height: 20, fontSize: '0.62rem' }}>
                        {post.user?.username?.charAt(0).toUpperCase()}
                      </span>
                      <Link to={`/profiles/${post.user?.username}`} style={{ fontWeight: 600, color: 'var(--text-2)', marginLeft: 4 }}>{post.user?.username}</Link>
                    </span>
                    <span><ThumbsUp size={12} strokeWidth={2.5} /> {post.vote_score ?? 0}</span>
                    <span><MessageCircle size={12} strokeWidth={2.5} /> {post.comments_count ?? 0}</span>
                    <span style={{ marginLeft: 'auto' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Row 3 col 2: Search card — sejajar results */}
        <div className="sidebar-card search-sidebar-bottom">
          <p className="sidebar-title">Search</p>
          <form
            className="sidebar-search"
            onSubmit={e => {
              e.preventDefault();
              handleFilterChange('q', (e.currentTarget.querySelector('input') as HTMLInputElement).value);
            }}
          >
            <input
              type="text"
              className="search-filter-input"
              placeholder="Search by title, category, or user..."
              defaultValue={query}
            />
            <button type="submit" className="sidebar-search-btn">
              <SearchIcon size={15} strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
