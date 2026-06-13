import { useEffect, useState, useCallback } from 'react';
import moderationService from '../../services/moderationService';
import ModeratorDashboardView from './ModeratorDashboardView';
import ModerationModal, { type ModerationActionType } from '../../components/ModerationModal';

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

interface ModalState {
  isOpen: boolean;
  type: ModerationActionType;
  userId: string;
  username: string;
}

const ModeratorDashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'warn',
    userId: '',
    username: '',
  });

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
      alert('Failed to resolve report');
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
    const { type, userId, username } = modal;
    
    try {
      if (type === 'warn') {
        await moderationService.warnUser(userId, reason);
        // We don't alert here as the modal handles the state, 
        // but we should probably show a success toast in a real app.
      } else if (type === 'ban') {
        await moderationService.banUser(userId, reason);
      } else if (type === 'unban') {
        await moderationService.unbanUser(userId, reason);
      }
      
      fetchReports();
      closeModModal();
    } catch {
      alert(`Failed to ${type} user`);
      closeModModal();
    }
  };

  const pendingCount = reports.filter(
    (report) => report.status === 'pending'
  ).length;

  const resolvedCount = reports.filter(
    (report) => report.status === 'resolved'
  ).length;

  return (
    <>
      <ModeratorDashboardView
        reports={reports}
        loading={loading}
        pendingCount={pendingCount}
        resolvedCount={resolvedCount}
        handleResolve={handleResolve}
        handleWarnUser={(userId, username) => openModModal('warn', userId, username)}
        handleBanUser={(userId, username) => openModModal('ban', userId, username)}
        handleUnbanUser={(userId, username) => openModModal('unban', userId, username)}
      />

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

export default ModeratorDashboard;