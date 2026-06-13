import React from 'react';
import { 
  Users, AlertTriangle, TrendingUp, Award, Shield,
  UserCheck, UserX
} from 'lucide-react';

// Menyesuaikan interface internal user
interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  is_banned: boolean;
  roles?: Role[];
}

interface DashboardStats {
  totalUsers: number;
  adminUsers: number;
  moderatorUsers: number;
  reportCount: number;
}

interface AdminDashboardViewProps {
  stats: DashboardStats;
  users?: User[];
  loading: boolean;
}

// ════════════ DASHBOARD SKELETON COMPONENT ════════════
const DashboardSkeleton: React.FC<{ cardStyle: React.CSSProperties }> = ({ cardStyle }) => {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton-pulse" style={{ width: '240px', height: '32px', borderRadius: 'var(--radius)' }} />
        <div className="skeleton-pulse" style={{ width: '380px', height: '16px', borderRadius: '4px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ ...cardStyle, minHeight: 125 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '60%' }}>
                <div className="skeleton-pulse" style={{ width: '80%', height: '12px', borderRadius: '4px' }} />
                <div className="skeleton-pulse" style={{ width: '50%', height: '28px', borderRadius: '6px' }} />
              </div>
              <div className="skeleton-pulse" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ stats, users = [], loading }) => {
  
  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--border)',
    boxShadow: 'var(--shadow-card)',
    padding: '1.5rem',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden'
  };

  if (loading) {
    return <DashboardSkeleton cardStyle={cardStyle} />;
  }

  // Helper render badge role
  const renderRoleBadges = (user: User) => {
    if (!user?.roles || user.roles.length === 0) {
      return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', background: 'var(--surface-2)', color: 'var(--text-2)' }}>user</span>;
    }
    return user.roles.map((role) => {
      const isAdmin = role.name === 'admin';
      const isMod = role.name === 'moderator';
      return (
        <span 
          key={role.id} 
          style={{ 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '0.7rem', 
            fontWeight: 600,
            marginRight: '4px',
            background: isAdmin ? 'rgba(255, 77, 106, 0.15)' : isMod ? 'rgba(59, 130, 246, 0.15)' : 'var(--surface-2)', 
            color: isAdmin ? 'var(--danger)' : isMod ? 'var(--info)' : 'var(--text-1)' 
          }}
        >
          {role.name}
        </span>
      );
    });
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      
      {/* ═══════ HEADER SECTION (CLEAN & MINIMALIST) ═══════ */}
      <div>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Admin Dashboard
        </h1>
        <p style={{ marginTop: 4, fontSize: '0.85rem', color: 'var(--text-3)' }}>
          Platform overview, system health, and quick metrics
        </p>
      </div>

      {/* ═══════ STATS GRID (4 Columns) ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalUsers}</h2>
            </div>
            <div style={{ background: 'var(--primary-soft)', color: 'var(--primary)', padding: '0.65rem', borderRadius: 'var(--radius)' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--success)' }}>
            <TrendingUp size={12} />
            <span>Active users tracked riil</span>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admins</span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '1.75rem', fontWeight: 800 }}>{stats.adminUsers}</h2>
            </div>
            <div style={{ background: 'rgba(255, 77, 106, 0.1)', color: 'var(--danger)', padding: '0.65rem', borderRadius: 'var(--radius)' }}>
              <Award size={20} />
            </div>
          </div>
          <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>Full system control privileges</div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Moderators</span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '1.75rem', fontWeight: 800 }}>{stats.moderatorUsers}</h2>
            </div>
            <div style={{ background: 'var(--info-soft)', color: 'var(--info)', padding: '0.65rem', borderRadius: 'var(--radius)' }}>
              <Shield size={20} />
            </div>
          </div>
          <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>Staff in charge of content audit</div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reports</span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '1.75rem', fontWeight: 800 }}>{stats.reportCount}</h2>
            </div>
            <div style={{ background: stats.reportCount > 10 ? 'var(--danger-soft)' : 'var(--warning-soft)', color: stats.reportCount > 10 ? 'var(--danger)' : 'var(--warning)', padding: '0.65rem', borderRadius: 'var(--radius)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: stats.reportCount > 10 ? 'var(--danger)' : 'var(--text-3)', fontWeight: stats.reportCount > 10 ? 600 : 400 }}>
            {stats.reportCount > 10 ? 'Requires moderation action' : 'System queues healthy'}
          </div>
        </div>
      </div>

      {/* ═══════ USER MANAGEMENT TABLE CONTAINER ═══════ */}
      <div style={{ ...cardStyle, gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Registered Management Accounts</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-3)' }}>Real-time user list configuration mapped from your database endpoint.</p>
          </div>
          <span style={{ fontSize: '0.75rem', background: 'var(--surface-2)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border)', fontWeight: 600 }}>
            {(users?.length || 0)} Total Row(s)
          </span>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-3)' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>NAME</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>EMAIL ADDRESS</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>ASSIGNED ROLES</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user?.id} style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-1)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{user?.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-2)' }}>{user?.email}</td>
                  <td style={{ padding: '1rem' }}>{renderRoleBadges(user)}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {user?.is_banned ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(255,77,106,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        <UserX size={12} /> Banned
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(46,213,115,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        <UserCheck size={12} /> Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-3)' }}>
                    No users loaded inside database repository.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardView;