import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import authService from '../services/authService';
import categoryService from '../services/categoryService';
import tagService from '../services/tagService';
import type { Category, Tag } from '../types/index';
import Layout from '../layouts/Layout';
import { Send, X, Tag as TagIcon, AlertTriangle } from 'lucide-react';
import '../App.css';

const CreatePost: React.FC = () => {
  const [title, setTitle]               = useState('');
  const [body, setBody]                 = useState('');
  const [categoryId, setCategoryId]     = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [tags, setTags]                 = useState<Tag[]>([]);
  const [tagInput, setTagInput]         = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const navigate = useNavigate();

  const user       = authService.getCurrentUser();
  const minPoints  = 10;
  const isEligible = (user?.reputation_points ?? 0) >= minPoints || authService.isModerator();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, t] = await Promise.all([categoryService.getCategories(), tagService.getTags()]);
        setCategories(c); setTags(t);
        if (c.length > 0) setCategoryId(c[0].id.toString());
      } catch { console.error('Failed to fetch data'); }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEligible) { setError(`You need at least ${minPoints} reputation points to create a post.`); return; }
    setLoading(true); setError('');
    try {
      await postService.createPost({ title, body, category_id: categoryId, tags: selectedTags });
      navigate('/');
    } catch (err: unknown) { setError((err as any).response?.data?.message || 'Failed to create post'); }
    finally { setLoading(false); }
  };

  const handleTagToggle = (tagName: string) =>
    setSelectedTags(prev => prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const nt = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      if (nt && !selectedTags.includes(nt)) setSelectedTags([...selectedTags, nt]);
      setTagInput('');
    }
  };

  const removeTag = (tagName: string) => setSelectedTags(selectedTags.filter(t => t !== tagName));

  return (
    <Layout>
      <div className="create-post-wrapper">
        {/* Insufficient rep warning */}
        {!isEligible && (
          <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start', padding: 'var(--sp-5)', background: 'var(--danger-light)', border: '1px solid rgba(255,77,106,0.25)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--sp-6)' }}>
            <AlertTriangle size={28} strokeWidth={1.8} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 style={{ color: 'var(--danger)', margin: '0 0 var(--sp-1)' }}>Insufficient Reputation</h3>
              <p style={{ color: 'var(--text-2)', margin: '0 0 var(--sp-2)', fontSize: '0.9375rem' }}>
                You need at least <strong style={{ color: 'var(--danger)' }}>{minPoints} reputation points</strong> to create a post.
                You currently have <strong style={{ color: 'var(--text-1)' }}>{user?.reputation_points ?? 0} points</strong>.
              </p>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-3)', margin: 0 }}>
                Earn points by commenting and receiving likes on your contributions.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--danger-light)', border: '1px solid rgba(255,77,106,0.25)', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--sp-5)' }}>
            <AlertTriangle size={15} strokeWidth={2.5} /> {error}
          </div>
        )}

        <div className="create-post-card" style={{ opacity: isEligible ? 1 : 0.55, pointerEvents: isEligible ? 'auto' : 'none' }}>
          <div className="create-post-header">
            <h1>New Discussion</h1>
            <p>Share your thoughts, ask a question, or start a debate.</p>
          </div>

          <form onSubmit={handleSubmit} className="create-post-form">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="What's on your mind?" style={{ fontSize: '1.05rem', fontWeight: 600 }} disabled={!isEligible} />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required disabled={!isEligible}>
                {categories.length === 0
                  ? <option value="" disabled>Loading categories...</option>
                  : categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)
                }
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <div className="tag-input-area">
                {selectedTags.map(tag => (
                  <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.6rem', background: 'var(--gradient-primary)', color: '#0d0d0d', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600 }}>
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} disabled={!isEligible}
                      style={{ border: 'none', background: 'none', color: 'rgba(0,0,0,0.6)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                ))}
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
                  placeholder={selectedTags.length === 0 ? 'Type a tag and press Enter...' : ''} disabled={!isEligible} />
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-3)', marginTop: 'var(--sp-1)' }}>Press Enter or comma to add · max 5 tags</p>
              {tags.length > 0 && (
                <div style={{ marginTop: 'var(--sp-3)' }}>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-3)', marginBottom: 'var(--sp-2)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TagIcon size={11} strokeWidth={2.5} /> Suggestions:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                    {tags.filter(t => !selectedTags.includes(t.name)).slice(0, 12).map(tag => (
                      <button key={tag.id} type="button" onClick={() => handleTagToggle(tag.name)} className="tag-badge" style={{ cursor: 'pointer' }} disabled={!isEligible}>
                        + {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} required rows={12}
                placeholder="Write your discussion content here..." disabled={!isEligible} />
            </div>

            <div className="create-post-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
                <X size={14} strokeWidth={2.5} /> Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading || !isEligible}>
                {loading ? 'Publishing...' : <><Send size={14} strokeWidth={2.5} /> Publish Discussion</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreatePost;
