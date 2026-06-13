import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import notificationService from '../services/notificationService';
import { resolveAvatar } from '../utils/avatar';
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

  const getNotificationContent = (notif: any) => {
    const actorName = notif.actor?.username || 'Someone';
    
    if (notif.message) return <span>{notif.message}</span>;

    const highlight = <strong style={{ color: 'var(--text-1)' }}>{actorName}</strong>;

    switch (notif.type) {
      case 'upvote':            return <span>{highlight} upvoted your post</span>;
      case 'like':              return <span>{highlight} liked your content</span>;
      case 'bookmark':          return <span>{highlight} bookmarked your post</span>;
      case 'comment':           return <span>{highlight} commented on your post</span>;
      case 'follow':            return <span>{highlight} started following you</span>;
      case 'answer_accepted':   return <span>{highlight} accepted your answer as the solution</span>;
      case 'moderator_warning': return <span style={{ color: 'var(--danger)' }}>System: You received a warning</span>;
      case 'badge_earned':      return <span>Congratulations! You earned a new <strong>Badge</strong></span>;
      default:                  return <span>{highlight} interacted with your account</span>;
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
                <div className="notif-actor-section">
                  {notif.actor ? (
                    <div className="notif-avatar-wrapper">
                      <img 
                        src={resolveAvatar(notif.actor.avatar_url) || `https://ui-avatars.com/api/?name=${notif.actor.username}&background=random`} 
                        alt={notif.actor.username} 
                        className="notif-actor-avatar"
                      />
                      <div className="notif-badge-icon">
                        {NOTIF_ICONS[notif.type] || <Bell size={10} strokeWidth={2.5} />}
                      </div>
                    </div>
                  ) : (
                    <div className="notif-icon">
                      {NOTIF_ICONS[notif.type] || <Bell size={16} strokeWidth={2.2} />}
                    </div>
                  )}
                </div>

                <div className="notif-body">
                  <p className="notif-text">{getNotificationContent(notif)}</p>
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
