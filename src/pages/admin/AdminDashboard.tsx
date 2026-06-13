import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import userService from '../../services/userService';
import AdminDashboardView from './AdminDashboardView';
import type { User } from '../../types/index';

function useAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    moderatorUsers: 0,
    reportCount: 0
  });

  useEffect(() => {
    // 1. Nama fungsi harus sinkron dengan yang dipanggil di bawah
    const fetchData = async () => {
      try {
        setLoading(true);
        const usersData = await userService.getAdminUsers();
        
        const usersList: User[] = usersData?.data || [];
        setUsers(usersList);

        const totalUsers = usersList.filter(user => user && !user.is_banned).length;
        const adminUsers = usersList.filter(user => user?.roles?.some(r => r.name === 'admin')).length;
        const moderatorUsers = usersList.filter(user => user?.roles?.some(r => r.name === 'moderator')).length;
        const reportCount = Math.floor(Math.random() * 15) + 5; 

        setStats({
          totalUsers,
          adminUsers,
          moderatorUsers,
          reportCount
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats from API', error);
      } finally {
        setLoading(false);
      }
    };

    // 2. Panggil nama fungsi yang benar di sini
    fetchData();
  }, []);

  return {
    stats,
    users,
    loading
  };
}

const AdminDashboard: React.FC = () => {
  const dashboardProps = useAdminDashboard();

  return (
    <AdminLayout>
      <AdminDashboardView {...dashboardProps} />
    </AdminLayout>
  );
};

export default AdminDashboard;