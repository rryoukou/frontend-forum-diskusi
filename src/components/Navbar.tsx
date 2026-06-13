import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Avatar from '@radix-ui/react-avatar';
import { logoutUser, fetchCurrentUser } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import notificationService from '../services/notificationService';
import authService from '../services/authService';
import { useAuthModal } from '../context/AuthModalContext';
import { useConfirm } from '../context/ConfirmContext';
import { LogoBrand } from './Logo';
import { resolveAvatar } from '../utils/avatar';
import {
  Home, Trophy, Search, PenLine, User, Bookmark,
  Bell, TrendingUp, Flag, ScrollText, Users, FolderOpen,
  LogOut, Menu, X,
} from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  onOpenSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { openLogin, openRegister } = useAuthModal();
  const { confirm, alert: customAlert } = useConfirm();

  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Role helpers still use authService (reads localStorage, stays consistent)
  const isAdmin     = authService.isAdmin();
  const isModerator = authService.isModerator();

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (err: unknown) {
        if ((err as { response?: { status?: number } }).response?.status === 401) {
          clearInterval(interval);
        }
      }
    };
    fetchUnread();
    const interval = setInterval(() => {
      fetchUnread();
      dispatch(fetchCurrentUser());
    }, 30000);
    return () => clearInterval(interval);
  }, [user, dispatch]);

  const handleLogout = async () => {
    const confirmLogout = await confirm('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar dari akun Anda?');
    if (!confirmLogout) return;

    try {
      const resultAction = await dispatch(logoutUser());
      if (logoutUser.fulfilled.match(resultAction)) {
        setIsDrawerOpen(false);
        await customAlert('Logout Berhasil', 'Anda telah berhasil keluar dari akun.', 'success');
        navigate('/login');
      } else {
        await customAlert('Logout Gagal', 'Logout belum berhasil. Silakan coba lagi.', 'error');
      }
    } catch {
      await customAlert('Logout Gagal', 'Logout belum berhasil. Terjadi kesalahan sistem.', 'error');
    }
  };

  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((v) => !v);

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="container navbar-container">
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flex: 1 }}>
            {user && (
              <button
                onClick={() => {
                  if (onOpenSidebar) {
                    onOpenSidebar();
                  } else {
                    toggleDrawer();
                  }
                }}
                className="hamburger-btn"
                aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isDrawerOpen}
                aria-controls="nav-drawer"
              >
                {isDrawerOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
              </button>
            )}
            <Link to="/" className="navbar-brand" aria-label="SuaraKita — Home">
              <LogoBrand size={60} showText={true} />
            </Link>
          </div>

          {/* Right */}
          <div className="navbar-actions">
            {user ? (
              <>
                <Link to="/notifications" className="nav-icon-btn" aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}>
                  <Bell size={18} strokeWidth={2} />
                  {unreadCount > 0 && (
                    <span className="notification-badge" aria-hidden="true">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link to={`/profiles/${user.username}`} className="nav-user-btn" aria-label={`Profile: ${user.username}`}>
                  <Avatar.Root className="nav-avatar">
                    <Avatar.Image
                      src={resolveAvatar(user.avatar_url) ?? undefined}
                      alt={user.username}
                    />
                    <Avatar.Fallback delayMs={200}>
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <span className="nav-username-text">{user.username}</span>
                </Link>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                <button onClick={openLogin}    className="btn btn-outline btn-sm">Login</button>
                <button onClick={openRegister} className="btn btn-primary  btn-sm">Register</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isDrawerOpen && (
        <div
          className="drawer-overlay"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        id="nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
        className={`drawer-content${isDrawerOpen ? ' open' : ''}`}
      >
        <div className="drawer-header">
          <h2>Navigation</h2>
          <button onClick={closeDrawer} className="btn-ghost drawer-close-btn" aria-label="Close menu">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {user && (
          <div className="drawer-user-card">
            <Avatar.Root className="drawer-user-avatar">
              <Avatar.Image src={resolveAvatar(user.avatar_url) ?? undefined} alt={user.username} />
              <Avatar.Fallback delayMs={200}>
                {user.username.charAt(0).toUpperCase()}
              </Avatar.Fallback>
            </Avatar.Root>
            <div>
              <div className="username">{user.username}</div>
              <div className="user-meta">Lv {user.level} · {user.reputation_points?.toLocaleString()} pts</div>
            </div>
          </div>
        )}

        <nav className="drawer-nav" aria-label="Drawer navigation">
          <div className="drawer-section-label">Main</div>
          <DrawerLink to="/"            icon={<Home   size={15} strokeWidth={2} />} onClick={closeDrawer}>Home</DrawerLink>
          <DrawerLink to="/leaderboard" icon={<Trophy size={15} strokeWidth={2} />} onClick={closeDrawer}>Leaderboard</DrawerLink>
          <DrawerLink to="/search"      icon={<Search size={15} strokeWidth={2} />} onClick={closeDrawer}>Search</DrawerLink>

          {user && (
            <>
              <div className="drawer-section-label">My Account</div>
              <DrawerLink to="/create-post"                  icon={<PenLine    size={15} strokeWidth={2} />} onClick={closeDrawer}>Create Post</DrawerLink>
              <DrawerLink to={`/profiles/${user.username}`}  icon={<User       size={15} strokeWidth={2} />} onClick={closeDrawer}>My Profile</DrawerLink>
              <DrawerLink to="/bookmarks"                    icon={<Bookmark   size={15} strokeWidth={2} />} onClick={closeDrawer}>Bookmarks</DrawerLink>
              <DrawerLink to="/notifications"                icon={<Bell       size={15} strokeWidth={2} />} onClick={closeDrawer}>
                Notifications
                {unreadCount > 0 && <span className="drawer-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </DrawerLink>
              <DrawerLink to="/reputation-history"           icon={<TrendingUp size={15} strokeWidth={2} />} onClick={closeDrawer}>Reputation</DrawerLink>
            </>
          )}

          {isModerator && (
            <>
              <div className="drawer-section-label">Moderator</div>
              <DrawerLink to="/moderator"       icon={<Flag       size={15} strokeWidth={2} />} onClick={closeDrawer}>Pending Reports</DrawerLink>
              <DrawerLink to="/moderation-logs" icon={<ScrollText size={15} strokeWidth={2} />} onClick={closeDrawer}>Moderation Logs</DrawerLink>
            </>
          )}

          {isAdmin && (
            <>
              <div className="drawer-section-label">Admin</div>
              <DrawerLink to="/admin"            icon={<Users      size={15} strokeWidth={2} />} onClick={closeDrawer}>Manage Users</DrawerLink>
              <DrawerLink to="/admin/categories" icon={<FolderOpen size={15} strokeWidth={2} />} onClick={closeDrawer}>Categories</DrawerLink>
            </>
          )}
        </nav>

        {user && (
          <div className="drawer-footer">
            <button onClick={handleLogout} className="drawer-logout-btn" aria-label="Log out">
              <LogOut size={15} strokeWidth={2} /> Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── DrawerLink ───────────────────────────────────────────────────────────────

const DrawerLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}> = ({ to, icon, children, onClick }) => (
  <Link to={to} onClick={onClick} className="drawer-link">
    <span className="drawer-link-icon" aria-hidden="true">{icon}</span>
    {children}
  </Link>
);

export default Navbar;
