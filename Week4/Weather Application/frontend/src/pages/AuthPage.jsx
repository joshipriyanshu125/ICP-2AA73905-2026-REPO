import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

/**
 * Sign-in / sign-up page (/auth).
 * Saving favorite locations requires an account (row-level scoping on the server).
 */
export default function AuthPage() {
  const { user, signup, signin } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Sign in | Weather Dashboard';
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      'Sign in to save favorite cities on your Weather Dashboard.'
    );
  }, []);

  // already signed in → go back to the dashboard
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signup') await signup(name.trim(), email.trim(), password);
      else await signin(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span aria-hidden="true" style={{ fontSize: '1.6rem' }}>⛅</span>
          <h2>{mode === 'signin' ? 'Welcome back' : 'Create account'}</h2>
        </div>
        <div style={{ position: 'absolute', top: 18, right: 18 }} />
        <p className="auth-card__sub">
          {mode === 'signin'
            ? 'Sign in to save favorite cities across sessions.'
            : 'One account — your saved cities, everywhere you go.'}
        </p>

        {error && (
          <div className="auth-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={60}
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={mode === 'signup' ? 8 : 1}
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'signin' ? 'New here? ' : 'Already have an account? '}
          <button type="button" onClick={() => { setMode((m) => (m === 'signin' ? 'signup' : 'signin')); setError(null); }}>
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </button>
        </p>

        <Link to="/" className="auth-back">← Back to dashboard</Link>
      </div>

      <div style={{ position: 'fixed', top: 18, right: 18 }}>
        <ThemeToggle />
      </div>
    </div>
  );
}
