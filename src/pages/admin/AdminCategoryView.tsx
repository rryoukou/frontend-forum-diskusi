import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Plus, Pencil, Trash2, FolderTree, X, Check, Search,
  Tag, FileText, Calendar, ArrowUpRight, Link2, ChevronDown
} from 'lucide-react';
import type { Category } from '../../types/index';

interface AdminCategoryViewProps {
  categories: Category[];
  loading: boolean;
  isModalOpen: boolean;
  editingCategory: Category | null;
  selectedCategory: Category | null;
  submitting: boolean;
  error: string | null;
  totalCategories: number;
  topLevelCategories: number;
  subCategories: number;
  handleOpenModal: (cat?: Category | null) => void;
  handleCloseModal: () => void;
  handleFormSubmit: (values: any) => Promise<void>;
  handleDelete: (id: string) => void;
  setSelectedCategory: (cat: Category | null) => void;
}

// ════════════ SKELETON COMPONENT ════════════
const CategorySkeleton: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0.85rem',
        borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)',
        background: 'var(--surface)',
        minHeight: 68,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Icon Skeleton */}
      <div 
        className="skeleton-pulse"
        style={{ 
          width: 40, 
          height: 40, 
          flexShrink: 0, 
          borderRadius: 'var(--radius)', 
          background: 'var(--surface-2)' 
        }} 
      />

      {/* Text Skeleton */}
      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div 
          className="skeleton-pulse"
          style={{ 
            width: '60%', 
            height: '14px', 
            borderRadius: '4px', 
            background: 'var(--surface-2)' 
          }} 
        />
        <div 
          className="skeleton-pulse"
          style={{ 
            width: '40%', 
            height: '11px', 
            borderRadius: '4px', 
            background: 'var(--surface-2)' 
          }} 
        />
      </div>

      {/* Action Buttons Skeleton */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <div className="skeleton-pulse" style={{ width: 14, height: 14, borderRadius: '2px', background: 'var(--surface-2)' }} />
        <div className="skeleton-pulse" style={{ width: 14, height: 14, borderRadius: '2px', background: 'var(--surface-2)' }} />
      </div>
    </div>
  );
};

const getCategoryIcon = (name: string) => {
  const icons = ['📚', '💼', '🔬', '🎨', '💻', '🏥', '📝', '🎯'];
  return icons[name.charCodeAt(0) % icons.length];
};

const getCategoryIconStyle = (name: string): React.CSSProperties => {
  const lower = name.toLowerCase();
  if (lower.includes('cardio')) return { background: 'var(--danger-light)', color: 'var(--danger)' };
  if (lower.includes('diabet')) return { background: 'var(--warning-light)', color: 'var(--warning)' };
  if (lower.includes('respirat')) return { background: 'var(--success-light)', color: 'var(--success)' };
  if (lower.includes('neuro') || lower.includes('general') || lower.includes('umum')) return { background: 'var(--info-light)', color: 'var(--info)' };
  return { background: 'var(--primary-light)', color: 'var(--primary)' };
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Nama kategori wajib diisi'),
  slug: Yup.string().required('Slug wajib diisi'),
  description: Yup.string().optional(),
  parent_id: Yup.string().optional(),
});

