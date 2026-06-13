import { useEffect, useState, useCallback } from 'react';
import moderationService from '../../services/moderationService';
import ModeratorDashboardView from './ModeratorDashboardView';


interface ReportTarget {
  user_id: string;
  title?: string;
  body?: string;
  user?: {
    username: string;
    is_banned: boolean;
  };
}

interface Report {
  id: string;
  target_type: 'post' | 'comment';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  target?: ReportTarget;
  reporter?: {
    username: string;
  };
}

const ModeratorDashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const data = await moderationService.getReports();
      setReports(data.data);
    } catch {
      console.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  requestAnimationFrame(() => {
    fetchReports();
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const handleResolve = async (
    id: string,
    status: 'resolved' | 'dismissed'
  ) => {
    try {
      await moderationService.resolveReport(id, status);
      fetchReports();
    } catch {
      alert('Failed');
    }
  };

  const handleWarnUser = async (
    userId: string,
    username: string
  ) => {
    const reason = window.prompt(`Warning reason for @${username}:`);

    if (!reason) return;

    try {
      await moderationService.warnUser(userId, reason);
      alert(`@${username} warned.`);
    } catch {
      alert('Failed');
    }
  };

  const handleBanUser = async (
    userId: string,
    username: string
  ) => {
    const reason = window.prompt(`BAN reason for @${username}:`);

    if (!reason) return;

    if (!window.confirm(`Ban @${username}?`)) return;

    try {
      await moderationService.banUser(userId, reason);
      alert(`@${username} banned.`);
    } catch {
      alert('Failed');
    }
  };

  const handleUnbanUser = async (
    userId: string,
    username: string
  ) => {
    const reason = window.prompt(`Unban reason for @${username}:`);

    if (!reason) return;

    try {
      await moderationService.unbanUser(userId, reason);
      alert(`@${username} unbanned.`);
      fetchReports();
    } catch {
      alert('Failed');
    }
  };

  const pendingCount = reports.filter(
    (report) => report.status === 'pending'
  ).length;

  const resolvedCount = reports.filter(
    (report) => report.status === 'resolved'
  ).length;

  return (
    <ModeratorDashboardView
      reports={reports}
      loading={loading}
      pendingCount={pendingCount}
      resolvedCount={resolvedCount}
      handleResolve={handleResolve}
      handleWarnUser={handleWarnUser}
      handleBanUser={handleBanUser}
      handleUnbanUser={handleUnbanUser}
    />
  );
};

export default ModeratorDashboard;