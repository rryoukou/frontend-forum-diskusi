import React, { useEffect, useState } from 'react';
import { 
  Users, Search, Shield, UserCheck, UserX, 
  Bell, Filter, CheckCircle2, ShieldAlert
} from 'lucide-react';
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

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--border)',
    boxShadow: 'var(--shadow-card)',
    padding: '1.5rem',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  };

  const stats = {
    total: users.length,
    active: users.filter(u => !u.is_banned).length,
    banned: users.filter(u => u.is_banned).length,
    moderators: users.filter(u => u.roles?.some(r => r.name === 'moderator')).length
  };

  return (
    <AdminLayout>
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
        
        {/* Header Section */}
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            User Management
          </h1>
          <p style={{ marginTop: 4, fontSize: '0.85rem', color: 'var(--text-3)' }}>
            User directory, role management, and privilege controls
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 800 }}>{stats.total}</h2>
              </div>
              <div style={{ background: 'var(--primary-soft)', color: 'var(--primary)', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                <Users size={18} />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 800 }}>{stats.active}</h2>
              </div>
              <div style={{ background: 'var(--success-soft)', color: 'var(--success)', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                <UserCheck size={18} />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suspended</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 800 }}>{stats.banned}</h2>
              </div>
              <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                <UserX size={18} />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Moderators</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 800 }}>{stats.moderators}</h2>
              </div>
              <div style={{ background: 'var(--info-soft)', color: 'var(--info)', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                <Shield size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--text-1)', outline: 'none' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <Filter size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)} 
                style={{ padding: '0.65rem 2rem 0.65rem 2.25rem', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--text-1)', appearance: 'none', cursor: 'pointer', outline: 'none' }}
              >
                <option>All Roles</option>
                <option>Admin</option>
                <option>Moderator</option>
                <option>User</option>
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                style={{ padding: '0.65rem 1.5rem', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--text-1)', cursor: 'pointer', outline: 'none' }}
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div style={cardStyle}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)' }}>
              <div className="skeleton-pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 1rem' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>Fetching directory data...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-3)' }}>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>USER</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>EMAIL</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>ROLE</th>
                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'center' }}>STATUS</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>JOINED</th>
                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
                        <Users size={32} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                        <p style={{ margin: 0 }}>No matching users found in current scope.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const userRole = getUserRole(user);
                      const isAdmin = user.roles?.some(r => r.name === 'admin');
                      const isAnimating = showRoleChangeAnimation === user.id;
                      
                      return (
                        <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-1)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', border: '1px solid var(--primary-soft)' }}>
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div style={{ fontWeight: 600 }}>{user.username}</div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-2)' }}>{user.email}</td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ position: 'relative', minHeight: '1.5rem' }}>
                              {isAnimating && roleChangeDirection?.userId === user.id && (
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--success)', background: 'var(--success-soft)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--success)', whiteSpace: 'nowrap', animation: 'roleChange 2s ease-in-out' }}>
                                  <span>{roleChangeDirection.from}</span>
                                  <span>→</span>
                                  <span>{roleChangeDirection.to}</span>
                                </div>
                              )}
                              {isAdmin ? (
                                <span style={{ background: 'rgba(255, 77, 106, 0.1)', color: 'var(--danger)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block', opacity: isAnimating ? 0.3 : 1 }}>Admin</span>
                              ) : (
                                <select 
                                  value={userRole} 
                                  disabled={isAnimating} 
                                  onChange={(e) => e.target.value !== userRole && handleRoleChange(user.id, user.roles || [])} 
                                  style={{ 
                                    background: userRole === 'Moderator' ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface-2)', 
                                    color: userRole === 'Moderator' ? 'var(--info)' : 'var(--text-1)', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    padding: '2px 8px', 
                                    fontSize: '0.7rem', 
                                    fontWeight: 700, 
                                    cursor: 'pointer', 
                                    outline: 'none',
                                    opacity: isAnimating ? 0.3 : 1 
                                  }}
                                >
                                  <option value="User">User</option>
                                  <option value="Moderator">Moderator</option>
                                </select>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {user.is_banned ? (
                              <span style={{ color: 'var(--danger)', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(255,77,106,0.1)', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <UserX size={10} /> suspended
                              </span>
                            ) : (
                              <span style={{ color: 'var(--success)', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(46,213,115,0.1)', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <UserCheck size={10} /> active
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-3)', fontSize: '0.8rem' }}>{formatDate(user.created_at)}</td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            {isAdmin ? (
                              <span style={{ color: 'var(--text-3)', fontSize: '0.75rem', fontStyle: 'italic', opacity: 0.6 }}>System Protected</span>
                            ) : (
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => openModModal('warn', user.id, user.username)} 
                                  className="admin-action-btn promote"
                                  style={{ padding: '4px 8px', fontSize: '0.7rem', gap: 4 }}
                                  title="Warn User"
                                >
                                  <Bell size={12} /> Warn
                                </button>
                                {user.is_banned ? (
                                  <button 
                                    onClick={() => openModModal('unban', user.id, user.username)} 
                                    className="admin-action-btn promote"
                                    style={{ padding: '4px 8px', fontSize: '0.7rem', gap: 4, background: 'var(--success-soft)', color: 'var(--success)' }}
                                  >
                                    <CheckCircle2 size={12} /> Unban
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => openModModal('ban', user.id, user.username)} 
                                    className="admin-action-btn ban"
                                    style={{ padding: '4px 8px', fontSize: '0.7rem', gap: 4 }}
                                  >
                                    <ShieldAlert size={12} /> Ban
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Global Keyframe CSS */}
        <style>{`
          @keyframes roleChange {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          }
          
          select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
          
          .admin-action-btn {
            border: 1.5px solid var(--border);
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            transition: var(--transition);
            background: var(--surface);
            color: var(--text-2);
          }
          
          .admin-action-btn:hover {
            border-color: var(--primary);
            color: var(--primary);
          }
          
          .admin-action-btn.promote:hover {
            border-color: var(--info);
            color: var(--info);
            background: var(--info-soft);
          }
          
          .admin-action-btn.ban:hover {
            border-color: var(--danger);
            color: var(--danger);
            background: var(--danger-soft);
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