import { useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * AI weather insights — 3 brief, actionable recommendations.
 * Shows a skeleton while the request is in flight; hides itself entirely
 * if insights can't be loaded (never breaks the dashboard).
 */
export default function WeatherInsights({ target, unit }) {
  const [state, setState] = useState({ status: 'idle', data: null });

  useEffect(() => {
    if (!target) return undefined;
    let cancelled = false;
    setState({ status: 'loading', data: null });

    api
      .insights(target, unit)
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'hidden', data: null });
      });

    return () => {
      cancelled = true;
    };
  }, [target, unit]);

  if (state.status === 'loading') {
    return (
      <section className="insights-card insights-card--loading" aria-busy="true" aria-label="Loading weather insights">
        <div className="skeleton skeleton-line skeleton-line--title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-line--short" />
      </section>
    );
  }

  if (state.status !== 'ready' || !state.data?.insights?.length) return null;

  const { insights, source, city } = state.data;

  return (
    <section className="insights-card" aria-label="Weather insights">
      <header className="insights-head">
        <h2>✨ Weather insights</h2>
        <span className={`insights-tag insights-tag--${source}`}>
          {source === 'llm' ? 'AI-generated' : 'Smart forecast tips'}
        </span>
      </header>
      <ul className="insights-list">
        {insights.map((text, i) => (
          <li key={i}>
            <span className="insights-num" aria-hidden="true">{i + 1}</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <p className="insights-foot">Personalised for {city} · updates with the data above</p>
    </section>
  );
}
