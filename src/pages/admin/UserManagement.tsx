import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import userService from '../../services/userService';
import moderationService from '../../services/moderationService';
import type { User } from '../../types/index';
import ModerationModal, { type ModerationActionType } from '../../components/ModerationModal';

interface ModalState {
  isOpen: boolean;
  type: ModerationActionType;
  userId: string;
  username: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showRoleChangeAnimation, setShowRoleChangeAnimation] = useState<string | null>(null);
  const [roleChangeDirection, setRoleChangeDirection] = useState<{userId: string, from: string, to: string} | null>(null);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'warn',
    userId: '',
    username: '',
  });

  const refreshUsersData = async () => {
    try {
      const usersData = await userService.getAdminUsers();
      setUsers(usersData.data);
    } catch (error) {
      console.error('Failed to fetch user directory', error);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await userService.getAdminUsers();
        setUsers(usersData.data);
      } catch (error) {
        console.error('Failed to fetch user directory', error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, currentRoles: { name: string }[]) => {
    const isCurrentlyModerator = currentRoles.some(r => r.name === 'moderator');
    const newRole = isCurrentlyModerator ? ['user'] : ['user', 'moderator'];
    const fromRole = isCurrentlyModerator ? 'Moderator' : 'User';
    const toRole = isCurrentlyModerator ? 'User' : 'Moderator';
    
    try {
      setShowRoleChangeAnimation(userId);
      setRoleChangeDirection({ userId, from: fromRole, to: toRole });
      
      await userService.updateUserRoles(userId, newRole);
      
      setTimeout(async () => {
        await refreshUsersData();
        setShowRoleChangeAnimation(null);
        setRoleChangeDirection(null);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to update role:', error);
      setShowRoleChangeAnimation(null);
      setRoleChangeDirection(null);
      alert('Failed to update user role');
    }
  };

  const openModModal = (type: ModerationActionType, userId: string, username: string) => {
    setModal({
      isOpen: true,
      type,
      userId,
      username,
    });
  };

  const closeModModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleModConfirm = async (reason: string) => {
    const { type, userId } = modal;
    
    try {
      if (type === 'warn') {
        await moderationService.warnUser(userId, reason);
        alert('Warning sent successfully');
      } else if (type === 'ban') {
        await moderationService.banUser(userId, reason);
        alert('User banned successfully');
        await refreshUsersData();
      } else if (type === 'unban') {
        await moderationService.unbanUser(userId, reason);
        alert('User unbanned successfully');
        await refreshUsersData();
      }
      closeModModal();
    } catch {
      alert(`Failed to ${type} user`);
      closeModModal();
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'All Roles' || 
                       (roleFilter === 'Admin' && user.roles?.some(r => r.name === 'admin')) ||
                       (roleFilter === 'Moderator' && user.roles?.some(r => r.name === 'moderator')) ||
                       (roleFilter === 'User' && !user.roles?.some(r => r.name === 'admin' || r.name === 'moderator'));
    
    const matchesStatus = statusFilter === 'All Status' ||
                         (statusFilter === 'Active' && !user.is_banned) ||
                         (statusFilter === 'Suspended' && user.is_banned);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getUserRole = (user: User) => {
    if (user.roles?.some(r => r.name === 'admin')) return 'Admin';
    if (user.roles?.some(r => r.name === 'moderator')) return 'Moderator';
    return 'User';
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'Admin': return { backgroundColor: '#e91e63', color: '#fff' };
      case 'Moderator': return { backgroundColor: '#2196f3', color: '#fff' };
      default: return { backgroundColor: '#6c757d', color: '#fff' };
    }
  };

  return (
    <AdminLayout>
      <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '2rem' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#1f2937' }}>
              Manage Users
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
              User directory, role management, and privilege controls
            </p>
          </div>
        </div>

        {/* Filters Row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', width: '300px' }}
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: '#fff', cursor: 'pointer', width: '150px' }}>
            <option>All Roles</option>
            <option>Admin</option>
            <option>Moderator</option>
            <option>User</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: '#fff', cursor: 'pointer', width: '150px' }}>
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>
        </div>

        {/* Data Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Loading directory...</div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '500', fontSize: '0.875rem', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>User</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '500', fontSize: '0.875rem', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '500', fontSize: '0.875rem', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '500', fontSize: '0.875rem', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '500', fontSize: '0.875rem', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Join Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '500', fontSize: '0.875rem', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const userRole = getUserRole(user);
                  const isAdmin = user.roles?.some(r => r.name === 'admin');
                  const isAnimating = showRoleChangeAnimation === user.id;
                  
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '500', fontSize: '0.875rem' }}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ fontWeight: '500', color: '#1f2937' }}>{user.username}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>{user.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ position: 'relative', minHeight: '2rem' }}>
                          {isAnimating && roleChangeDirection?.userId === user.id && (
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#059669', backgroundColor: '#f0fdf4', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0', whiteSpace: 'nowrap', animation: 'roleChange 2s ease-in-out' }}>
                              <span style={{ ...getRoleBadgeStyle(roleChangeDirection.from), padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.7rem' }}>{roleChangeDirection.from}</span>
                              <span>→</span>
                              <span style={{ ...getRoleBadgeStyle(roleChangeDirection.to), padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.7rem' }}>{roleChangeDirection.to}</span>
                            </div>
                          )}
                          {isAdmin ? (
                            <span style={{ ...getRoleBadgeStyle(userRole), borderRadius: '0.375rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: '500', display: 'inline-block', opacity: isAnimating ? 0.3 : 1 }}>{userRole}</span>
                          ) : (
                            <select value={userRole} disabled={isAnimating} onChange={(e) => e.target.value !== userRole && handleRoleChange(user.id, user.roles || [])} style={{ ...getRoleBadgeStyle(userRole), border: 'none', borderRadius: '0.375rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer', opacity: isAnimating ? 0.3 : 1 }}>
                              <option value="User">User</option>
                              <option value="Moderator">Moderator</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ backgroundColor: user.is_banned ? '#fee2e2' : '#d1fae5', color: user.is_banned ? '#dc2626' : '#059669', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '500' }}>
                          {user.is_banned ? 'suspended' : 'active'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>{formatDate(user.created_at)}</td>
                      <td style={{ padding: '1rem' }}>
                        {isAdmin ? (
                          <span style={{ color: '#9ca3af', fontSize: '0.875rem', fontStyle: 'italic' }}>Immutable</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {user.is_banned ? (
                              <button onClick={() => openModModal('unban', user.id, user.username)} style={{ backgroundColor: '#d1fae5', color: '#059669', border: 'none', borderRadius: '0.375rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer' }}>Unban</button>
                            ) : (
                              <button onClick={() => openModModal('ban', user.id, user.username)} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.375rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer' }}>Ban</button>
                            )}
                            <button onClick={() => openModModal('warn', user.id, user.username)} style={{ backgroundColor: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '0.375rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer' }}>Warn</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Global Keyframe CSS */}
        <style>{`
          @keyframes roleChange {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          }
        `}</style>
      </div>

      <ModerationModal
        isOpen={modal.isOpen}
        type={modal.type}
        username={modal.username}
        onClose={closeModModal}
        onConfirm={handleModConfirm}
      />
    </AdminLayout>
  );
};

export default UserManagement;