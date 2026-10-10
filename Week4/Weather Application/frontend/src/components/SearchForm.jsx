import { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';

/**
 * City search with OpenWeatherMap geocoding suggestions
 * (search-as-you-type, debounced) + recent-search chips.
 */
export default function SearchForm({ onSearch, history, onClearHistory, loading, extra }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);

  /* debounced geocoding lookup */
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const results = await api.searchCities(q);
        setSuggestions(results);
        setOpen(true);
        setActive(-1);
      } catch {
        setSuggestions([]); // suggestions are best-effort only
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  /* close dropdown on outside click */
  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function pick(suggestion) {
    onSearch({ city: suggestion.name, coords: { lat: suggestion.lat, lon: suggestion.lon } });
    setQuery('');
    setSuggestions([]);
    setOpen(false);
  }

  function submit(event) {
    event.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    if (active >= 0 && suggestions[active]) return pick(suggestions[active]);
    onSearch({ city: q });
    setQuery('');
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open || !suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <section className="search-section" aria-label="City search">
      <form className="search-form" onSubmit={submit}>
        <div className="search-wrap" ref={boxRef}>
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            className="search-input"
            placeholder="Search any city… e.g. Pune, Tokyo, Reykjavik"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => suggestions.length && setOpen(true)}
            aria-label="City name"
            aria-autocomplete="list"
            aria-expanded={open}
            maxLength={60}
            autoComplete="off"
          />
          {open && suggestions.length > 0 && (
            <ul className="suggestions" role="listbox">
              {suggestions.map((s, i) => (
                <li key={`${s.lat}-${s.lon}-${s.name}`}>
                  <button
                    type="button"
                    className={`suggestion ${i === active ? 'is-active' : ''}`}
                    onClick={() => pick(s)}
                    onMouseEnter={() => setActive(i)}
                  >
                    <span className="suggestion__place">
                      {s.name}
                      {s.state ? <span className="suggestion__meta">, {s.state}</span> : null}
                      <span className="suggestion__meta">, {s.country}</span>
                    </span>
                    <span className="suggestion__coords">
                      {s.lat.toFixed(2)}, {s.lon.toFixed(2)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className="btn btn-primary search-submit" disabled={loading || query.trim().length < 2}>
          {loading ? 'Searching…' : 'Search'}
        </button>
        {extra}
      </form>

      {history.length > 0 && (
        <div className="history-row">
          <span className="history-label">Recent:</span>
          {history.map((item) => (
            <button
              key={item.city}
              type="button"
              className="chip"
              onClick={() => onSearch({ city: item.city })}
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
