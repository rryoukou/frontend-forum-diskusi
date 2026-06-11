import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import userService from '../../services/userService';
import type { User } from '../../types/index';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportCount] = useState(() => Math.floor(Math.random() * 15) + 5); // Mock data laporan

  // Perhitungan statistik tetap dari data user aktif
  const totalUsers = users.filter(user => !user.is_banned).length;
  const adminUsers = users.filter(user => user.roles?.some(r => r.name === 'admin')).length;
  const moderatorUsers = users.filter(user => user.roles?.some(r => r.name === 'moderator')).length;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersData = await userService.getAdminUsers();
        setUsers(usersData.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '2rem' }}>
        
        {/* Header Dashboard */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#1f2937' }}>
              Admin Dashboard
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
              Platform overview, system health, and quick metrics
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Loading overview...</div>
        ) : (
          /* Stats Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {/* Card Total Users */}
            <div style={{ backgroundColor: '#dbeafe', padding: '1.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: '#3b82f6', borderRadius: '50%', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.25rem' }}>👥</div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Users</div>
                <div style={{ fontSize: '2rem', fontWeight: '600', color: '#1f2937' }}>{totalUsers}</div>
              </div>
            </div>

            {/* Card Admins */}
            <div style={{ backgroundColor: '#fce7f3', padding: '1.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: '#ec4899', borderRadius: '50%', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.25rem' }}>⭐</div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Admins</div>
                <div style={{ fontSize: '2rem', fontWeight: '600', color: '#1f2937' }}>{adminUsers}</div>
              </div>
            </div>

            {/* Card Moderators */}
            <div style={{ backgroundColor: '#dbeafe', padding: '1.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: '#3b82f6', borderRadius: '50%', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.25rem' }}>🛡️</div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Moderators</div>
                <div style={{ fontSize: '2rem', fontWeight: '600', color: '#1f2937' }}>{moderatorUsers}</div>
              </div>
            </div>

            {/* Card Reports */}
            <div style={{ backgroundColor: '#fef3c7', padding: '1.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f59e0b', borderRadius: '50%', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.25rem' }}>📊</div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Reports</div>
                <div style={{ fontSize: '2rem', fontWeight: '600', color: '#1f2937' }}>{reportCount}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Kamu bisa menambahkan shortcut menu atau chart visual di bawah sini */}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;