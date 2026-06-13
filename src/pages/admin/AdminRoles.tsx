import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import AdminRoleView from './AdminRoleView';

// Definisikan Type Interface Role lokal agar bisa dieksport ke View
export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions_count: number;
  created_at: string;
}

function useAdminRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      // Data dummy fallback agar visual langsung terlihat aman
      const dummyRoles: Role[] = [
        { id: '1', name: 'Super Administrator', slug: 'super-admin', description: 'Full system access override control panels and data auditing.', permissions_count: 32, created_at: '2026-01-15' },
        { id: '2', name: 'Content Moderator', slug: 'moderator', description: 'Can review, delete, and manage flagged discussions or categories.', permissions_count: 14, created_at: '2026-02-10' },
        { id: '3', name: 'Standard User', slug: 'user', description: 'Default client account role with capabilities to create thread topics.', permissions_count: 5, created_at: '2026-02-20' },
      ];
      setRoles(dummyRoles);
      setSelectedRole(prev => prev ?? dummyRoles[0]);
    } catch (err) {
      console.error("Failed fetching roles", err);
    } finally { // 🛠️ PERBAIKAN: Menggunakan 'finally' (double l)
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleOpenModal = (role: Role | null = null) => {
    setEditingRole(role);
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleFormSubmit = async (values: any) => {
    setSubmitting(true);
    setError(null);
    try {
      if (editingRole) {
        console.log('Updating role ID:', editingRole.id, values);
      } else {
        console.log('Creating new role:', values);
      }
      await fetchRoles();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync role data schemas');
    } finally { // 🛠️ PERBAIKAN: Menggunakan 'finally' (double l)
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to completely drop this system role?')) return;
    try {
      console.log('Deleted role ID:', id);
      await fetchRoles();
      if (selectedRole?.id === id) {
        setSelectedRole(roles.find(r => r.id !== id) || null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed operation on system role extraction');
    }
  };

  return {
    roles, loading, isModalOpen, editingRole, selectedRole, submitting, error,
    handleOpenModal, handleCloseModal, handleFormSubmit, handleDelete, setSelectedRole
  };
}

const AdminRoles: React.FC = () => {
  const roleProps = useAdminRoles();

  return (
    <AdminLayout>
      {/* Passing properti dari hook useAdminRoles ke AdminRoleView */}
      <AdminRoleView {...roleProps} />
    </AdminLayout>
  );
};

export default AdminRoles;