import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import notificationService from '../services/notificationService';
import {
  ThumbsUp, Heart, Bookmark, MessageCircle, UserPlus,
  AlertTriangle, Bell, CheckCheck,
} from 'lucide-react';
import '../App.css';

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  upvote:            <ThumbsUp    size={16} strokeWidth={2.2} />,
  like:              <Heart       size={16} strokeWidth={2.2} />,
  bookmark:          <Bookmark    size={16} strokeWidth={2.2} />,
  comment:           <MessageCircle size={16} strokeWidth={2.2} />,
  follow:            <UserPlus    size={16} strokeWidth={2.2} />,
  moderator_warning: <AlertTriangle size={16} strokeWidth={2.2} />,
};

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try { const d = await notificationService.getNotifications(); setNotifications(d.data); }
    catch { console.error('Failed to fetch notifications'); }
    finally { setLoading(false); }
  };

  const handleMarkAsRead = async (id: string) => {
    try { await notificationService.markAsRead(id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n)); }
    catch { console.error('Failed to mark as read'); }
  };

  const handleMarkAllRead = async () => {
    try { await notificationService.markAllAsRead(); setNotifications(prev => prev.map(n => ({ ...n, is_read: true }))); }
    catch { console.error('Failed to mark all as read'); }
  };

  const getNotificationText = (notif: any) => {
    const actor = notif.actor?.username || 'Someone';
    if (notif.message) return notif.message;
    switch (notif.type) {
      case 'upvote':            return `${actor} upvoted your post`;
      case 'like':              return `${actor} liked your content`;
      case 'bookmark':          return `${actor} bookmarked your post`;
      case 'comment':           return `${actor} commented on your post`;
      case 'follow':            return `${actor} started following you`;
      case 'moderator_warning': return `System: You received a warning`;
      default:                  return `${actor} interacted with your account`;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Layout>
      <div className="notifications-wrapper">
        <div className="notifications-header">
          <div>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 26, height: 26, padding: '0 8px', borderRadius: 'var(--radius-full)', background: 'var(--gradient-primary)', color: '#0d0d0d', fontSize: '0.78rem', fontWeight: 700 }}>
                  {unreadCount}
                </span>
              )}
            </h1>
            <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginTop: 4 }}>
              Stay up to date with your community activity.
            </p>
          </div>
          <button onClick={handleMarkAllRead} className="btn btn-outline" style={{ fontSize: '0.8rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCheck size={14} strokeWidth={2.5} /> Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <Bell size={48} strokeWidth={1.2} style={{ opacity: .35 }} />
            </span>
            <h3>All caught up!</h3>
            <p>No notifications yet. Stay active to get updates.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                className={`notif-card${notif.is_read ? '' : ' unread'}`}
              >
                <div className="notif-icon">
                  {NOTIF_ICONS[notif.type] || <Bell size={16} strokeWidth={2.2} />}
                </div>
                <div className="notif-body">
                  <p className="notif-text">{getNotificationText(notif)}</p>
                  <span className="notif-time">{new Date(notif.created_at).toLocaleString()}</span>
                </div>
                {!notif.is_read && <div className="notif-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationPage;
