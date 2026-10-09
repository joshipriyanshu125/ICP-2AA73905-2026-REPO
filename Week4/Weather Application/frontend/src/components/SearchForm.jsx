import { useState } from 'react';

/**
 * City search form with recent-search chips (Presentation Layer only —
 * all data flows in/out via props).
 */
export default function SearchForm({ onSearch, history, onClearHistory, loading }) {
  const [query, setQuery] = useState('');

  function submit(event) {
    event.preventDefault();
    const city = query.trim();
    if (city.length < 2) return;
    onSearch(city);
    setQuery('');
  }

  return (
    <section className="search-section" aria-label="City search">
      <form className="search-form" onSubmit={submit}>
        <input
          type="search"
          className="search-input"
          placeholder="Search any city… e.g. Pune, Tokyo, Reykjavik"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="City name"
          maxLength={60}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || query.trim().length < 2}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {history.length > 0 && (
        <div className="history-row">
          <span className="history-label">Recent:</span>
          {history.map((item) => (
            <button
              key={item.city}
              type="button"
              className="chip"
              onClick={() => onSearch(item.city)}
              title={`Searched ${item.count}×`}
            >
              {item.city} {item.lastTemp != null && <em>{item.lastTemp}°</em>}
            </button>
          ))}
          <button type="button" className="chip chip-ghost" onClick={onClearHistory}>
            clear
          </button>
        </div>
      )}
    </section>
  );
}
