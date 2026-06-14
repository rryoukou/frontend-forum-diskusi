import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import * as Label from '@radix-ui/react-label';
import {
  Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Loader2,
} from 'lucide-react';
import { registerUser, clearError } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Layout from '../layouts/AuthLayout';
import { LogoIcon } from '../components/Logo';
import './Auth.css';

// ─── Validation Schema ────────────────────────────────────────────────────────

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

// ─── Password strength helper ─────────────────────────────────────────────────

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'var(--danger)' };
  if (score <= 3) return { score, label: 'Fair', color: 'var(--warning)' };
  return { score, label: 'Strong', color: 'var(--success)' };
}

// ─── Component ────────────────────────────────────────────────────────────────

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Clear Redux error on unmount
  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
    validationSchema: RegisterSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      const result = await dispatch(registerUser(values));
      if (registerUser.fulfilled.match(result)) {
        navigate('/');
      }
    },
  });

  const fieldError = (name: keyof typeof formik.values) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : undefined;

  const strength = getPasswordStrength(formik.values.password);

  return (
    <Layout>
      <div className="auth-page">
        <div className="bg-blur bg-blur-1" />
        <div className="bg-blur bg-blur-2" />
        <div className="bg-blur bg-blur-3" />

        <div className="auth-card auth-card-wide">
          {/* Header */}
          <div className="auth-header">
            <LogoIcon size={52} />
            <h1>Create Account</h1>
            <p>Join our community and start sharing today.</p>
          </div>

          {/* Server error */}
          {error && (
            <div className="error-message" role="alert">
              <AlertCircle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={formik.handleSubmit} noValidate>
            {/* Username */}
            <div className="form-group">
              <Label.Root className="form-label" htmlFor="reg-username">
                Username
              </Label.Root>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                placeholder="johndoe"
                className={fieldError('username') ? 'input-error' : ''}
                {...formik.getFieldProps('username')}
              />
              {fieldError('username') ? (
                <span className="field-error" role="alert">
                  <AlertCircle size={13} strokeWidth={2.5} />
                  {fieldError('username')}
                </span>
              ) : formik.touched.username && !formik.errors.username && formik.values.username ? (
                <span className="field-success">
                  <CheckCircle2 size={13} strokeWidth={2.5} />
                  Looks good!
                </span>
              ) : null}
            </div>

            {/* Email */}
            <div className="form-group">
              <Label.Root className="form-label" htmlFor="reg-email">
                Email
              </Label.Root>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className={fieldError('email') ? 'input-error' : ''}
                {...formik.getFieldProps('email')}
              />
              {fieldError('email') ? (
                <span className="field-error" role="alert">
                  <AlertCircle size={13} strokeWidth={2.5} />
                  {fieldError('email')}
                </span>
              ) : formik.touched.email && !formik.errors.email && formik.values.email ? (
                <span className="field-success">
                  <CheckCircle2 size={13} strokeWidth={2.5} />
                  Valid email
                </span>
              ) : null}
            </div>

            {/* Password */}
            <div className="form-group">
              <Label.Root className="form-label" htmlFor="reg-password">
                Password
              </Label.Root>
              <div className="password-field">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={fieldError('password') ? 'input-error' : ''}
                  {...formik.getFieldProps('password')}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                </button>
              </div>

              {/* Strength meter */}
              {formik.values.password && (
                <div className="password-strength-bar" aria-label={`Password strength: ${strength.label}`}>
                  <div className="strength-track">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(strength.score / 5) * 100}%`,
                        background: strength.color,
                      }}
                    />
                  </div>
                  <span className="strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}

              {fieldError('password') && (
                <span className="field-error" role="alert">
                  <AlertCircle size={13} strokeWidth={2.5} />
                  {fieldError('password')}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <Label.Root className="form-label" htmlFor="reg-confirm">
                Confirm Password
              </Label.Root>
              <div className="password-field">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={fieldError('password_confirmation') ? 'input-error' : ''}
                  {...formik.getFieldProps('password_confirmation')}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                </button>
              </div>
              {fieldError('password_confirmation') ? (
                <span className="field-error" role="alert">
                  <AlertCircle size={13} strokeWidth={2.5} />
                  {fieldError('password_confirmation')}
                </span>
              ) : formik.touched.password_confirmation &&
                !formik.errors.password_confirmation &&
                formik.values.password_confirmation ? (
                <span className="field-success">
                  <CheckCircle2 size={13} strokeWidth={2.5} />
                  Passwords match
                </span>
              ) : null}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-btn"
              disabled={loading || formik.isSubmitting}
              aria-busy={loading}
            >
              {loading || formik.isSubmitting ? (
                <>
                  <Loader2 size={17} strokeWidth={2.5} className="spin-icon" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={17} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
