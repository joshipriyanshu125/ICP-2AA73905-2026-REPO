import { useState, useEffect, useCallback } from 'react';

/**
 * Browser Geolocation hook — real-time device position.
 * States: idle | locating | granted | denied | unavailable
 *
 * Requests a FRESH high-accuracy fix (no stale cache). If the high-accuracy
 * request fails (common on desktops without GPS), it retries once with a
 * relaxed network-based fix before giving up. The reported horizontal
 * accuracy (meters) is exposed so the UI can warn about coarse positions.
 */
export function useGeolocation() {
  const [state, setState] = useState({ status: 'idle', coords: null, accuracy: null, error: null });

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'unavailable', coords: null, accuracy: null, error: 'Geolocation is not supported by this browser.' });
      return;
    }
    setState((s) => ({ ...s, status: 'locating', error: null }));

    const onSuccess = (position) =>
      setState({
        status: 'granted',
        coords: { lat: position.coords.latitude, lon: position.coords.longitude },
        accuracy: typeof position.coords.accuracy === 'number' ? position.coords.accuracy : null,
        error: null
      });

    const onError = (error, isRetry) => {
      if (error.code === error.PERMISSION_DENIED) {
        setState({
          status: 'denied',
          coords: null,
          accuracy: null,
          error: 'Location permission denied — search for a city instead.'
        });
        return;
      }
      if (!isRetry) {
        // High-accuracy failed → retry once with a relaxed network-based fix
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          (retryError) => onError(retryError, true),
          { enableHighAccuracy: false, timeout: 12000, maximumAge: 0 }
        );
        return;
      }
      setState({
        status: 'unavailable',
        coords: null,
        accuracy: null,
        error: 'Could not determine your location.'
      });
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (error) => onError(error, false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { ...state, locate };
}

/* ---------------- formatting helpers ---------------- */

/** C → F helper used by the unit toggle. */
export function toFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

/** "2026-10-09" → "Fri, Oct 9" */
export function formatDay(dateString) {
  const d = new Date(`${dateString}T12:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/** "2026-10-09" → "Tomorrow" / "Today" when applicable. */
export function relativeDay(dateString) {
  const today = new Date();
  const target = new Date(`${dateString}T12:00:00`);
  const strip = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((strip(target) - strip(today)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return null;
}

/** Unix seconds → "3 PM" */
export function formatHour(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true
  });
}

/** Unix seconds → "6:42 AM" */
export function formatClock(unixSeconds) {
  if (!unixSeconds) return '—';
  return new Date(unixSeconds * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/** OpenWeather icon code → emoji fallback (used if image CDN fails). */
export function conditionEmoji(condition) {
  const map = {
    Clear: '☀️',
    Clouds: '⛅',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '🌨️',
    Mist: '🌫️',
    Fog: '🌫️',
    Haze: '🌫️',
    Smoke: '🌫️',
    Dust: '🌫️',
    Sand: '🌫️'
  };
  return map[condition] || '🌡️';
}

/** Condition group used for theme accents (clear | rain | atmos | …). */
export function conditionGroup(condition = '') {
  const c = condition.toLowerCase();
  if (['mist', 'fog', 'haze', 'smoke', 'dust', 'sand', 'tornado'].includes(c)) return 'atmos';
  if (['rain', 'drizzle'].includes(c)) return 'rain';
  if (c === 'thunderstorm') return 'thunderstorm';
  if (['clear', 'clouds', 'snow'].includes(c)) return c;
  return '';
}

/** Convenience for icon <img>. `size` is '1x' | '2x' | '4x'. */
export function iconUrl(iconCode, size = '2x') {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
}
