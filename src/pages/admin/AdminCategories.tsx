import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import type { Category } from '../../types/index';
import AdminCategoryView from './AdminCategoryView';
// Import Axios instance atau service kamu yang menggunakan Axios
import categoryService from '../../services/categoryService';

// ─── Interface untuk Tipe Data Form (Pengganti 'any' di baris 94) ───
export interface CategoryFormValues {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
}

/* ─── Custom Hook: Mengelola State & Handler Berbasis Axios ─── */
function useAdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCat] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper untuk meratakan nested category dari backend Go jika berbentuk tree
  const flattenCategories = (nested: Category[]): Category[] => {
    const flat: Category[] = [];
    const recurse = (list: Category[]) => {
      for (const cat of list) {
        const { children, ...rest } = cat;
        flat.push(rest as Category);
        if (children && children.length > 0) recurse(children);
      }
    };
    recurse(nested);
    return flat;
  };

  // Fetching data menggunakan Axios murni + useEffect sesuai spek
  const fetchCategories = useCallback(async () => {
    try {
      // categoryService.getCategories() harus berupa Axios call: axios.get('/categories')
      const data = await categoryService.getCategories();
      const flat = flattenCategories(data);
      setCategories(flat);
      
      // Pertahankan kategori yang sedang dipilih atau default ke indeks pertama
      setSelectedCategory(prev => {
        if (prev) {
          const stillExists = flat.find(c => c.id === prev.id);
          if (stillExists) return stillExists;
        }
        return flat.length > 0 ? flat[0] : null;
      });
    } catch (err) {
      console.error('Failed to fetch categories via Axios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lifecycle data fetching saat komponen dipasang (mount)
  useEffect(() => {
    let isMounted = true;
    
    const initFetch = async () => {
      try {
        const data = await categoryService.getCategories();
        const flat = flattenCategories(data);
        if (isMounted) {
          setCategories(flat);
          setSelectedCategory(flat.length > 0 ? flat[0] : null);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initFetch();
    return () => { isMounted = false; };
  }, []);

  const handleOpenModal = (cat: Category | null = null) => {
    if (cat) {
      setEditingCat(cat);
    } else {
      setEditingCat(null);
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCat(null);
  };

  // SINKRONISASI: Tipe data 'any' sudah diganti dengan 'CategoryFormValues'
  const handleFormSubmit = async (values: CategoryFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      // Bersihkan nilai 'none' dari Radix Select menjadi undefined/string kosong sebelum dikirim ke Axios
      const submitData = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        parent_id: values.parent_id === 'none' || !values.parent_id ? undefined : values.parent_id
      };

      if (editingCategory) {
        // Axios PUT / PATCH call
        await categoryService.updateCategory(editingCategory.id, submitData);
      } else {
        // Axios POST call
        await categoryService.createCategory(submitData);
      }

      await fetchCategories();
      handleCloseModal();
    } catch (err: any) {
      // Tangkap error response standar dari Axios interceptor / objek AxiosError
      const message = err.response?.data?.message || 'Failed to save category';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      // Axios DELETE call
      await categoryService.deleteCategory(id);
      await fetchCategories();
      
      if (selectedCategory?.id === id) {
        setSelectedCategory(categories.find(c => c.id !== id) || null);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete category';
      alert(message);
    }
  };

  // Properti kalkulasi (Derived State) untuk Quick Stats Card
  const totalCategories = categories.length;
  const topLevelCategories = categories.filter(c => !c.parent_id).length;
  const subCategories = categories.filter(c => c.parent_id).length;

  return {
    categories,
    loading,
    isModalOpen,
    editingCategory,
    selectedCategory,
    submitting,
    error,
    totalCategories,
    topLevelCategories,
    subCategories,
    handleOpenModal,
    handleCloseModal,
    handleFormSubmit, // Oper fungsi baru ini ke AdminCategoryView
    handleDelete,
    setSelectedCategory,
  };
}

/* ─── Container Component murni sesuai AdminLayout ─── */
const AdminCategories: React.FC = () => {
  const categoryProps = useAdminCategories();

  return (
    <AdminLayout>
      {/* Passing seluruh data state murni Axios & Formik ke view layer */}
      <AdminCategoryView {...categoryProps} />
    </AdminLayout>
  );
};

export default AdminCategories;