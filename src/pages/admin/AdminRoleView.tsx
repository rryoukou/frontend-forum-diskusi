import React from 'react';
import type { Role } from './AdminRoles';
import type { RoleFormValues } from '../../types';

interface AdminRoleViewProps {
  roles: Role[];
  loading: boolean;
  isModalOpen: boolean;
  editingRole: Role | null;
  selectedRole: Role | null;
  submitting: boolean;
  error: string | null;
  handleOpenModal: (role?: Role | null) => void;
  handleCloseModal: () => void;
  handleFormSubmit: (values: RoleFormValues) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  setSelectedRole: (role: Role | null) => void;
}

const AdminRoleView: React.FC<AdminRoleViewProps> = ({
  roles,
  loading,
  selectedRole,
}) => {
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading roles...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Manage Roles</h2>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        {roles.map((role) => (
          <div 
            key={role.id} 
            style={{ 
              padding: '1rem', 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius)',
              opacity: selectedRole?.id === role.id ? 1 : 0.7
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem' }}>{role.name}</h3>
            <p style={{ margin: '0.5rem 0', color: 'var(--text-3)', fontSize: '0.85rem' }}>
              {role.description}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
              <span>Slug: {role.slug}</span>
              <span>•</span>
              <span>{role.permissions_count} permissions</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRoleView;
