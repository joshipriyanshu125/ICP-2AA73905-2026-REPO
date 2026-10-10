import { Link } from 'react-router-dom';

/**
 * Saved locations row — quick-switch between favorite cities.
 * Requires sign-in (server enforces per-user row-level scoping).
 */
export default function FavoritesBar({ favorites, signedIn, onSelect, onRemove }) {
  if (!signedIn) {
    return (
      <section className="favorites" aria-label="Saved locations">
        <span className="favorites__hint">
          🔒 <Link to="/auth">Sign in</Link> to save favorite cities
        </span>
      </section>
    );
  }

  if (!favorites.length) {
    return (
      <section className="favorites" aria-label="Saved locations">
        <span className="favorites__hint">☆ Star a city to save it here</span>
      </section>
    );
  }

  return (
    <section className="favorites" aria-label="Saved locations">
      <span className="favorites__label">Saved:</span>
      {favorites.map((fav) => (
        <span key={fav.city} className="fav-chip">
          <button
            type="button"
            className="fav-chip__name"
            onClick={() => onSelect({ city: fav.city, coords: fav.coords?.lat != null ? fav.coords : undefined })}
          >
            {fav.city}
            {fav.country ? ` (${fav.country})` : ''}
          </button>
          <button
            type="button"
            className="fav-chip__remove"
            onClick={() => onRemove(fav.city)}
            aria-label={`Remove ${fav.city} from favorites`}
          >
            ×
          </button>
        </span>
      ))}
    </section>
  );
}
