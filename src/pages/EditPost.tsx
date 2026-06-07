import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import postService from '../services/postService';
import categoryService from '../services/categoryService';
import tagService from '../services/tagService';
import type { Category, Tag } from '../types/index';
import Layout from '../layouts/Layout';
import './Auth.css';

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, tagsData, postData] = await Promise.all([
          categoryService.getCategories(),
          tagService.getTags(),
          postService.getPostById(id!)
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
        setTitle(postData.title);
        setBody(postData.body);
        setCategoryId(postData.category_id.toString());
        setSelectedTags(postData.tags?.map((t: any) => t.name) || []);
      } catch (err) {
        console.error('Failed to fetch data');
        setError('Failed to load post data');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await postService.updatePost(id!, { 
        title, 
        body, 
        category_id: categoryId,
        tags: selectedTags
      });
      navigate(`/posts/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName) 
        : [...prev, tagName]
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      if (newTag && !selectedTags.includes(newTag)) {
        setSelectedTags([...selectedTags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagName));
  };

  if (fetching) return <Layout><div className="loading-spinner">Loading post...</div></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <h1 style={{ marginBottom: 'var(--spacing-2)' }}>Edit Discussion</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Update your post details.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                placeholder="What's on your mind?"
                style={{ fontSize: '1.25rem', fontWeight: '600' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 'var(--spacing-2)', 
                padding: 'var(--spacing-2)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius)',
                backgroundColor: 'white',
                minHeight: '42px',
                alignItems: 'center'
              }}>
                {selectedTags.map(tag => (
                  <span key={tag} className="tag-badge" style={{ 
                    backgroundColor: 'var(--primary-color)', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-1)',
                    padding: '2px 8px'
                  }}>
                    #{tag}
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)}
                      style={{ border: 'none', background: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: '1rem', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input 
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={selectedTags.length === 0 ? "Type tag and press Enter..." : ""}
                  style={{ border: 'none', outline: 'none', flex: 1, minWidth: '120px', padding: 0, height: 'auto' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-1)' }}>
                Press Enter or comma to add a tag. Max 5 tags recommended.
              </p>
              
              {/* Existing tags suggestions */}
              {tags.length > 0 && (
                <div style={{ marginTop: 'var(--spacing-2)' }}>
                  <div style={{ fontSize: '0.75rem', marginBottom: 'var(--spacing-1)', color: 'var(--text-secondary)' }}>Suggestions:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-1)' }}>
                    {tags.filter(t => !selectedTags.includes(t.name)).slice(0, 10).map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag.name)}
                        className="tag-badge"
                        style={{ cursor: 'pointer', fontSize: '0.7rem', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}
                      >
                        +{tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                required 
                rows={12}
                placeholder="Write your post content here..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'flex-end', marginTop: 'var(--spacing-6)' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditPost;
