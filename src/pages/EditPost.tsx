import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import postService from '../services/postService';
import categoryService from '../services/categoryService';
import tagService from '../services/tagService';
import type { Category, Tag } from '../types/index';
import Layout from '../layouts/Layout';
import { Check, X, Tag as TagIcon, AlertTriangle } from 'lucide-react';
import '../App.css';

const EditPost: React.FC = () => {
  const { id }                          = useParams<{ id: string }>();
  const [title, setTitle]               = useState('');
  const [body, setBody]                 = useState('');
  const [categoryId, setCategoryId]     = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [tags, setTags]                 = useState<Tag[]>([]);
  const [tagInput, setTagInput]         = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [fetching, setFetching]         = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, t, post] = await Promise.all([categoryService.getCategories(), tagService.getTags(), postService.getPostById(id!)]);
        setCategories(c); setTags(t);
        setTitle(post.title); setBody(post.body);
        setCategoryId(post.category_id.toString());
        setSelectedTags(post.tags?.map((tg: any) => tg.name) || []);
      } catch { console.error('Failed to fetch data'); setError('Failed to load post data.'); }
      finally { setFetching(false); }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await postService.updatePost(id!, { title, body, category_id: categoryId, tags: selectedTags }); navigate(`/posts/${id}`); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed to update post'); }
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

  const removeTag = (t: string) => setSelectedTags(selectedTags.filter(x => x !== t));

  if (fetching) return <Layout><div className="loading-spinner">Loading post...</div></Layout>;

  return (
    <Layout>
      <div className="create-post-wrapper">
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--danger-light)', border: '1px solid rgba(255,77,106,0.25)', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--sp-5)' }}>
            <AlertTriangle size={15} strokeWidth={2.5} /> {error}
          </div>
        )}

        <div className="create-post-card">
          <div className="create-post-header">
            <h1>Edit Discussion</h1>
            <p>Update your post details below.</p>
          </div>

          <form onSubmit={handleSubmit} className="create-post-form">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="What's on your mind?" style={{ fontSize: '1.05rem', fontWeight: 600 }} />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <div className="tag-input-area">
                {selectedTags.map(tag => (
                  <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.6rem', background: 'var(--gradient-primary)', color: '#0d0d0d', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600 }}>
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)}
                      style={{ border: 'none', background: 'none', color: 'rgba(0,0,0,0.6)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                ))}
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
                  placeholder={selectedTags.length === 0 ? 'Type a tag and press Enter...' : ''} />
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-3)', marginTop: 'var(--sp-1)' }}>Press Enter or comma to add · max 5 tags</p>
              {tags.length > 0 && (
                <div style={{ marginTop: 'var(--sp-3)' }}>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-3)', marginBottom: 'var(--sp-2)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TagIcon size={11} strokeWidth={2.5} /> Suggestions:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                    {tags.filter(t => !selectedTags.includes(t.name)).slice(0, 12).map(tag => (
                      <button key={tag.id} type="button" onClick={() => handleTagToggle(tag.name)} className="tag-badge" style={{ cursor: 'pointer' }}>
                        + {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} required rows={12} placeholder="Write your post content here..." />
            </div>

            <div className="create-post-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
                <X size={14} strokeWidth={2.5} /> Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : <><Check size={14} strokeWidth={2.5} /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditPost;
