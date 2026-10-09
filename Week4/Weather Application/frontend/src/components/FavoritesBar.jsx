/**
 * Favorite cities quick-switcher bar (persisted server-side in MongoDB).
 */
export default function FavoritesBar({ favorites, onSelect, onRemove }) {
  if (!favorites.length) return null;

  return (
    <section className="favorites" aria-label="Favorite cities">
      <span className="favorites__label">Favorites:</span>
      {favorites.map((fav) => (
        <span key={fav.city} className="fav-chip">
          <button type="button" className="fav-chip__name" onClick={() => onSelect(fav.city)}>
            ★ {fav.city}{fav.country && ` (${fav.country})`}
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
