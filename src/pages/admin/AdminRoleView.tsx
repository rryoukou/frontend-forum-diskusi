import React, { useEffect, useState } from 'react';
import userService from '../../services/userService';
import moderationService from '../../services/moderationService';
import type { User } from '../../types/index';
import { 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  User as UserIcon, 
  UserX, 
  UserCheck, 
  AlertTriangle, 
  Clock 
} from 'lucide-react';
import ModerationModal, { type ModerationActionType } from '../../components/ModerationModal';

// ════════════ LOADING SKELETON COMPONENT ════════════
const TableSkeleton: React.FC = () => {
  return (
    <div style={{ background: '#121212', borderRadius: '12px', overflow: 'hidden', border: '1px solid #222222' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#181818', borderBottom: '1px solid #222222' }}>
            <th style={{ padding: '14px 16px', width: '25%' }}><div className="skeleton-pulse" style={{ width: '60%', height: '12px', borderRadius: '4px' }} /></th>
            <th style={{ padding: '14px 16px', width: '20%' }}><div className="skeleton-pulse" style={{ width: '70%', height: '12px', borderRadius: '4px' }} /></th>
            <th style={{ padding: '14px 16px', width: '15%' }}><div className="skeleton-pulse" style={{ width: '50%', height: '12px', borderRadius: '4px' }} /></th>
            <th style={{ padding: '14px 16px', width: '12%' }}><div className="skeleton-pulse" style={{ width: '40%', height: '12px', borderRadius: '4px' }} /></th>
            <th style={{ padding: '14px 16px', width: '13%' }}><div className="skeleton-pulse" style={{ width: '50%', height: '12px', borderRadius: '4px' }} /></th>
            <th style={{ padding: '14px 16px', width: '15%', textAlign: 'center' }}><div className="skeleton-pulse" style={{ width: '60%', height: '12px', borderRadius: '4px', margin: '0 auto' }} /></th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((row) => (
            <tr key={row} style={{ borderBottom: '1px solid #1c1c1c' }}>
              {/* Kolom Username */}
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="skeleton-pulse" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                  <div className="skeleton-pulse" style={{ width: '110px', height: '12px', borderRadius: '4px' }} />
                </div>
              </td>
              {/* Kolom Email */}
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton-pulse" style={{ width: '85%', height: '12px', borderRadius: '4px' }} />
              </td>
              {/* Kolom Role */}
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton-pulse" style={{ width: '75px', height: '24px', borderRadius: '6px' }} />
              </td>
              {/* Kolom Status */}
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton-pulse" style={{ width: '50px', height: '18px', borderRadius: '4px' }} />
              </td>
              {/* Kolom Join Date */}
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton-pulse" style={{ width: '70px', height: '12px', borderRadius: '4px' }} />
              </td>
              {/* Kolom Opsi Akses */}
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <div className="skeleton-pulse" style={{ width: '65px', height: '24px', borderRadius: '6px' }} />
                  <div className="skeleton-pulse" style={{ width: '65px', height: '24px', borderRadius: '6px' }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

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
    refreshUsersData().finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId: string, currentRoles: any[]) => {
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
    } catch (error) {
      alert(`Failed to ${type} user`);
      closeModModal();
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getUserRole = (user: User) => {
    if (user.roles?.some(r => r.name === 'admin')) return 'Admin';
    if (user.roles?.some(r => r.name === 'moderator')) return 'Moderator';
    return 'User';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return <ShieldAlert size={14} style={{ color: '#ff8282' }} />;
      case 'Moderator': return <ShieldCheck size={14} style={{ color: '#deff9a' }} />;
      default: return <UserIcon size={14} style={{ color: '#aaa' }} />;
    }
  };

  return (
    <>
      <div style={{ color: '#ffffff', padding: '5px', fontFamily: 'system-ui, sans-serif' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', letterSpacing: '-0.5px' }}>User Access Management</h2>
          <p style={{ color: '#8e8e8e', margin: '6px 0 0 0', fontSize: '13.5px' }}>
            Modifikasi hak akses akun pengguna secara langsung serta manajemen penangguhan status.
          </p>
        </div>

        {/* Bar Pencarian & Filter */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', alignItems: 'center' }}>
          
          {/* Kolom Search Panjang */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555555', zIndex: 2 }} />
            {loading ? (
              <div className="skeleton-pulse" style={{ width: '100%', height: '37px', borderRadius: '8px' }} />
            ) : (
              <input
                type="text"
                placeholder="Cari user berdasarkan nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', padding: '9px 10px 9px 36px', borderRadius: '8px', 
                  background: '#121212', border: '1px solid #222222', color: '#ffffff', 
                  fontSize: '13px', outline: 'none', transition: 'border 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.border = '1px solid #444'}
                onBlur={(e) => e.currentTarget.style.border = '1px solid #222222'}
              />
            )}
          </div>

          {/* Dropdown Role */}
          {loading ? (
            <div className="skeleton-pulse" style={{ width: '130px', height: '37px', borderRadius: '8px' }} />
          ) : (
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)} 
              style={{ 
                width: '130px', padding: '9px 12px', borderRadius: '8px', background: '#121212', 
                border: '1px solid #222222', color: '#ffffff', cursor: 'pointer', 
                fontSize: '13px', outline: 'none' 
              }}
            >
              <option>All Roles</option>
              <option>Admin</option>
              <option>Moderator</option>
              <option>User</option>
            </select>
          )}

          {/* Dropdown Status */}
          {loading ? (
            <div className="skeleton-pulse" style={{ width: '130px', height: '37px', borderRadius: '8px' }} />
          ) : (
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              style={{ 
                width: '130px', padding: '9px 12px', borderRadius: '8px', background: '#121212', 
                border: '1px solid #222222', color: '#ffffff', cursor: 'pointer', 
                fontSize: '13px', outline: 'none' 
              }}
            >
              <option>All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          )}
        </div>

        {/* Data Table / Loading State */}
        {loading ? (
          <TableSkeleton />
        ) : (
          <div style={{ background: '#121212', borderRadius: '12px', overflow: 'hidden', border: '1px solid #222222' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#181818', borderBottom: '1px solid #222222' }}>
                  <th style={{ padding: '14px 16px', color: '#8e8e8e', fontWeight: '500' }}>Username</th>
                  <th style={{ padding: '14px 16px', color: '#8e8e8e', fontWeight: '500' }}>Email</th>
                  <th style={{ padding: '14px 16px', color: '#8e8e8e', fontWeight: '500' }}>Role Saat Ini</th>
                  <th style={{ padding: '14px 16px', color: '#8e8e8e', fontWeight: '500' }}>Status</th>
                  <th style={{ padding: '14px 16px', color: '#8e8e8e', fontWeight: '500' }}>Join Date</th>
                  <th style={{ padding: '14px 16px', color: '#8e8e8e', fontWeight: '500', textAlign: 'center' }}>Opsi Akses</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const userRole = getUserRole(user);
                    const isAdmin = user.roles?.some(r => r.name === 'admin');
                    const isAnimating = showRoleChangeAnimation === user.id;
                    
                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid #1c1c1c' }}>
                        {/* Username */}
                        <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ 
                              width: '28px', height: '28px', borderRadius: '50%', background: '#242424', 
                              color: '#deff9a', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              fontSize: '12px', fontWeight: '700', border: '1px solid #333' 
                            }}>
                              {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span>{user.username}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: '14px 16px', color: '#b3b3b3' }}>{user.email}</td>

                        {/* Role Selection */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            {isAnimating && roleChangeDirection?.userId === user.id && (
                              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: '#deff9a', backgroundColor: '#1a1a1a', padding: '4px 10px', borderRadius: '6px', border: '1px solid #deff9a', whiteSpace: 'nowrap', animation: 'roleChange 2s ease-in-out' }}>
                                <span>{roleChangeDirection.from}</span>
                                <span>→</span>
                                <span>{roleChangeDirection.to}</span>
                              </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: isAnimating ? 0.3 : 1 }}>
                              {getRoleIcon(userRole)}
                              {isAdmin ? (
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#ff8282' }}>
                                  {userRole}
                                </span>
                              ) : (
                                <select 
                                  value={userRole} 
                                  disabled={isAnimating} 
                                  onChange={(e) => e.target.value !== userRole && handleRoleChange(user.id, user.roles || [])} 
                                  style={{ 
                                    padding: '4px 8px', borderRadius: '6px', background: '#1a1a1a', 
                                    border: '1px solid #333333', color: userRole === 'Moderator' ? '#deff9a' : '#ffffff', 
                                    fontSize: '12px', fontWeight: '600', cursor: 'pointer', outline: 'none' 
                                  }}
                                >
                                  <option value="User">USER</option>
                                  <option value="Moderator">MODERATOR</option>
                                </select>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status Label */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ 
                            padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                            background: user.is_banned ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)',
                            color: user.is_banned ? '#e74c3c' : '#2ecc71'
                          }}>
                            {user.is_banned ? 'Banned' : 'Aktif'}
                          </span>
                        </td>

                        {/* Join Date */}
                        <td style={{ padding: '14px 16px', color: '#b3b3b3' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={12} style={{ color: '#666' }} />
                            {formatDate(user.created_at)}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            {isAdmin ? (
                              <span style={{ color: '#555555', fontSize: '13px', fontStyle: 'italic' }}>Immutable</span>
                            ) : (
                              <>
                                {user.is_banned ? (
                                  <button 
                                    onClick={() => openModModal('unban', user.id, user.username || '')} 
                                    style={{
                                      padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                      background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71',
                                      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600'
                                    }}
                                  >
                                    <UserCheck size={13} /> Unban
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => openModModal('ban', user.id, user.username || '')} 
                                    style={{
                                      padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                      background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c',
                                      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600'
                                    }}
                                  >
                                    <UserX size={13} /> Ban
                                  </button>
                                )}
                                <button 
                                  onClick={() => openModModal('warn', user.id, user.username || '')} 
                                  style={{
                                    padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                    background: 'rgba(241, 196, 15, 0.15)', color: '#f1c40f',
                                    display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600'
                                  }}
                                >
                                  <AlertTriangle size={13} /> Warn
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#555555' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={20} />
                        <span>Tidak ada data user yang cocok dengan pencarian.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Global CSS Keyframes */}
        <style>{`
          .skeleton-pulse {
            background: linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%);
            background-size: 200% 100%;
            animation: pulse-animation 1.5s infinite linear;
          }

          @keyframes pulse-animation {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

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
    </>
  );
};

export default UserManagement;