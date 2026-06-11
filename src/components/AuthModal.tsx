import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import * as Label from '@radix-ui/react-label';
import {
  Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Loader2, X,
} from 'lucide-react';
import { loginUser, registerUser, clearError } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useAuthModal } from '../context/AuthModalContext';
import { LogoIcon } from './Logo';
import './AuthModal.css';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const LoginSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .max(10, 'Maximal 10 characters')
    .required('Password is required'),
});

const RegisterSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed')
    .required('Username is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Include at least one uppercase letter')
    .matches(/[0-9]/, 'Include at least one number')
    .required('Password is required'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

// ─── Password strength ────────────────────────────────────────────────────────

function getStrength(pw: string) {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 8)            s++;
  if (pw.length >= 12)           s++;
  if (/[A-Z]/.test(pw))          s++;
  if (/[0-9]/.test(pw))          s++;
  if (/[^A-Za-z0-9]/.test(pw))  s++;
  if (s <= 1) return { score: s, label: 'Weak',   color: 'var(--danger)'  };
  if (s <= 3) return { score: s, label: 'Fair',   color: 'var(--warning)' };
  return           { score: s, label: 'Strong', color: 'var(--success)' };
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

const AuthModal: React.FC = () => {
  const { isOpen, activeTab, closeModal, switchTab } = useAuthModal();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handler);
    // Prevent body scroll while open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="auth-modal-overlay"
      onClick={(e) => { if (e.target === overlayRef.current) closeModal(); }}
      role="dialog"
      aria-modal="true"
      aria-label={activeTab === 'login' ? 'Sign in' : 'Create account'}
    >
      {/* Blobs */}
      <div className="auth-modal-blob auth-modal-blob-1" aria-hidden="true" />
      <div className="auth-modal-blob auth-modal-blob-2" aria-hidden="true" />

      <div className="auth-modal-panel">
        {/* Close button */}
        <button
          className="auth-modal-close"
          onClick={closeModal}
          aria-label="Close"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* Tabs */}
        <div className="auth-modal-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'login'}
            className={`auth-modal-tab${activeTab === 'login' ? ' auth-modal-tab--active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'register'}
            className={`auth-modal-tab${activeTab === 'register' ? ' auth-modal-tab--active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Register
          </button>
        </div>

        {/* Content */}
        <div className="auth-modal-body">
          {activeTab === 'login'
            ? <LoginForm onSuccess={closeModal} onSwitchToRegister={() => switchTab('register')} />
            : <RegisterForm onSuccess={closeModal} onSwitchToLogin={() => switchTab('login')} />
          }
        </div>
      </div>
    </div>
  );
};

// ─── Login Form ───────────────────────────────────────────────────────────────

