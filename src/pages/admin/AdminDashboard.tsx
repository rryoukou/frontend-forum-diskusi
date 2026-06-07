import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import userService from '../../services/userService';
import moderationService from '../../services/moderationService';
import authService from '../../services/authService';
import type { User } from '../../types/index';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, activeReports: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await userService.getAdminUsers();
        setUsers(usersData.data);
        setStats({
          totalUsers: usersData.total,
          totalPosts: 20, // Mock for now
          activeReports: 5 // Mock for now
        });
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, currentRoles: any[]) => {
    const isMod = currentRoles.some(r => r.name === 'moderator');
    const newRole = isMod ? ['user'] : ['user', 'moderator'];
    
    if (window.confirm(`Change role to ${isMod ? 'Regular User' : 'Moderator'}?`)) {
      try {
        await userService.updateUserRoles(userId, newRole);
        // Refresh list
        const updatedUsers = await userService.getAdminUsers();
        setUsers(updatedUsers.data);
      } catch (err) {
        alert('Failed to update role');
      }
    }
  };

  const handleBanUser = async (userId: string) => {
    const reason = window.prompt('Enter reason for banning this user:');
    if (!reason) return;
    try {
      await moderationService.banUser(userId, reason);
      alert('User banned successfully');
      // Refresh list
      const usersData = await userService.getAdminUsers();
      setUsers(usersData.data);
    } catch (error) {
      console.error('Ban failed');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    const reason = window.prompt('Enter reason for unbanning this user:');
    if (!reason) return;
    try {
      await moderationService.unbanUser(userId, reason);
      alert('User unbanned successfully');
      // Refresh list
      const usersData = await userService.getAdminUsers();
      setUsers(usersData.data);
    } catch (error) {
      console.error('Unban failed');
    }
  };

  const handleWarnUser = async (userId: string) => {
    const reason = window.prompt('Enter warning reason:');
    if (!reason) return;
    try {
      await moderationService.warnUser(userId, reason);
      alert('Warning sent successfully');
    } catch (error) {
      console.error('Warning failed');
    }
  };

  return (
    <AdminLayout>
      <h1>Admin Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem', marginBottom: '3rem' }}>
        <div style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{stats.totalUsers}</p>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Total Posts</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{stats.totalPosts}</p>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Active Reports</h3>
          <p style={{ fontSize: '2rem', color: 'red', margin: 0 }}>{stats.activeReports}</p>
        </div>
      </div>

      <h2>User Management</h2>
      {loading ? <p>Loading users...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', backgroundColor: '#fff' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Username</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Email</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Roles</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Joined</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>{user.username}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>{user.email}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                  {user.roles?.map(r => (
                    <span key={r.id} style={{ 
                      backgroundColor: r.name === 'admin' ? '#ffc107' : r.name === 'moderator' ? '#17a2b8' : '#6c757d',
                      color: '#fff',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      marginRight: '0.3rem'
                    }}>
                      {r.name}
                    </span>
                  ))}
                </td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                  {user.roles?.some(r => r.name === 'admin') ? (
                    <span style={{ color: '#999', fontSize: '0.9rem' }}>Immutable</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleRoleChange(user.id, user.roles || [])}
                        style={{ padding: '0.3rem 0.6rem', cursor: 'pointer' }}
                      >
                        {user.roles?.some(r => r.name === 'moderator') ? 'Demote' : 'Promote Mod'}
                      </button>
                      <button 
                        onClick={() => handleWarnUser(user.id)}
                        style={{ padding: '0.3rem 0.6rem', cursor: 'pointer', backgroundColor: '#fffbe6', color: '#b45309', border: '1px solid #ffe58f' }}
                      >
                        Warn
                      </button>
                      {user.is_banned ? (
                        <button 
                          onClick={() => handleUnbanUser(user.id)}
                          style={{ padding: '0.3rem 0.6rem', cursor: 'pointer', backgroundColor: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff' }}
                        >
                          Unban
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleBanUser(user.id)}
                          style={{ padding: '0.3rem 0.6rem', cursor: 'pointer', backgroundColor: '#fff1f0', color: '#ef4444', border: '1px solid #ffa39e' }}
                        >
                          Ban
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
