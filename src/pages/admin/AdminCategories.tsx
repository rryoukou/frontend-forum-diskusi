import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import categoryService from '../../services/categoryService';
import type { Category } from '../../types/index';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stats calculations
  const totalCategories = categories.length;
  const topLevelCategories = categories.filter(cat => !cat.parent_id).length;
  const subCategories = categories.filter(cat => cat.parent_id).length;

  const flattenCategories = (nestedCategories: Category[]): Category[] => {
    const flat: Category[] = [];
    const recurse = (list: Category[]) => {
      for (const cat of list) {
        const { children, ...rest } = cat;
        flat.push(rest as Category);
        if (children && children.length > 0) {
          recurse(children);
        }
      }
    };
    recurse(nestedCategories);
    return flat;
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      const flatData = flattenCategories(data);
      setCategories(flatData);
      setSelectedCategory(prev => (prev === null && flatData.length > 0 ? flatData[0] : prev));
    } catch {
      console.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        const flatData = flattenCategories(data);
        setCategories(flatData);
        setSelectedCategory(prev => (prev === null && flatData.length > 0 ? flatData[0] : prev));
      } catch {
        console.error('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

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
      
      if (name === 'name' && !editingCategory) {
        newData.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const submitData = {
      ...formData,
      parent_id: formData.parent_id || undefined
    };

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, submitData);
      } else {
        await categoryService.createCategory(submitData);
      }
      await fetchCategories();
      handleCloseModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save category';
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoryService.deleteCategory(id);
      await fetchCategories();
      if (selectedCategory?.id === id) {
        setSelectedCategory(categories.find(c => c.id !== id) || null);
      }
    } catch {
      alert('Failed to delete category');
    }
  };

  const getCategoryIcon = (category: Category) => {
    // Generate icon based on category name for demo
    const icons = ['📚', '💼', '🔬', '🎨', '💻', '🏥', '📝', '🎯'];
    return icons[category.name.charCodeAt(0) % icons.length];
  };

  return (
    <AdminLayout>
      <div style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        padding: '2rem',
        display: 'flex',
        gap: '2rem'
      }}>
        {/* Left Panel - Categories List */}
        <div style={{ width: '400px' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '1.875rem', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0', 
                color: '#1f2937' 
              }}>
                Manage Categories
              </h1>
              <p style={{ 
                color: '#6b7280', 
                margin: 0, 
                fontSize: '0.875rem' 
              }}>
                Configure categories, metadata, and content settings
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#374151',
              margin: '0 0 1rem 0'
            }}>
              Categories
            </h3>
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280',
              margin: '0 0 1rem 0'
            }}>
              Manage and organize content categories
            </p>
            <button 
              onClick={() => handleOpenModal()}
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Add Category
            </button>
          </div>

          {/* Categories List */}
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#6b7280'
            }}>
              Loading categories...
            </div>
          ) : (
            <div style={{ 
              backgroundColor: '#fff', 
              borderRadius: '0.75rem', 
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    backgroundColor: selectedCategory?.id === category.id ? '#f0f9ff' : '#fff',
                    borderLeft: selectedCategory?.id === category.id ? '3px solid #2563eb' : '3px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.5rem',
                    backgroundColor: category.parent_id ? '#d1fae5' : '#dbeafe',
                    color: category.parent_id ? '#059669' : '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.125rem'
                  }}>
                    {getCategoryIcon(category)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '500', 
                      color: '#1f2937',
                      fontSize: '0.875rem'
                    }}>
                      {category.parent_id ? '└ ' : ''}{category.name}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280'
                    }}>
                      {category.posts_count || 0} posts
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#9ca3af',
                      fontFamily: 'monospace'
                    }}>
                      /{category.slug}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(category);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '0.25rem',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        color: '#6b7280'
                      }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(category.id);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '0.25rem',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        color: '#6b7280'
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Category Details */}
        <div style={{ flex: 1 }}>
          {selectedCategory ? (
            <>
              {/* Category Details Header */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h2 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  margin: '0 0 1rem 0'
                }}>
                  Category Details
                </h2>
                
                {/* Category Name */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#374151',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    Category Name
                  </label>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#1f2937',
                    fontWeight: '500'
                  }}>
                    {selectedCategory.name}
                  </div>
                </div>

                {/* Category Slug */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#374151',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    URL Slug
                  </label>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    fontFamily: 'monospace'
                  }}>
                    /{selectedCategory.slug}
                  </div>
                </div>

                {/* Category Description */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#374151',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    Description
                  </label>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#1f2937',
                    minHeight: '4rem'
                  }}>
                    {selectedCategory.description || 'No description provided'}
                  </div>
                </div>

                {/* Parent Category */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#374151',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    Parent Category
                  </label>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#1f2937'
                  }}>
                    {selectedCategory.parent_id 
                      ? categories.find(c => c.id === selectedCategory.parent_id)?.name || 'Unknown Parent'
                      : 'Top Level Category'
                    }
                  </div>
                </div>

                {/* Created Date */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#374151',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    Created Date
                  </label>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    {selectedCategory.created_at 
                      ? new Date(selectedCategory.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Not available'
                    }
                  </div>
                </div>

                {/* Edit Category Button */}
                <button 
                  onClick={() => handleOpenModal(selectedCategory)}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.75rem 2rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Edit Category Details
                </button>
              </div>

              {/* Quick Stats */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                padding: '1.5rem'
              }}>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  margin: '0 0 1rem 0'
                }}>
                  Quick Stats
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Categories</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>{totalCategories}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Top Level</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>{topLevelCategories}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Sub Categories</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>{subCategories}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Posts in Category</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                      {selectedCategory.posts_count || 0}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
              padding: '3rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              Select a category to view details
            </div>
          )}
        </div>
      </div>

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
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '0.75rem',
            width: '100%',
            maxWidth: '500px',
            margin: '2rem',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginTop: 0, fontSize: '1.25rem', fontWeight: '600' }}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            
            {error && (
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: '#fee2e2', 
                color: '#b91c1c', 
                borderRadius: '0.375rem', 
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  fontSize: '0.875rem'
                }}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '0.375rem', 
                    border: '1px solid #d1d5db',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  fontSize: '0.875rem'
                }}>
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '0.375rem', 
                    border: '1px solid #d1d5db',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  fontSize: '0.875rem'
                }}>
                  Parent Category (Optional)
                </label>
                <select
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '0.375rem', 
                    border: '1px solid #d1d5db',
                    fontSize: '0.875rem',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="">None (Top Level)</option>
                  {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  fontSize: '0.875rem'
                }}>
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '0.375rem', 
                    border: '1px solid #d1d5db',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
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