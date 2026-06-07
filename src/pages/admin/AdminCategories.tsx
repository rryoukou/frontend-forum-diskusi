import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import categoryService from '../../services/categoryService';
import type { Category } from '../../types/index';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parent_id: category.parent_id || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        parent_id: ''
      });
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-generate slug from name if adding new and slug isn't manually edited?
      // For simplicity, let's just auto-generate slug if it's the name field being changed
      if (name === 'name' && !editingCategory) {
        newData.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      await fetchCategories();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoryService.deleteCategory(id);
      await fetchCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-8)' }}>
        <h1 style={{ margin: 0 }}>Category Management</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Add Category</button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading categories...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: 'var(--spacing-4)', textAlign: 'left' }}>Name</th>
                <th style={{ padding: 'var(--spacing-4)', textAlign: 'left' }}>Slug</th>
                <th style={{ padding: 'var(--spacing-4)', textAlign: 'left' }}>Description</th>
                <th style={{ padding: 'var(--spacing-4)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <React.Fragment key={cat.id}>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 'var(--spacing-4)', fontWeight: 'bold' }}>{cat.name}</td>
                    <td style={{ padding: 'var(--spacing-4)', color: 'var(--text-secondary)' }}>{cat.slug}</td>
                    <td style={{ padding: 'var(--spacing-4)', fontSize: '0.875rem' }}>{cat.description || '-'}</td>
                    <td style={{ padding: 'var(--spacing-4)', textAlign: 'right' }}>
                      <button className="btn-text" style={{ marginRight: 'var(--spacing-4)' }} onClick={() => handleOpenModal(cat)}>Edit</button>
                      <button className="btn-text" style={{ color: '#ef4444' }} onClick={() => handleDelete(cat.id)}>Delete</button>
                    </td>
                  </tr>
                  {/* Render children if any */}
                  {cat.children?.map(child => (
                    <tr key={child.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#fcfcfc' }}>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-4) var(--spacing-4) var(--spacing-12)', fontWeight: 'normal' }}>
                        <span style={{ color: 'var(--text-secondary)', marginRight: 'var(--spacing-2)' }}>└</span> {child.name}
                      </td>
                      <td style={{ padding: 'var(--spacing-4)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{child.slug}</td>
                      <td style={{ padding: 'var(--spacing-4)', fontSize: '0.875rem' }}>{child.description || '-'}</td>
                      <td style={{ padding: 'var(--spacing-4)', textAlign: 'right' }}>
                        <button className="btn-text" style={{ marginRight: 'var(--spacing-4)' }} onClick={() => handleOpenModal(child)}>Edit</button>
                        <button className="btn-text" style={{ color: '#ef4444' }} onClick={() => handleDelete(child.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: 'var(--spacing-4)' }}>
            <h2 style={{ marginTop: 0 }}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            
            {error && (
              <div style={{ padding: 'var(--spacing-3)', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px', marginBottom: 'var(--spacing-4)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-1)', fontWeight: '500' }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: 'var(--spacing-2)', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-1)', fontWeight: '500' }}>Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: 'var(--spacing-2)', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-1)', fontWeight: '500' }}>Parent Category (Optional)</label>
                <select
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: 'var(--spacing-2)', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                >
                  <option value="">None (Top Level)</option>
                  {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 'var(--spacing-6)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-1)', fontWeight: '500' }}>Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  style={{ width: '100%', padding: 'var(--spacing-2)', borderRadius: '4px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)' }}>
                <button type="button" className="btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
