import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';
import Layout from '../layouts/Layout';
import { Camera, Check, X } from 'lucide-react';
import './EditProfile.css';

const EditProfile: React.FC = () => {
  const [bio, setBio]                     = useState('');
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading]             = useState(false);
  const [fetching, setFetching]           = useState(true);
  const [error, setError]                 = useState('');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchProfile = async () => {
      try {
        const p = await userService.getProfile(user.username);
        setBio(p.bio || '');
        setAvatarPreview(p.avatar_url || '');
      } catch {
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
      await userService.updateProfile({ bio, avatar: avatarFile || undefined });
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
      <div className="edit-profile-wrapper">
        <div className="edit-profile-title-area">
          <h1>Edit Profile</h1>
          <p>Update your public profile information.</p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            padding: 'var(--sp-3) var(--sp-4)',
            background: 'var(--danger-light)',
            border: '1px solid rgba(255, 77, 106, 0.25)',
            borderRadius: 'var(--radius)',
            color: 'var(--danger)',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: 'var(--sp-5)'
          }}>
            {error}
          </div>
        )}

        <div className="edit-profile-card">
          <form className="edit-profile-form" onSubmit={handleSubmit}>
            
            {/* ── Left Column: Avatar Section ── */}
            <div className="edit-profile-avatar-sec">
              <div className="edit-profile-avatar-preview">
                <img
                  src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.username}&background=00d084&color=0d0d0d&size=130`}
                  alt="Profile preview"
                />
                <input
                  type="file"
                  id="avatar-upload"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar-upload" className="edit-profile-avatar-btn" title="Upload photo">
                  <Camera size={15} strokeWidth={2.5} />
                </label>
              </div>
              <p className="edit-profile-avatar-hint">
                Click the camera icon to upload a new photo.<br />
                JPG, PNG or GIF · max 2 MB
              </p>
            </div>

            {/* ── Right Column: Info & Bio Section ── */}
            <div className="edit-profile-fields-sec">
              {/* Username */}
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  title="Username cannot be changed"
                  style={{
                    opacity: 0.65,
                    cursor: 'not-allowed',
                    background: 'rgba(255,255,255,0.02)'
                  }}
                />
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  title="Email address cannot be changed"
                  style={{
                    opacity: 0.65,
                    cursor: 'not-allowed',
                    background: 'rgba(255,255,255,0.02)'
                  }}
                />
              </div>

              {/* Bio */}
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={500}
                  placeholder="Tell the community about yourself..."
                />
                <span className="edit-profile-char-counter">
                  {bio.length}/500 characters
                </span>
              </div>
            </div>

            {/* ── Full Width Footer Actions ── */}
            <div className="edit-profile-actions-bar">
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
                <X size={14} strokeWidth={2.5} /> Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : <><Check size={14} strokeWidth={2.5} /> Save Changes</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;
