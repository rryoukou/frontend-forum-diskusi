import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';
import Layout from '../layouts/Layout';
import { useAppDispatch } from '../store/hooks';
import { setUser } from '../store/authSlice';
import { resolveAvatar } from '../utils/avatar';
import { Camera, Check, X, User as UserIcon } from 'lucide-react';
import './EditProfile.css';

const EditProfile: React.FC = () => {
  const [bio, setBio]                     = useState('');
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading]             = useState(false);
  const [fetching, setFetching]           = useState(true);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState(false);
  const fileInputRef                      = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchProfile = async () => {
      try {
        const p = await userService.getProfile(user.username);
        setBio(p.bio || '');
        setAvatarPreview(resolveAvatar(p.avatar_url) || '');
      } catch {
        console.error('Failed to fetch profile');
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2 MB.');
      return;
    }
    setError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Only image files are allowed.'); return; }
    if (file.size > 2 * 1024 * 1024) { setError('Image must be smaller than 2 MB.'); return; }
    setError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await userService.updateProfile({ bio, avatar: avatarFile || undefined });
      // Refresh user dari server dan update Redux + localStorage
      const updatedUser = await authService.me();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch(setUser(updatedUser));
      setSuccess(true);
      setTimeout(() => navigate(`/profiles/${user?.username}`), 800);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.avatar?.[0] || 'Failed to update profile');
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
          <div className="edit-profile-alert edit-profile-alert-error">{error}</div>
        )}
        {success && (
          <div className="edit-profile-alert edit-profile-alert-success">
            <Check size={14} strokeWidth={2.5} /> Profile updated successfully!
          </div>
        )}

        <div className="edit-profile-card">
          <form className="edit-profile-form" onSubmit={handleSubmit}>

            {/* ── Left: Avatar ── */}
            <div className="edit-profile-avatar-sec">
              <div
                className="edit-profile-avatar-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                title="Click or drag to upload"
              >
                <div className="edit-profile-avatar-preview">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="Preview" />
                    : <div className="edit-profile-avatar-placeholder">
                        <UserIcon size={40} strokeWidth={1.5} />
                      </div>
                  }
                  <div className="edit-profile-avatar-overlay">
                    <Camera size={20} strokeWidth={2} />
                    <span>Change photo</span>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <p className="edit-profile-avatar-hint">
                Click or drag & drop to upload.<br />
                JPG, PNG, GIF, WEBP · max 2 MB
              </p>

              {avatarFile && (
                <button
                  type="button"
                  className="edit-profile-remove-avatar"
                  onClick={() => { setAvatarFile(null); setAvatarPreview(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                >
                  <X size={12} strokeWidth={2.5} /> Remove photo
                </button>
              )}
            </div>

            {/* ── Right: Fields ── */}
            <div className="edit-profile-fields-sec">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="edit-profile-disabled-input"
                />
                <span className="edit-profile-field-hint">Username cannot be changed</span>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  className="edit-profile-disabled-input"
                />
                <span className="edit-profile-field-hint">Email cannot be changed</span>
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={500}
                  rows={5}
                  placeholder="Tell the community about yourself..."
                />
                <span className="edit-profile-char-counter">{bio.length}/500 characters</span>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="edit-profile-actions-bar">
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)} disabled={loading}>
                <X size={14} strokeWidth={2.5} /> Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? <><span className="btn-spinner" /> Saving...</>
                  : <><Check size={14} strokeWidth={2.5} /> Save Changes</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;
