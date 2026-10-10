/**
 * "Use my location" control — renders inline inside the search row.
 * Also reports the accuracy of the device's position fix: when the
 * browser only has a coarse (network/IP-based) estimate, we warn the
 * user so they know to search for their exact city instead.
 */

/** Format a horizontal accuracy in meters → "±8 m" / "±12 km". */
function formatAccuracy(meters) {
  if (meters == null || !Number.isFinite(meters)) return null;
  if (meters < 1000) return `±${Math.round(meters)} m`;
  const km = meters / 1000;
  return `±${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

export default function GeolocationBadge({ geo, onLocate }) {
  const label = {
    idle: '📍 Use my location',
    locating: 'Locating…',
    granted: '📍 Location active',
    denied: '🚫 Location blocked',
    unavailable: '⚠️ Location unavailable'
  }[geo.status];

  const accuracy = geo.status === 'granted' ? formatAccuracy(geo.accuracy) : null;
  const isCoarse = geo.status === 'granted' && typeof geo.accuracy === 'number' && geo.accuracy > 10000;

  return (
    <span className="geo-inline">
      <button
        type="button"
        className={`btn btn-geo geo-${geo.status}`}
        onClick={onLocate}
        disabled={geo.status === 'locating'}
      >
        {label}
      </button>

      {accuracy && (
        <span
          className={`geo-accuracy ${isCoarse ? 'geo-accuracy--low' : ''}`}
          title="Position accuracy reported by your device"
        >
          {accuracy}
          {isCoarse ? ' — approximate, search for your city' : ''}
        </span>
      )}

      {geo.error && <span className="geo-error">{geo.error}</span>}
    </span>
  );
}
