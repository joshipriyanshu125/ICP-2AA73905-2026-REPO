/**
 * "Use my location" badge — wraps the useGeolocation hook status
 * into a single visual control.
 */
export default function GeolocationBadge({ geo, onLocate }) {
  const label = {
    idle: '📍 Use my location',
    locating: '📍 Locating…',
    granted: '📍 Location active',
    denied: '🚫 Location blocked',
    unavailable: '⚠️ Location unavailable'
  }[geo.status];

  return (
    <div className="geo-row">
      <button
        type="button"
        className={`btn btn-geo geo-${geo.status}`}
        onClick={onLocate}
        disabled={geo.status === 'locating'}
      >
        {label}
      </button>
      {geo.error && <span className="geo-error">{geo.error}</span>}
    </div>
  );
}
