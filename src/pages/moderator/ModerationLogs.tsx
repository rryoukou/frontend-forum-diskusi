import { useEffect, useState } from 'react';
import moderationService from '../../services/moderationService';
import ModerationLogsView from './ModerationLogsView';

interface ModerationLog {
  id: number;
  action_type: string;
  created_at: string;
  reason: string;
  moderator?: {
    username: string;
  };
  target_user?: {
    username: string;
  };
  target_user_id?: number;
}

const ModerationLogs = () => {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await moderationService.getLogs();
        setLogs(data);
      } catch {
        console.error('Failed to fetch moderation logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <ModerationLogsView
      logs={logs}
      loading={loading}
    />
  );
};

export default ModerationLogs;