import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import * as Label from '@radix-ui/react-label';
import { Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { loginUser, clearError } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Layout from '../layouts/AuthLayout';
import { LogoIcon } from '../components/Logo';
import './Auth.css';

// ─── Validation Schema ────────────────────────────────────────────────────────

const LoginSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .max(10,"Maximal 10 angaka")
    .required('Password is required'),
});

// ─── Component ────────────────────────────────────────────────────────────────

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Clear Redux error when unmounting
  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: LoginSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      const result = await dispatch(loginUser(values));
      if (loginUser.fulfilled.match(result)) {
        navigate('/');
      }
    },
  });

  const fieldError = (name: 'email' | 'password') =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : undefined;

  return (
    <Layout>
      <div className="auth-page">
        <div className="bg-blur bg-blur-1" />
        <div className="bg-blur bg-blur-2" />
        <div className="bg-blur bg-blur-3" />

        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <LogoIcon size={52} variant="color" />
            <h1>Welcome Back</h1>
            <p>Sign in to continue to your account</p>
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
            {/* Email */}
            <div className="form-group">
              <Label.Root className="form-label" htmlFor="login-email">
                Email
              </Label.Root>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className={fieldError('email') ? 'input-error' : ''}
                {...formik.getFieldProps('email')}
              />
              {fieldError('email') && (
                <span className="field-error" role="alert">
                  <AlertCircle size={13} strokeWidth={2.5} />
                  {fieldError('email')}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <Label.Root className="form-label" htmlFor="login-password">
                Password
              </Label.Root>
              <div className="password-field">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
              {fieldError('password') && (
                <span className="field-error" role="alert">
                  <AlertCircle size={13} strokeWidth={2.5} />
                  {fieldError('password')}
                </span>
              )}
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={17} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
