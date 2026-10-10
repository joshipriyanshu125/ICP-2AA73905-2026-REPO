import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { formatHour, toFahrenheit } from '../hooks/useGeolocation.js';

/**
 * Two side-by-side chart cards (full-width row):
 * temperature curve for the next 24h + daily precipitation probability.
 * Accent color is read from the live CSS custom property so charts
 * follow the theme and condition-aware accent automatically.
 */
export default function ForecastCharts({ hourly, days, unit }) {
  const theme = document.documentElement.dataset.theme;
  const condition = document.documentElement.dataset.condition;

  // Read the live accent from CSS so charts follow theme + condition accents
  const accent = useMemo(() => {
    const value = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    return value || '#38bdf8';
  }, [theme, condition, hourly, days]);

  const convert = (c) => (unit === 'F' ? toFahrenheit(c) : c);

  const hourlyData = (hourly || []).map((h) => ({
    label: formatHour(h.dt),
    temp: convert(h.temp),
    pop: h.pop
  }));

  const dailyData = (days || []).map((d) => ({
    label: new Date(`${d.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
    pop: d.pop
  }));

  if (!hourlyData.length && !dailyData.length) return null;

  const tooltipStyle = {
    background: 'var(--surface-solid)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text)',
    fontSize: '0.9rem'
  };

  return (
    <div className="charts-row" aria-label="Weather charts">
      {hourlyData.length > 0 && (
        <section className="card">
          <h3 className="card-title">
            Temperature
            <span className="card-sub">Next 24h · {unit === 'F' ? '°F' : '°C'}</span>
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={hourlyData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.42} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={26} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                domain={['auto', 'auto']}
                tickFormatter={(v) => `${v}°`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: 'var(--muted)' }}
                formatter={(value) => [`${value}°`, 'Temp']}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke={accent}
                strokeWidth={3}
                fill="url(#tempFill)"
                dot={{ r: 3, fill: accent, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      )}

      {dailyData.length > 0 && (
        <section className="card">
          <h3 className="card-title">
            Precipitation Chance
            <span className="card-sub">Daily · %</span>
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: 'var(--muted)' }}
                cursor={{ fill: 'var(--field)' }}
                formatter={(value) => [`${value}%`, 'Rain']}
              />
              <Bar dataKey="pop" fill={accent} radius={[7, 7, 0, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
}
