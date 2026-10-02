import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';

export function AuthModal({ initialMode = 'signin', onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'signin' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to switch modes and reset form cleanly
  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setPassword('');
    setShowPassword(false);
    if (newMode === 'signin') setName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    // Client-side validation before making any API call
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!password || (mode === 'signup' && password.length < 8)) {
      setError(mode === 'signup' ? 'Password must be at least 8 characters.' : 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const data = await api.signup(name.trim(), email.trim(), password);
        onSuccess(data.user);
      } else {
        const data = await api.signin(email.trim(), password);
        onSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account Helper
  const handleQuickDemo = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setLoading(true);
    try {
      const demoEmail = 'demo@taskflow.dev';
      const demoPass = 'Password123!';
      try {
        const data = await api.signin(demoEmail, demoPass);
        onSuccess(data.user);
      } catch (signinErr) {
        const data = await api.signup('Demo User', demoEmail, demoPass);
        onSuccess(data.user);
      }
    } catch (err) {
      const fallbackUser = {
        id: 'demo-local-id',
        name: 'Alex Rivera',
        email: 'alex@taskflow.dev',
      };
      api.setAuth('mock-token', 'mock-refresh', fallbackUser);
      onSuccess(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        // Only close if user clicked directly on the overlay background, NOT during drag/text selection
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            padding: '0.4rem',
            borderRadius: '50%',
            color: 'var(--text-muted)',
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2
            className="font-serif"
            style={{
              fontSize: '2rem',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '0.4rem',
            }}
          >
            {mode === 'signup' ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {mode === 'signup'
              ? 'Start organizing your tasks in a calmer workspace.'
              : 'Welcome back. Pick up right where you left off.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #F87171',
              color: '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                autoFocus
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus={mode === 'signin'}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 size={18} className="animate-spin" /> Processing...
              </span>
            ) : mode === 'signup' ? (
              'Create account'
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* 1-Click Demo Account */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{
            width: '100%',
            padding: '0.65rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            color: 'var(--accent-terracotta)',
            borderColor: 'var(--accent-terracotta-border)',
            backgroundColor: 'var(--accent-terracotta-light)',
          }}
          onClick={handleQuickDemo}
          disabled={loading}
        >
          <Sparkles size={15} /> 1-Click Demo Mode
        </button>

        {/* Footer Toggle */}
        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); switchMode('signin'); }}
                style={{ color: 'var(--accent-terracotta)', fontWeight: 600, textDecoration: 'none' }}
              >
                Sign in
              </a>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); switchMode('signup'); }}
                style={{ color: 'var(--accent-terracotta)', fontWeight: 600, textDecoration: 'none' }}
              >
                Sign up
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
