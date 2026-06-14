import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Avatar from '@radix-ui/react-avatar';
import {
  Home, Trophy, Search, PenLine, User, Bookmark,
  Bell, TrendingUp, Flag, ScrollText, FolderOpen,
  LogOut, ChevronDown, X, LayoutDashboard, ShieldAlert // 👈 Tambahkan ShieldAlert di sini
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser, fetchCurrentUser } from '../store/authSlice';
import authService from '../services/authService';
import notificationService from '../services/notificationService';
import { LogoBrand } from './Logo';
import { useConfirm } from '../context/ConfirmContext';
import { resolveAvatar } from '../utils/avatar';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const searchRef = useRef<HTMLInputElement>(null);
  const { confirm, alert: customAlert } = useConfirm();

  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin     = authService.isAdmin();
  const isModerator = authService.isModerator();

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch {
        // silently fail
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
        onClose();
        await customAlert('Logout Berhasil', 'Anda telah berhasil keluar dari akun.', 'success');
        navigate('/login');
      } else {
        await customAlert('Logout Gagal', 'Logout belum berhasil. Silakan coba lagi.', 'error');
      }
    } catch {
      await customAlert('Logout Gagal', 'Logout belum berhasil. Terjadi kesalahan sistem.', 'error');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      onClose();
    }
  };

  // Logika pengecekan rute aktif agar akurat mencocokkan sub-route admin
  const isActive = (path: string) =>
    path === '/' ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`sidebar-drawer${isOpen ? ' sidebar-drawer--open' : ''}`}
        aria-label="Sidebar navigation"
        role="complementary"
      >
        {/* ── Header ── */}
        <div className="sidebar__header">
          <Link to="/" className="sidebar__logo-brand" onClick={onClose}>
            <LogoBrand size={54} showText={true} />
          </Link>
          <button
            className="sidebar__close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Profile Card ── */}
        {user && (
          <Link
            to={`/profiles/${user.username}`}
            className="sidebar__profile"
            onClick={onClose}
            aria-label={`View profile of ${user.username}`}
          >
            <Avatar.Root className="sidebar__avatar">
              <Avatar.Image src={resolveAvatar(user.avatar_url) ?? undefined} alt={user.username} />
              <Avatar.Fallback delayMs={200}>
                {user.username.charAt(0).toUpperCase()}
              </Avatar.Fallback>
            </Avatar.Root>
            <div className="sidebar__profile-info">
              <span className="sidebar__profile-name">{user.username}</span>
              <span className="sidebar__profile-meta">
                Lv {user.level} · {user.reputation_points?.toLocaleString()} pts
              </span>
            </div>
            <ChevronDown size={14} className="sidebar__profile-chevron" />
          </Link>
        )}

        {/* ── Search ── */}
        <form className="sidebar__search-wrap" onSubmit={handleSearchSubmit}>
          <Search size={14} className="sidebar__search-icon" aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            className="sidebar__search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search forum"
          />
        </form>

        {/* ── Nav ── */}
        <nav className="sidebar__nav" aria-label="Sidebar navigation">

          {/* MAIN */}
          <div className="sidebar__section-label">Main</div>
          <SidebarLink to="/"             icon={<Home   size={15} />} active={location.pathname === '/'} onClick={onClose}>Home</SidebarLink>
          <SidebarLink to="/leaderboard" icon={<Trophy size={15} />} active={isActive('/leaderboard')} onClick={onClose}>Leaderboard</SidebarLink>
          <SidebarLink to="/search"      icon={<Search size={15} />} active={isActive('/search')}      onClick={onClose}>Search</SidebarLink>

          {/* MY ACCOUNT */}
          {user && (
            <>
              <div className="sidebar__section-label">My Account</div>

              {/* ── Create Post CTA ── */}
              <Link
                to="/create-post"
                onClick={onClose}
                className={`sidebar__create-post${isActive('/create-post') ? ' sidebar__create-post--active' : ''}`}
                aria-label="Create a new post"
              >
                <span className="sidebar__create-post-icon" aria-hidden="true">
                  <PenLine size={18} strokeWidth={2.5} />
                </span>
                <span className="sidebar__create-post-text">
                  <span className="sidebar__create-post-title">Create Post</span>
                  <span className="sidebar__create-post-desc">Share your thoughts here</span>
                </span>
                <span className="sidebar__create-post-arrow" aria-hidden="true">✦</span>
              </Link>
              <SidebarLink to={`/profiles/${user.username}`} icon={<User       size={15} />} active={isActive(`/profiles/${user.username}`)} onClick={onClose}>My Profile</SidebarLink>
              <SidebarLink to="/bookmarks"                   icon={<Bookmark   size={15} />} active={isActive('/bookmarks')}          onClick={onClose}>Bookmarks</SidebarLink>
              <SidebarLink
                to="/notifications"
                icon={<Bell size={15} />}
                active={isActive('/notifications')}
                onClick={onClose}
                badge={unreadCount > 0 ? (unreadCount > 9 ? '9+' : String(unreadCount)) : undefined}
              >
                Notifications
              </SidebarLink>
              <SidebarLink to="/reputation-history" icon={<TrendingUp size={15} />} active={isActive('/reputation-history')} onClick={onClose}>Reputation</SidebarLink>
            </>
          )}

          {/* MODERATOR */}
          {isModerator && (
            <>
              <div className="sidebar__section-label">Moderator</div>
              <SidebarLink to="/moderator"       icon={<Flag       size={15} />} active={isActive('/moderator')}       onClick={onClose}>Pending Reports</SidebarLink>
              <SidebarLink to="/moderation-logs" icon={<ScrollText size={15} />} active={isActive('/moderation-logs')} onClick={onClose}>Moderation Logs</SidebarLink>
            </>
          )}

          {/* ADMIN */}
          {isAdmin && (
            <>
              <div className="sidebar__section-label">Admin</div>
              <SidebarLink to="/admin"             icon={<LayoutDashboard size={15} />} active={location.pathname === '/admin' || location.pathname === '/admin/dashboard'} onClick={onClose}>Dashboard</SidebarLink>
              <SidebarLink to="/admin/categories" icon={<FolderOpen      size={15} />} active={location.pathname === '/admin/categories'}  onClick={onClose}>Categories</SidebarLink>
              {/* 👈 Navigasi Tambahan Baru untuk Management Roles */}
<SidebarLink to="/admin/roles"      icon={<ShieldAlert     size={15} />} active={isActive('/admin/roles')}       onClick={onClose}>Manage Roles</SidebarLink>
  </>            
          )}
        </nav>

        {/* ── Footer ── */}
        {user && (
          <div className="sidebar__footer">
            <button
              className="sidebar__logout-btn"
              onClick={handleLogout}
              aria-label="Log out"
            >
              <LogOut size={15} strokeWidth={2} />
              Logout
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

// ── SidebarLink ────────────────────────────────────────────────────────────────

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: string;
  children: React.ReactNode;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, active, onClick, badge, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`sidebar__link${active ? ' sidebar__link--active' : ''}`}
    aria-current={active ? 'page' : undefined}
  >
    <span className="sidebar__link-icon" aria-hidden="true">{icon}</span>
    <span className="sidebar__link-label">{children}</span>
    {badge && (
      <span className="sidebar__badge" aria-label={`${badge} unread`}>{badge}</span>
    )}
  </Link>
);

export default Sidebar;