const LoginForm: React.FC<{ onSuccess: () => void; onSwitchToRegister: () => void }> = ({
  onSuccess, onSwitchToRegister,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: LoginSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      const result = await dispatch(loginUser(values));
      if (loginUser.fulfilled.match(result)) {
        onSuccess();
        navigate('/');
      }
    },
  });

  const fe = (n: 'email' | 'password') =>
    formik.touched[n] && formik.errors[n] ? formik.errors[n] : undefined;

  return (
    <>
      <div className="auth-modal-header">
        <LogoIcon size={48} variant="color" />
        <h2>Welcome Back</h2>
        <p>Sign in to continue to your account</p>
      </div>

      {error && (
        <div className="am-error" role="alert">
          <AlertCircle size={14} strokeWidth={2} />
          {error}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="am-field">
          <Label.Root className="am-label" htmlFor="m-login-email">Email</Label.Root>
          <input
            id="m-login-email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            className={fe('email') ? 'am-input am-input--error' : 'am-input'}
            {...formik.getFieldProps('email')}
          />
          {fe('email') && <span className="am-field-error"><AlertCircle size={12} />{fe('email')}</span>}
        </div>

        <div className="am-field">
          <Label.Root className="am-label" htmlFor="m-login-pw">Password</Label.Root>
          <div className="am-pw-wrap">
            <input
              id="m-login-pw"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={fe('password') ? 'am-input am-input--error' : 'am-input'}
              {...formik.getFieldProps('password')}
            />
            <button type="button" className="am-pw-toggle" onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'} tabIndex={-1}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {fe('password') && <span className="am-field-error"><AlertCircle size={12} />{fe('password')}</span>}
        </div>

        <button type="submit" className="am-submit" disabled={loading || formik.isSubmitting}>
          {loading || formik.isSubmitting
            ? <><Loader2 size={16} className="am-spin" /> Signing in...</>
            : <>Sign In <ArrowRight size={16} /></>
          }
        </button>
      </form>

      <p className="am-switch">
        Don't have an account?{' '}
        <button type="button" className="am-switch-btn" onClick={onSwitchToRegister}>
          Create one
        </button>
      </p>
    </>
  );
};

// ─── Register Form ────────────────────────────────────────────────────────────

const RegisterForm: React.FC<{ onSuccess: () => void; onSwitchToLogin: () => void }> = ({
  onSuccess, onSwitchToLogin,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const formik = useFormik({
    initialValues: { username: '', email: '', password: '', password_confirmation: '' },
    validationSchema: RegisterSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      const result = await dispatch(registerUser(values));
      if (registerUser.fulfilled.match(result)) {
        onSuccess();
        navigate('/');
      }
    },
  });

  const fe = (n: keyof typeof formik.values) =>
    formik.touched[n] && formik.errors[n] ? formik.errors[n] : undefined;

  const strength = getStrength(formik.values.password);

  return (
    <>
      <div className="auth-modal-header">
        <LogoIcon size={48} variant="color" />
        <h2>Create Account</h2>
        <p>Join the community and start sharing.</p>
      </div>

      {error && (
        <div className="am-error" role="alert">
          <AlertCircle size={14} strokeWidth={2} />
          {error}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate>
        {/* Username */}
        <div className="am-field">
          <Label.Root className="am-label" htmlFor="m-reg-username">Username</Label.Root>
          <input
            id="m-reg-username"
            type="text"
            autoComplete="username"
            placeholder="johndoe"
            className={fe('username') ? 'am-input am-input--error' : 'am-input'}
            {...formik.getFieldProps('username')}
          />
          {fe('username')
            ? <span className="am-field-error"><AlertCircle size={12} />{fe('username')}</span>
            : formik.touched.username && !formik.errors.username && formik.values.username
              ? <span className="am-field-success"><CheckCircle2 size={12} />Looks good!</span>
              : null}
        </div>

        {/* Email */}
        <div className="am-field">
          <Label.Root className="am-label" htmlFor="m-reg-email">Email</Label.Root>
          <input
            id="m-reg-email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            className={fe('email') ? 'am-input am-input--error' : 'am-input'}
            {...formik.getFieldProps('email')}
          />
          {fe('email')
            ? <span className="am-field-error"><AlertCircle size={12} />{fe('email')}</span>
            : formik.touched.email && !formik.errors.email && formik.values.email
              ? <span className="am-field-success"><CheckCircle2 size={12} />Valid email</span>
              : null}
        </div>

        {/* Password */}
        <div className="am-field">
          <Label.Root className="am-label" htmlFor="m-reg-pw">Password</Label.Root>
          <div className="am-pw-wrap">
            <input
              id="m-reg-pw"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={fe('password') ? 'am-input am-input--error' : 'am-input'}
              {...formik.getFieldProps('password')}
            />
            <button type="button" className="am-pw-toggle" onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide' : 'Show'} tabIndex={-1}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {formik.values.password && (
            <div className="am-strength">
              <div className="am-strength-track">
                <div className="am-strength-fill" style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }} />
              </div>
              <span style={{ color: strength.color, fontSize: '0.68rem', fontWeight: 700 }}>{strength.label}</span>
            </div>
          )}
          {fe('password') && <span className="am-field-error"><AlertCircle size={12} />{fe('password')}</span>}
        </div>

        {/* Confirm Password */}
        <div className="am-field">
          <Label.Root className="am-label" htmlFor="m-reg-cf">Confirm Password</Label.Root>
          <div className="am-pw-wrap">
            <input
              id="m-reg-cf"
              type={showCf ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={fe('password_confirmation') ? 'am-input am-input--error' : 'am-input'}
              {...formik.getFieldProps('password_confirmation')}
            />
            <button type="button" className="am-pw-toggle" onClick={() => setShowCf(v => !v)}
              aria-label={showCf ? 'Hide' : 'Show'} tabIndex={-1}>
              {showCf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {fe('password_confirmation')
            ? <span className="am-field-error"><AlertCircle size={12} />{fe('password_confirmation')}</span>
            : formik.touched.password_confirmation && !formik.errors.password_confirmation && formik.values.password_confirmation
              ? <span className="am-field-success"><CheckCircle2 size={12} />Passwords match</span>
              : null}
        </div>

        <button type="submit" className="am-submit" disabled={loading || formik.isSubmitting}>
          {loading || formik.isSubmitting
            ? <><Loader2 size={16} className="am-spin" /> Creating account...</>
            : <>Create Account <ArrowRight size={16} /></>
          }
        </button>
      </form>

      <p className="am-switch">
        Already have an account?{' '}
        <button type="button" className="am-switch-btn" onClick={onSwitchToLogin}>
          Sign In
        </button>
      </p>
    </>
  );
};

export default AuthModal;
