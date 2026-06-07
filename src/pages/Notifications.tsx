import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import notificationService from '../services/notificationService';
import { Link } from 'react-router-dom';

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const getNotificationText = (notif: any) => {
    const actor = notif.actor?.username || 'Someone';
    if (notif.message) return notif.message;
    
    switch (notif.type) {
      case 'upvote': return `${actor} upvoted your post/comment`;
      case 'like': return `${actor} liked your post/comment`;
      case 'bookmark': return `${actor} bookmarked your post`;
      case 'comment': return `${actor} commented on your post`;
      case 'follow': return `${actor} started following you`;
      case 'moderator_warning': return `System: You received a warning`;
      default: return `${actor} interacted with your account`;
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-8)' }}>
          <h1 style={{ margin: 0 }}>Notifications</h1>
          <button onClick={handleMarkAllRead} className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading notifications...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {notifications.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                  className="card"
                  style={{ 
                    padding: 'var(--spacing-4)', 
                    backgroundColor: notif.is_read ? 'var(--surface-color)' : '#eff6ff',
                    cursor: notif.is_read ? 'default' : 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderColor: notif.is_read ? 'var(--border-color)' : 'var(--primary-color)'
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: notif.is_read ? '500' : '700', color: notif.is_read ? 'var(--text-primary)' : 'var(--primary-hover)' }}>
                      {getNotificationText(notif)}
                    </p>
                    <small style={{ color: 'var(--text-muted)' }}>{new Date(notif.created_at).toLocaleString()}</small>
                  </div>
                  {!notif.is_read && (
                    <div style={{ 
                      width: '10px', 
                      height: '10px', 
                      backgroundColor: 'var(--primary-color)', 
                      borderRadius: '50%',
                      boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)'
                    }}></div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationPage;
