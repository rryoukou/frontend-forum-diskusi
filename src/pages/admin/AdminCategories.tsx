import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import categoryService from '../../services/categoryService';
import type { Category } from '../../types/index';
import { Plus, Pencil, Trash2, FolderTree, X, Check } from 'lucide-react';
import '../../App.css';

const AdminCategories: React.FC = () => {
  const [categories, setCategories]       = useState<Category[]>([]);
  const [loading, setLoading]             = useState(true);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingCategory, setEditingCat]  = useState<Category | null>(null);
  const [formData, setFormData]           = useState({ name: '', slug: '', description: '', parent_id: '' });
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const fetchCategories = async () => {
    try { const d = await categoryService.getCategories(); setCategories(d); }
    catch { console.error('Failed to fetch categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await categoryService.getCategories();
        if (!cancelled) setCategories(d);
      } catch { console.error('Failed to fetch categories'); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleOpenModal = (cat: Category | null = null) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({ name: cat.name, slug: cat.slug, description: cat.description || '', parent_id: cat.parent_id || '' });
    } else {
      setEditingCat(null);
      setFormData({ name: '', slug: '', description: '', parent_id: '' });
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingCat(null); };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const nd = { ...prev, [name]: value };
      if (name === 'name' && !editingCategory) nd.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      return nd;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      if (editingCategory) await categoryService.updateCategory(editingCategory.id, formData);
      else                 await categoryService.createCategory(formData);
      await fetchCategories();
      handleCloseModal();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to save category');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try { await categoryService.deleteCategory(id); await fetchCategories(); }
    catch { alert('Failed to delete category'); }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 style={{ margin: 0 }}>Category Management</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginTop: 4 }}>Organise discussion topics.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={15} strokeWidth={2.5} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
            <FolderTree size={48} strokeWidth={1.2} style={{ opacity: .35 }} />
          </span>
          <h3>No categories yet</h3>
          <p>Add your first category to get started.</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={14} strokeWidth={2.5} /> Add Category</button>
        </div>
      ) : (
        <div className="admin-table-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <React.Fragment key={cat.id}>
                    <tr>
                      <td style={{ fontWeight: 700 }}>{cat.name}</td>
                      <td style={{ color: 'var(--text-3)', fontSize: '0.82rem', fontFamily: 'monospace' }}>{cat.slug}</td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>{cat.description || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleOpenModal(cat)} className="admin-action-btn promote" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Pencil size={12} strokeWidth={2.5} /> Edit
                          </button>
                          <button onClick={() => handleDelete(cat.id)} className="admin-action-btn ban" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Trash2 size={12} strokeWidth={2.5} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {cat.children?.map(child => (
                      <tr key={child.id} style={{ background: 'var(--surface-2)' }}>
                        <td style={{ paddingLeft: 'var(--sp-10)', color: 'var(--text-2)', fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--text-3)', marginRight: 6 }}>└</span>{child.name}
                        </td>
                        <td style={{ color: 'var(--text-3)', fontSize: '0.78rem', fontFamily: 'monospace' }}>{child.slug}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{child.description || '—'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleOpenModal(child)} className="admin-action-btn promote" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Pencil size={12} strokeWidth={2.5} /> Edit
                            </button>
                            <button onClick={() => handleDelete(child.id)} className="admin-action-btn ban" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Trash2 size={12} strokeWidth={2.5} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>
            <div className="modal-body">
              {error && (
                <div style={{ padding: 'var(--sp-3) var(--sp-4)', background: 'var(--danger-light)', border: '1px solid rgba(255,77,106,0.25)', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: '0.875rem', marginBottom: 'var(--sp-4)' }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Technology" />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} required placeholder="e.g. technology" style={{ fontFamily: 'monospace' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Parent Category <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
                  <select name="parent_id" value={formData.parent_id} onChange={handleInputChange}>
                    <option value="">None (Top Level)</option>
                    {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Brief description of this category..." style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border)' }}>
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                    <X size={14} strokeWidth={2.5} /> Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : <><Check size={14} strokeWidth={2.5} /> {editingCategory ? 'Update' : 'Create'}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