const AdminCategoryView: React.FC<AdminCategoryViewProps> = ({
  categories, loading, isModalOpen, editingCategory, selectedCategory,
  submitting, error, totalCategories, topLevelCategories, subCategories,
  handleOpenModal, handleCloseModal, handleFormSubmit, handleDelete, setSelectedCategory,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const initialValues = {
    name: editingCategory?.name || '',
    slug: editingCategory?.slug || '',
    description: editingCategory?.description || '',
    parent_id: editingCategory?.parent_id || 'none', 
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--border)',
    boxShadow: 'var(--shadow-card)',
    padding: '1.5rem',
    width: '100%',
    boxSizing: 'border-box',
  };

  const fieldBoxStyle: React.CSSProperties = {
    background: 'var(--surface-2)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '0px 1rem',
    fontSize: '0.9rem',
    color: 'var(--text-1)',
    width: '100%',
    boxSizing: 'border-box',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const fieldLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-3)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  return (
    <div className="page-enter" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', minHeight: 'calc(100vh - 120px)' }}>
      
      {/* ═══════ LEFT PANEL — Category List ═══════ */}
      <div style={{ width: 360, minWidth: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: 24, alignSelf: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Categories</h1>
          <p style={{ marginTop: 4, fontSize: '0.85rem', color: 'var(--text-3)' }}>Configure categories, metadata, and content settings</p>
        </div>

        {/* Quick Stats Card */}
        <div style={cardStyle}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)' }}>Summary Overview</h3>
          <p style={{ marginTop: 2, fontSize: '0.75rem', color: 'var(--text-3)' }}>Manage and organize content categories</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
            <div style={{ textAlign: 'center', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', padding: '0.75rem 0.4rem' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>{totalCategories}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>Total</div>
            </div>
            <div style={{ textAlign: 'center', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', padding: '0.75rem 0.4rem' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--info)' }}>{topLevelCategories}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>Parent</div>
            </div>
            <div style={{ textAlign: 'center', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', padding: '0.75rem 0.4rem' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning)' }}>{subCategories}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>Sub</div>
            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ 
              marginTop: '1.25rem', 
              width: '100%', 
              height: 44,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8,
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }} 
            onClick={() => handleOpenModal()}
          >
            <Plus size={16} strokeWidth={3} /> Add New Category
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', height: 40, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '0px 0.75rem 0px 2.4rem', fontSize: '0.85rem', color: 'var(--text-1)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Categories List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 'calc(100vh - 440px)', overflowY: 'auto', paddingRight: 2 }}>
          {loading ? (
            <>
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
            </>
          ) : filteredCategories.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <FolderTree size={36} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>No categories found</p>
            </div>
          ) : (
            filteredCategories.map(cat => {
              const isSelected = selectedCategory?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem', borderRadius: 'var(--radius)',
                    border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                    background: isSelected ? 'var(--primary-soft)' : 'var(--surface)',
                    cursor: 'pointer', minHeight: 68, boxSizing: 'border-box', transition: 'var(--transition)'
                  }}
                >
                  <div style={{ width: 40, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)', fontSize: '1.1rem', ...(isSelected ? { background: 'var(--primary-light)', color: 'var(--primary)' } : getCategoryIconStyle(cat.name)) }}>
                    {getCategoryIcon(cat.name)}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cat.parent_id ? '↳ ' : ''}{cat.name}
                    </div>
                    <div style={{ fontSize: '0.7°Crem', color: 'var(--text-3)', marginTop: 2 }}>
                      {cat.children?.length ? `${cat.children.length} sub-categories` : 'Top-level'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4, flexShrink: 0, opacity: 0.6 }}>
                    <button onClick={e => { e.stopPropagation(); handleOpenModal(cat); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 4 }}><Pencil size={13} /></button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(cat.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}><Trash2 size={13} /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ═══════ RIGHT PANEL — Category Details ═══════ */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: 'calc(100vh - 120px)', alignSelf: 'flex-start' }}>
        {selectedCategory ? (
          <div style={{ ...cardStyle, padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14, fontSize: '1.6rem', ...getCategoryIconStyle(selectedCategory.name) }}>
                  {getCategoryIcon(selectedCategory.name)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1)' }}>{selectedCategory.name}</h2>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary)', marginTop: 2, display: 'inline-block' }}>slug: /{selectedCategory.slug}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="admin-action-btn promote" style={{ height: 34, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 650, cursor: 'pointer' }} onClick={() => handleOpenModal(selectedCategory)}><Pencil size={12} /> Edit</button>
                <button className="admin-action-btn ban" style={{ height: 34, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 650, cursor: 'pointer' }} onClick={() => handleDelete(selectedCategory.id)}><Trash2 size={12} /> Delete</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={fieldLabelStyle}><Tag size={12} /> Category Name</label>
                <div style={{ ...fieldBoxStyle, fontWeight: 600 }}>{selectedCategory.name}</div>
              </div>

              <div>
                <label style={fieldLabelStyle}><Link2 size={12} /> Route Slug</label>
                <div style={{ ...fieldBoxStyle, fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 500 }}>/{selectedCategory.slug}</div>
              </div>

              <div>
                <label style={fieldLabelStyle}><FileText size={12} /> Description</label>
                <div style={{ 
                  background: 'var(--surface-2)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-2)',
                  width: '100%',
                  boxSizing: 'border-box',
                  minHeight: 76, 
                  lineHeight: '1.5',
                  display: 'block',
                  overflow: 'hidden'
                }}>
                  {selectedCategory.description || <span style={{ fontStyle: 'italic', color: 'var(--text-3)' }}>No description available for this category.</span>}
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}><ArrowUpRight size={12} /> Parent Hierarchy</label>
                <div style={fieldBoxStyle}>
                  {selectedCategory.parent_id ? (
                    <span style={{ fontWeight: 500 }}>{categories.find(c => c.id === selectedCategory.parent_id)?.name || selectedCategory.parent_id}</span>
                  ) : (
                    <span style={{ fontStyle: 'italic', color: 'var(--text-3)', fontSize: '0.85rem' }}>None (This is a root top-level category)</span>
                  )}
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}><Calendar size={12} /> Date Created</label>
                <div style={fieldBoxStyle}>
                  {new Date(selectedCategory.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ minHeight: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <FolderTree size={44} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', margin: 0 }}>Select a category from the left panel to view full configuration details</p>
          </div>
        )}
      </div>

      {/* ═══════ MODAL (Radix UI Dialog + Formik) ═══════ */}
      <Dialog.Root open={isModalOpen} onOpenChange={open => !open && handleCloseModal()}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100 }} />
          <Dialog.Content 
            aria-describedby={undefined}
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: 460, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxSizing: 'border-box', zIndex: 101, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <Dialog.Title style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-1)' }}>
                {editingCategory ? 'Edit Existing Category' : 'Create New Category'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}><X size={16} /></button>
              </Dialog.Close>
            </div>

            {error && (
              <div style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', background: 'var(--danger-light)', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--danger)', border: '1.5px solid rgba(255,77,106,0.2)', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <Formik 
              initialValues={initialValues} 
              validationSchema={validationSchema} 
              onSubmit={(values) => {
                const formattedValues = {
                  ...values,
                  parent_id: values.parent_id === 'none' ? '' : values.parent_id
                };
                handleFormSubmit(formattedValues);
              }} 
              enableReinitialize
            >
              {({ setFieldValue, values }) => (
                <Form style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  
                  <div>
                    <label style={fieldLabelStyle}>Category Name</label>
                    <Field
                      name="name"
                      placeholder="e.g. Cardiovascular"
                      style={{ width: '100%', height: 42, background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '0px 1rem', fontSize: '0.9rem', color: 'var(--text-1)', outline: 'none', boxSizing: 'border-box' }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('name', e.target.value);
                        if (!editingCategory) {
                          setFieldValue('slug', e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                        }
                      }}
                    />
                    {/* PERBAIKAN: Menggunakan Render Props Pattern agar TypeScript tidak komplain */}
                    <ErrorMessage name="name">
                      {(msg) => (
                        <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: 5, fontWeight: 500 }}>
                          {msg}
                        </div>
                      )}
                    </ErrorMessage>
                  </div>

                  <div>
                    <label style={fieldLabelStyle}>Url Slug</label>
                    <Field name="slug" placeholder="e.g. cardiovascular" style={{ width: '100%', height: 42, background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '0px 1rem', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-1)', outline: 'none', boxSizing: 'border-box' }} />
                    {/* PERBAIKAN: Menggunakan Render Props Pattern agar TypeScript tidak komplain */}
                    <ErrorMessage name="slug">
                      {(msg) => (
                        <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: 5, fontWeight: 500 }}>
                          {msg}
                        </div>
                      )}
                    </ErrorMessage>
                  </div>

                  <div>
                    <label style={fieldLabelStyle}>Description (Optional)</label>
                    <Field name="description" as="textarea" rows={3} placeholder="Provide a brief context or topic scope..." style={{ width: '100%', background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.65rem 1rem', fontSize: '0.9rem', color: 'var(--text-1)', outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: '1.4' }} />
                  </div>

                  <div>
                    <label style={fieldLabelStyle}>Parent Assignment</label>
                    <Select.Root value={values.parent_id} onValueChange={(val) => setFieldValue('parent_id', val)}>
                      <Select.Trigger style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '0px 1rem', fontSize: '0.9rem', color: 'var(--text-1)', height: 42, boxSizing: 'border-box', cursor: 'pointer', outline: 'none' }}>
                        <Select.Value placeholder="None (Top-level)" />
                        <Select.Icon style={{ display: 'flex', alignItems: 'center' }}><ChevronDown size={14} /></Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: 5, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', zIndex: 200, minWidth: 200 }}>
                          <Select.Viewport>
                            <Select.Item value="none" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', color: 'var(--text-2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', userSelect: 'none' }}>
                              <Select.ItemText>None (Top-level)</Select.ItemText>
                            </Select.Item>
                            {categories
                              .filter(c => !c.parent_id && c.id !== editingCategory?.id)
                              .map(c => (
                                <Select.Item key={c.id} value={c.id} style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', color: 'var(--text-1)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', userSelect: 'none' }}>
                                  <Select.ItemText>{c.name}</Select.ItemText>
                                </Select.Item>
                              ))
                            }
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1.5px solid var(--border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                    <button type="button" className="btn-outline" style={{ height: 38, padding: '0 16px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }} onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ height: 38, padding: '0 16px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer' }} disabled={submitting}>
                      {submitting ? 'Saving...' : <><Check size={14} strokeWidth={2.5} /> {editingCategory ? 'Save Changes' : 'Create'}</>}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default AdminCategoryView;