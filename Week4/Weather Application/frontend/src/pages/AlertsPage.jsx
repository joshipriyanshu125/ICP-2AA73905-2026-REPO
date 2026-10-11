import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import AlertSettings from '../components/AlertSettings.jsx';

function formatDate(value) {
  if (!value) return 'Unknown time';
  return new Date(value).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

function AlertIcon({ type }) {
  return <span aria-hidden="true">{type === 'wind' ? '💨' : type === 'official' ? '⚠️' : '🥶'}</span>;
}

export default function AlertsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('preview');
  const [preview, setPreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    try {
      setHistory(await api.alertHistory());
    } catch (err) {
      setError(err.message || 'Could not load alert history.');
    }
  }, []);

  const runPreview = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const data = await api.alertPreview();
      setPreview(data);
      setSettings(data.settings);
      await loadHistory();
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not check saved locations.');
      setStatus('error');
    }
  }, [loadHistory]);

  useEffect(() => {
    if (!user) return;
    api.getSettings().then(setSettings).catch(() => setSettings(null));
    loadHistory();
  }, [user, loadHistory]);

  if (!user) {
    return (
      <div className="app">
        <header className="app-header">
          <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="brand-mark" aria-hidden="true">⛅</span>
            <div><h1>Alert center</h1><p className="tagline">Threshold previews and alert history</p></div>
          </Link>
          <ThemeToggle />
        </header>
        <section className="notice">
          <strong>🔒 Sign in to use the alert center</strong>
          <p>Save locations, test them against your alert thresholds, and review detected hazards.</p>
          <Link className="btn btn-primary" to="/auth">Sign in</Link>
        </section>
      </div>
    );
  }

  const locations = preview?.locations || [];
  const triggered = locations.filter((location) => location.status === 'triggered').length;
  const clear = locations.filter((location) => location.status === 'clear').length;

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="brand-mark" aria-hidden="true">⛅</span>
          <div>
            <h1>Alert center</h1>
            <p className="tagline">Test saved locations · review hazardous forecasts</p>
          </div>
        </Link>
        <div className="header-actions"><ThemeToggle /><button className="btn" type="button" onClick={() => navigate('/')}>Back to dashboard</button></div>
      </header>

      <section className="alert-center-hero card">
        <div>
          <p className="eyebrow">Saved location safety check</p>
          <h2>Know which places need your attention</h2>
          <p>Run a live preview against your current temperature and wind thresholds. Matches are added to history so you can see when they were detected.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={runPreview} disabled={status === 'loading'}>
          {status === 'loading' ? 'Checking…' : '▶ Run alert preview'}
        </button>
      </section>

      <nav className="alert-tabs" aria-label="Alert center views">
        <button type="button" className={tab === 'preview' ? 'is-active' : ''} onClick={() => setTab('preview')}>🧪 Threshold preview</button>
        <button type="button" className={tab === 'history' ? 'is-active' : ''} onClick={() => setTab('history')}>🕘 Alert history <span>{history.length}</span></button>
        <button type="button" className="alert-tabs__settings" onClick={() => setSettingsOpen(true)}>🔔 Edit thresholds</button>
      </nav>

      {error && <div className="error-banner" role="alert">⚠️ {error}</div>}

      {tab === 'preview' ? (
        <section className="alert-center-section">
          {!preview ? (
            <div className="notice"><strong>Ready to test your saved locations.</strong><p>Run a preview to check the latest conditions and forecast against your thresholds.</p></div>
          ) : (
            <>
              <div className="alert-summary-row">
                <div className="alert-summary"><strong>{locations.length}</strong><span>saved locations checked</span></div>
                <div className="alert-summary alert-summary--danger"><strong>{triggered}</strong><span>triggering an alert</span></div>
                <div className="alert-summary alert-summary--ok"><strong>{clear}</strong><span>within thresholds</span></div>
                <p className="alert-checked">Checked {formatDate(preview.checkedAt)}</p>
              </div>
              {!locations.length ? (
                <div className="notice"><strong>No saved locations yet.</strong><p>Return to the dashboard and star a city to start testing it here.</p></div>
              ) : (
                <div className="alert-location-list">
                  {locations.map((location) => (
                    <article className={`alert-location alert-location--${location.status}`} key={`${location.city}-${location.coords?.lat || ''}`}>
                      <div className="alert-location__head"><div><h3>{location.city}{location.country ? `, ${location.country}` : ''}</h3><p>{location.status === 'triggered' ? 'Threshold match found' : location.status === 'clear' ? 'No matching threshold alerts' : 'Could not check this location'}</p></div><strong className="status-pill">{location.status === 'triggered' ? '⚠ Needs attention' : location.status === 'clear' ? '✓ Clear' : 'Unavailable'}</strong></div>
                      {location.error && <p className="alert-location__error">{location.error}</p>}
                      {location.alerts.length > 0 && <ul className="alert-match-list">{location.alerts.map((alert) => <li key={alert.id}><AlertIcon type={alert.type} /><div><strong>{alert.title}</strong><span>{alert.message}</span><small>Detected {formatDate(alert.detectedAt)}{alert.forecastFor ? ` · forecast for ${alert.forecastFor}` : ''}</small></div></li>)}</ul>}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      ) : (
        <section className="alert-center-section">
          <div className="section-heading"><div><p className="eyebrow">Saved location events</p><h2>Recently detected hazards</h2></div><button className="btn" type="button" onClick={loadHistory}>↻ Refresh</button></div>
          {!history.length ? <div className="notice"><strong>No alert history yet.</strong><p>Run a threshold preview to record any hazardous matches.</p></div> : <div className="history-list">{history.map((item) => <article className="history-item" key={item._id || `${item.city}-${item.type}-${item.detectedAt}`}><span className="history-item__icon"><AlertIcon type={item.type} /></span><div className="history-item__body"><div className="history-item__top"><strong>{item.title}</strong><span>{item.city}{item.country ? `, ${item.country}` : ''}</span></div><p>{item.message}</p><small>Detected {formatDate(item.detectedAt)}{item.forecastFor ? ` · forecast for ${item.forecastFor}` : ''}</small></div></article>)}</div>}
        </section>
      )}

      {settings && <p className="threshold-note">Current thresholds: below <strong>{settings.minTempAlert}°C</strong> or above <strong>{settings.maxWindAlert} m/s</strong> · alerts {settings.alertEnabled ? 'enabled' : 'disabled'}</p>}

      <AlertSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} user={user} settings={settings} onSaved={setSettings} onSignIn={() => navigate('/auth')} />
    </div>
  );
}
