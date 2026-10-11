import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

const DEFAULTS = { alertEnabled: true, minTempAlert: 5, maxWindAlert: 20 };

/**
 * "Alert settings" modal (plain React — no extra UI dependency).
 * - Signed out → explains the feature and offers a sign-in shortcut.
 * - Signed in → edits alertEnabled / minTempAlert / maxWindAlert,
 *   persisted per user via PUT /api/settings.
 * Escape and overlay click close it; focus lands on the first field.
 */
export default function AlertSettings({ open, onClose, user, settings, onSaved, onSignIn }) {
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const firstFieldRef = useRef(null);

  // sync form whenever the dialog opens (or newer settings arrive)
  useEffect(() => {
    if (open) {
      setForm({ ...DEFAULTS, ...(settings || {}) });
      setError(null);
      setSaving(false);
      const id = requestAnimationFrame(() => firstFieldRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [open, settings]);

  // Escape to close + lock background scroll while open
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const setNumber = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const data = await api.saveSettings({
        alertEnabled: !!form.alertEnabled,
        minTempAlert: Number(form.minTempAlert),
        maxWindAlert: Number(form.maxWindAlert)
      });
      onSaved(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save your settings.');
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="alert-settings-title">
        <header className="modal-head">
          <h2 id="alert-settings-title">🔔 Alert settings</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">×</button>
        </header>

        {!user ? (
          <div className="modal-body">
            <p className="modal-note">
              Sign in to choose when the dashboard should warn you — temperature and wind thresholds are
              saved to your account.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={onClose}>Not now</button>
              <button type="button" className="btn btn-primary" onClick={onSignIn}>Sign in</button>
            </div>
          </div>
        ) : (
          <div className="modal-body">
            <label className="switch-row">
              <input
                type="checkbox"
                checked={!!form.alertEnabled}
                onChange={(e) => setForm((f) => ({ ...f, alertEnabled: e.target.checked }))}
              />
              <span>Enable custom weather alerts</span>
            </label>

            <div className="modal-field">
              <label htmlFor="alert-min-temp">Alert me when the temperature falls below</label>
              <div className="input-suffix">
                <input
                  id="alert-min-temp"
                  ref={firstFieldRef}
                  type="number"
                  min={-60}
                  max={60}
                  value={form.minTempAlert}
                  disabled={!form.alertEnabled}
                  onChange={setNumber('minTempAlert')}
                />
                <span>°C</span>
              </div>
            </div>

            <div className="modal-field">
              <label htmlFor="alert-max-wind">Alert me when the wind exceeds</label>
              <div className="input-suffix">
                <input
                  id="alert-max-wind"
                  type="number"
                  min={0}
                  max={120}
                  value={form.maxWindAlert}
                  disabled={!form.alertEnabled}
                  onChange={setNumber('maxWindAlert')}
                />
                <span>m/s</span>
              </div>
            </div>

            <p className="modal-note">
              Official severe-weather warnings from OpenWeatherMap appear automatically at the top of the
              dashboard when your plan includes One Call 3.0.
            </p>

            {error && (
              <p className="modal-error" role="alert">⚠️ {error}</p>
            )}

            <div className="modal-actions">
              <button type="button" className="btn" onClick={onClose} disabled={saving}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save preferences'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
