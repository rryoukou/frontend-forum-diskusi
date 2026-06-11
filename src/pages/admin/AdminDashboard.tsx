import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import userService from '../../services/userService';
import moderationService from '../../services/moderationService';
import type { User } from '../../types/index';
import { Users, FileText, AlertTriangle, TrendingUp, ShieldAlert, ShieldCheck } from 'lucide-react';
import '../../App.css';

const AdminDashboard: React.FC = () => {
  const [users, setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats]   = useState({ totalUsers: 0, totalPosts: 0, activeReports: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ud = await userService.getAdminUsers();
        setUsers(ud.data);
        setStats({ totalUsers: ud.total, totalPosts: 20, activeReports: 5 });
      } catch (err) { console.error('Failed to fetch admin data', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const refreshUsers = async () => { const ud = await userService.getAdminUsers(); setUsers(ud.data); };

  const handleRoleChange = async (userId: string, currentRoles: { id: string; name: string }[]) => {
    const isMod = currentRoles.some(r => r.name === 'moderator');
    if (window.confirm(`Change role to ${isMod ? 'Regular User' : 'Moderator'}?`)) {
      try { await userService.updateUserRoles(userId, isMod ? ['user'] : ['user', 'moderator']); await refreshUsers(); }
      catch { alert('Failed to update role'); }
    }
  };
  const handleBanUser   = async (userId: string) => { const r = window.prompt('Ban reason:'); if (!r) return; try { await moderationService.banUser(userId, r); await refreshUsers(); } catch { console.error('Ban failed'); } };
  const handleUnbanUser = async (userId: string) => { const r = window.prompt('Unban reason:'); if (!r) return; try { await moderationService.unbanUser(userId, r); await refreshUsers(); } catch { console.error('Unban failed'); } };
  const handleWarnUser  = async (userId: string) => { const r = window.prompt('Warning reason:'); if (!r) return; try { await moderationService.warnUser(userId, r); alert('Warning sent.'); } catch { console.error('Warning failed'); } };

  return (
    <AdminLayout>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginTop: 4 }}>Manage users, roles, and platform activity.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-icon"><Users size={28} strokeWidth={1.8} style={{ color: 'var(--primary)' }} /></span>
          <span className="admin-stat-value">{stats.totalUsers}</span>
          <span className="admin-stat-label">Total Users</span>
        </div>
        <div className="admin-stat-card success">
          <span className="admin-stat-icon"><FileText size={28} strokeWidth={1.8} style={{ color: 'var(--success)' }} /></span>
          <span className="admin-stat-value">{stats.totalPosts}</span>
          <span className="admin-stat-label">Total Posts</span>
        </div>
        <div className="admin-stat-card danger">
          <span className="admin-stat-icon"><AlertTriangle size={28} strokeWidth={1.8} style={{ color: 'var(--danger)' }} /></span>
          <span className="admin-stat-value" style={{ color: 'var(--danger)' }}>{stats.activeReports}</span>
          <span className="admin-stat-label">Active Reports</span>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>User Management</h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{users.length} users</span>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading users...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th><th>Email</th><th>Roles</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{user.username}</span>
                        {user.is_banned && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'var(--danger-light)', color: 'var(--danger)' }}>
                            BANNED
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>{user.email}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {user.roles?.map(r => <span key={r.id} className={`admin-role-badge ${r.name}`}>{r.name}</span>)}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      {user.roles?.some(r => r.name === 'admin') ? (
                        <span style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>Immutable</span>
                      ) : (
                        <div className="admin-action-group">
                          <button onClick={() => handleRoleChange(user.id, user.roles || [])} className="admin-action-btn promote">
                            <TrendingUp size={12} strokeWidth={2.5} />
                            {user.roles?.some(r => r.name === 'moderator') ? 'Demote' : 'Make Mod'}
                          </button>
                          <button onClick={() => handleWarnUser(user.id)} className="admin-action-btn warn">
                            <AlertTriangle size={12} strokeWidth={2.5} /> Warn
                          </button>
                          {user.is_banned ? (
                            <button onClick={() => handleUnbanUser(user.id)} className="admin-action-btn unban">
                              <ShieldCheck size={12} strokeWidth={2.5} /> Unban
                            </button>
                          ) : (
                            <button onClick={() => handleBanUser(user.id)} className="admin-action-btn ban">
                              <ShieldAlert size={12} strokeWidth={2.5} /> Ban
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
