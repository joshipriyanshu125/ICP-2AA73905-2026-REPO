import { useState, useEffect, useCallback } from 'react';

/**
 * Browser Geolocation hook.
 * States: idle | locating | granted | denied | unavailable
 */
export function useGeolocation() {
  const [state, setState] = useState({ status: 'idle', coords: null, error: null });

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'unavailable', coords: null, error: 'Geolocation is not supported by this browser.' });
      return;
    }
    setState((s) => ({ ...s, status: 'locating', error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) =>
        setState({
          status: 'granted',
          coords: { lat: position.coords.latitude, lon: position.coords.longitude },
          error: null
        }),
      (error) =>
        setState({
          status: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
          coords: null,
          error:
            error.code === error.PERMISSION_DENIED
              ? 'Location permission denied — search for a city instead.'
              : 'Could not determine your location.'
        }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  return { ...state, locate };
}

/** C → F helper used by the unit toggle. */
export function toFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

/** "2026-10-09" → "Fri, Oct 9" */
export function formatDay(dateString) {
  const d = new Date(`${dateString}T12:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
    Haze: '🌫️'
  };
  return map[condition] || '🌡️';
}

/** Convenience for icon <img>. */
export function iconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
