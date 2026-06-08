import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import notificationService from '../services/notificationService';
import './Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const isModerator = authService.isModerator();

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const count = await notificationService.getUnreadCount();
          setUnreadCount(count);
        } catch (err: any) {
          if (err.response?.status === 401) {
            // Stop polling if unauthorized
            clearInterval(interval);
          }
          console.error('Failed to fetch unread count');
        }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsDrawerOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', flex: 1 }}>
            {user && (
              <button 
                onClick={toggleDrawer}
                className="btn btn-outline"
                style={{ padding: 'var(--spacing-2)', border: 'none' }}
              >
                <span style={{ fontSize: '1.5rem' }}>☰</span>
              </button>
            )}
            <Link to="/" className="navbar-brand">
              <span>💬</span> Forum Diskusi
            </Link>
          </div>

          <div className="navbar-actions">
            {user ? (
              <>
                <Link to="/notifications" style={{ position: 'relative', fontSize: '1.25rem' }}>
                  🔔
                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link to={`/profiles/${user.username}`} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--primary-color)', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.username}</span>
                </Link>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Navigation Drawer Overlay */}
      {isDrawerOpen && <div className="drawer-overlay" onClick={toggleDrawer} />}

      {/* Navigation Drawer Content */}
      <div className={`drawer-content ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2 style={{ margin: 0 }}>Menu</h2>
          <button onClick={toggleDrawer} className="btn btn-outline" style={{ border: 'none', fontSize: '1.5rem' }}>×</button>
        </div>

        {user && (
          <div style={{ 
            marginBottom: 'var(--spacing-6)', 
            padding: 'var(--spacing-4)', 
            backgroundColor: 'var(--bg-color)', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user.username}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Level {user.level} • {user.reputation_points} Points</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', flex: 1, overflowY: 'auto' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', padding: '0 var(--spacing-4)', marginBottom: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' }}>
            User Menu
          </div>
          <DrawerLink to="/" onClick={toggleDrawer}>🏠 Home</DrawerLink>
          <DrawerLink to="/leaderboard" onClick={toggleDrawer}>🏆 Leaderboard</DrawerLink>
          <DrawerLink to="/reputation-history" onClick={toggleDrawer}>📈 Reputation History</DrawerLink>
          <DrawerLink to="/notifications" onClick={toggleDrawer}>🔔 Notifications</DrawerLink>
          <DrawerLink to="/bookmarks" onClick={toggleDrawer}>🔖 Bookmarks</DrawerLink>
          <DrawerLink to="/create-post" onClick={toggleDrawer}>✍️ Create Post</DrawerLink>
          <DrawerLink to={`/profiles/${user?.username}`} onClick={toggleDrawer}>👤 My Profile</DrawerLink>

          {isModerator && (
            <>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', padding: '0 var(--spacing-4)', marginBottom: 'var(--spacing-2)', marginTop: 'var(--spacing-6)' }}>
                Moderator Menu
              </div>
              <DrawerLink to="/moderator" onClick={toggleDrawer}>🚩 Pending Reports</DrawerLink>
              <DrawerLink to="/moderation-logs" onClick={toggleDrawer}>📜 Moderation Logs</DrawerLink>
            </>
          )}

          {isAdmin && (
            <>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', padding: '0 var(--spacing-4)', marginBottom: 'var(--spacing-2)', marginTop: 'var(--spacing-6)' }}>
                Admin Menu
              </div>
              <DrawerLink to="/admin" onClick={toggleDrawer}>👥 Manage Users</DrawerLink>
              <DrawerLink to="/admin/categories" onClick={toggleDrawer}>📁 Manage Categories</DrawerLink>
            </>
          )}
        </div>

        {user && (
          <button 
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ marginTop: 'var(--spacing-6)', color: '#ef4444', borderColor: '#fee2e2' }}
          >
            Logout
          </button>
        )}
      </div>
    </>
  );
};

const DrawerLink: React.FC<{ to: string, children: React.ReactNode, onClick: () => void }> = ({ to, children, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="drawer-link"
  >
    {children}
  </Link>
);

export default Navbar;
