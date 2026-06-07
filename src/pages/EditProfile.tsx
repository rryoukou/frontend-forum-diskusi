import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';
import Layout from '../layouts/Layout';
import './Auth.css';

const EditProfile: React.FC = () => {
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile(user.username);
        setBio(profile.bio || '');
        setAvatarPreview(profile.avatar_url || '');
      } catch (err) {
        console.error('Failed to fetch profile');
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await userService.updateProfile({ 
        bio, 
        avatar: avatarFile || undefined 
      });
      
      const updatedUser = await authService.me();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      navigate(`/profiles/${user?.username}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Layout><div className="loading-spinner">Loading profile...</div></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: 'var(--spacing-8)' }}>Edit Profile</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
              <label className="form-label" style={{ display: 'block', textAlign: 'left' }}>Profile Picture</label>
              
              <div style={{ position: 'relative', display: 'inline-block', marginTop: 'var(--spacing-4)' }}>
                <img 
                  src={avatarPreview || 'https://ui-avatars.com/api/?name=' + user?.username} 
                  alt="Preview" 
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '4px solid var(--primary-color)',
                    backgroundColor: '#f3f4f6'
                  }} 
                />
                <input 
                  type="file" 
                  id="avatar-upload"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <label 
                  htmlFor="avatar-upload" 
                  style={{ 
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    padding: 'var(--spacing-2)',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px'
                  }}
                >
                  📷
                </label>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-2)' }}>
                Click the camera icon to upload a new photo.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                rows={5}
                placeholder="Tell us about yourself..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'flex-end', marginTop: 'var(--spacing-6)' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;
