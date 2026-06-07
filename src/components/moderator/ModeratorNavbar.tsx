import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const ModeratorNavbar: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav style={{ padding: '1rem', backgroundColor: '#17a2b8', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/moderator" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>Moderator Panel</Link>
        <Link to="/" style={{ marginLeft: '1.5rem', color: '#eee', textDecoration: 'none', fontSize: '0.9rem' }}>View Site</Link>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/moderator/reports" style={{ color: 'white', textDecoration: 'none' }}>Pending Reports</Link>
        <Link to="/moderator/logs" style={{ color: 'white', textDecoration: 'none' }}>Action Logs</Link>
        <span style={{ marginLeft: '1rem', borderLeft: '1px solid #555', paddingLeft: '1rem' }}>Mod: <strong>{user?.username}</strong></span>
        <button onClick={handleLogout} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>
    </nav>
  );
};

export default ModeratorNavbar;
