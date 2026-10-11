/**
 * Weather insights generator — "3 brief, actionable insights".
 *
 * Data source: the same WeatherBundle the dashboard renders (current +
 * hourly + daily from the weather service).
 *
 * - If OPENAI_API_KEY is configured, the bundle is sent to an
 *   OpenAI-compatible chat-completions API for natural-language tips.
 * - Otherwise — or whenever the LLM call fails or times out — a
 *   deterministic rule engine produces the insights instead, so this
 *   endpoint NEVER fails because of the AI layer.
 */

const TTL_MS = 10 * 60 * 1000; // insights mirror the weather cache window
const cache = new Map();

// Circuit breaker (same idea as oneCallDisabled in weatherService): after
// repeated LLM failures (quota exhausted, invalid key, outage), skip the LLM
// for a cooldown so insight requests stay fast while the rule engine serves.
const LLM_MAX_FAILURES = 3;
const LLM_COOLDOWN_MS = 10 * 60 * 1000;
let llmFailures = 0;
let llmCooldownUntil = 0;

function cacheGet(key) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data;
  if (hit) cache.delete(key);
  return null;
}
function cacheSet(key, data) {
  if (cache.size > 100) cache.delete(cache.keys().next().value); // cap growth
  cache.set(key, { data, expires: Date.now() + TTL_MS });
}

/* ---------------- formatting helpers ---------------- */

const round = (n) => Math.round(Number(n) || 0);
const toF = (c) => Math.round((Number(c) || 0) * 1.8 + 32); // °C → °F
const temp = (c, unit) => (unit === 'F' ? `${toF(c)}°F` : `${round(c)}°C`);

/** Compact, token-friendly summary of the WeatherBundle for the LLM. */
function weatherSummary({ current = {}, forecast = {} }, unit) {
  const hourly = Array.isArray(forecast.hourly) ? forecast.hourly : [];
  const days = Array.isArray(forecast.days) ? forecast.days : [];
  const pop24 = hourly.reduce((m, h) => Math.max(m, Number(h?.pop) || 0), 0);
  const today = days[0];
  const tomorrow = days[1];

  return [
    `Location: ${current.city || 'unknown'}${current.country ? ', ' + current.country : ''} — temperatures in °${unit}, wind in m/s.`,
    `Now: ${temp(current.temperature, unit)}, feels like ${temp(current.feelsLike, unit)}, ${current.condition || 'Unknown'}, humidity ${round(current.humidity)}%, wind ${round(current.windSpeed)} m/s.`,
    `Next 24h: rain chance up to ${pop24}%.`,
    today
      ? `Today: ${temp(today.tempMin, unit)} to ${temp(today.tempMax, unit)}, ${today.condition}, rain ${round(today.pop)}%.`
      : null,
    tomorrow
      ? `Tomorrow: ${temp(tomorrow.tempMin, unit)} to ${temp(tomorrow.tempMax, unit)}, ${tomorrow.condition}.`
      : null
  ]
    .filter(Boolean)
    .join('\n');
}

/* ---------------- rule engine (always available) ---------------- */

/**
 * Deterministic fallback: exactly 3 actionable sentences covering
 * precipitation, comfort/clothing, and the day's outlook.
 */
export function buildLocalInsights(bundle, unit = 'C') {
  const { current = {}, forecast = {} } = bundle || {};
  const hourly = Array.isArray(forecast.hourly) ? forecast.hourly : [];
  const days = Array.isArray(forecast.days) ? forecast.days : [];
  const today = days[0];
  const tomorrow = days[1];

  const t = round(current.temperature);
  const feels = round(current.feelsLike ?? current.temperature);
  const wind = round(current.windSpeed);
  const humidity = round(current.humidity);
  const condition = String(current.condition || '');
  const pop24 = hourly.reduce((m, h) => Math.max(m, Number(h?.pop) || 0), 0);

  const insights = [];

  /* 1 — precipitation advice */
  if (pop24 >= 60) {
    insights.push(`Rain is likely over the next 24 hours (up to ${pop24}%) — keep an umbrella handy.`);
  } else if (pop24 >= 30) {
    insights.push(`Showers are possible today (up to ${pop24}%) — take a light umbrella, just in case.`);
  } else {
    insights.push(`Rain is unlikely over the next 24 hours (up to ${pop24}%) — a good window for outdoor plans.`);
  }

  /* 2 — comfort / clothing */
  if (t >= 32) {
    insights.push(`Hot at ${temp(t, unit)} (feels like ${temp(feels, unit)}) — stay hydrated and limit direct sun near midday.`);
  } else if (t <= 5) {
    insights.push(`Cold at ${temp(t, unit)} (feels like ${temp(feels, unit)}) — dress in layers and cover up against the wind chill.`);
  } else if (wind >= 15) {
    insights.push(`Strong winds near ${wind} m/s will make it feel colder — a windproof outer layer is recommended.`);
  } else if (humidity >= 85) {
    insights.push(`Muggy air at ${humidity}% humidity — light, breathable clothing and extra water will help.`);
  } else if (feels <= t - 2) {
    insights.push(`It feels colder than the thermometer reads (${temp(feels, unit)} vs ${temp(t, unit)}) — add an extra layer.`);
  } else {
    insights.push(`Pleasant ${temp(t, unit)} (feels like ${temp(feels, unit)}) — light clothing should be comfortable for most of the day.`);
  }

  /* 3 — outlook for the rest of today / tomorrow */
  if (/thunder/i.test(condition)) {
    insights.push('Thunderstorms are in the area — plan indoor activities and re-check the forecast before heading out.');
  } else if (/snow/i.test(condition)) {
    insights.push('Snowy conditions today — allow extra travel time and wear warm, water-resistant footwear.');
  } else if (/fog|mist|haze/i.test(condition)) {
    insights.push(`Reduced visibility from ${condition.toLowerCase()} — drive slowly and use low-beam headlights.`);
  } else if (today && tomorrow && tomorrow.tempMax >= today.tempMax + 3) {
    insights.push(`Tomorrow warms up to ${temp(tomorrow.tempMax, unit)} (today ${temp(today.tempMax, unit)}) — expect a noticeably warmer day.`);
  } else if (today && tomorrow && tomorrow.tempMax <= today.tempMax - 3) {
    insights.push(`Tomorrow cools to ${temp(tomorrow.tempMax, unit)} (today ${temp(today.tempMax, unit)}) — have a warmer layer ready.`);
  } else if (today) {
    insights.push(`A steady ${temp(today.tempMax, unit)} high under ${today.condition} — no big swings expected, so plan the day with confidence.`);
  } else {
    insights.push('Conditions look steady right now — re-check the forecast later for updates.');
  }

  return insights.slice(0, 3);
}

/* ---------------- LLM path (optional) ---------------- */

/** Ask an OpenAI-compatible /chat/completions endpoint for JSON insights. */
async function callLlm(bundle, unit) {
  const key = process.env.OPENAI_API_KEY;
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 300,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a concise weather assistant for a dashboard. Reply ONLY with JSON ' +
            '{"insights": ["...", "...", "..."]} containing exactly 3 brief, actionable, ' +
            `friendly sentences. Use °${unit} for temperatures and m/s for wind, matching the data given. ` +
            'No markdown, no extra keys.'
        },
        { role: 'user', content: weatherSummary(bundle, unit) }
      ]
    }),
    signal: AbortSignal.timeout(9000)
  });

  if (!response.ok) throw new Error(`LLM responded ${response.status}`);
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content || '{}');
  const list = Array.isArray(parsed.insights)
    ? parsed.insights.map((s) => String(s ?? '').trim()).filter(Boolean).slice(0, 3)
    : [];
  if (!list.length) throw new Error('LLM returned no insights');

  // never ship fewer than 3 — pad from the rule engine
  const fallback = buildLocalInsights(bundle, unit);
  while (list.length < 3) list.push(fallback[list.length]);
  return list;
}

/**
 * Generate insights for a WeatherBundle.
 * Returns { insights: string[3], source: 'llm' | 'local' }.
 * Never throws because of the AI layer — weather-data errors still
 * propagate from the caller (they surface as normal 404/5xx responses).
 */
export async function generateInsights(bundle, unit = 'C') {
  const { current = {} } = bundle || {};
  const key = `insights:${unit}:${current.city || ''}:${current.coords?.lat ?? ''}:${current.coords?.lon ?? ''}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  let result = null;
  if (process.env.OPENAI_API_KEY && Date.now() >= llmCooldownUntil) {
    try {
      result = { insights: await callLlm(bundle, unit), source: 'llm' };
      llmFailures = 0;
    } catch (err) {
      llmFailures += 1;
      console.warn(`[insights] LLM unavailable (${llmFailures}/${LLM_MAX_FAILURES}) — using rule engine:`, err.message);
      if (llmFailures >= LLM_MAX_FAILURES) {
        llmFailures = 0;
        llmCooldownUntil = Date.now() + LLM_COOLDOWN_MS;
        console.warn(`[insights] LLM failing repeatedly — cooling down for ${LLM_COOLDOWN_MS / 60000} minutes.`);
      }
    }
  }
  if (!result) result = { insights: buildLocalInsights(bundle, unit), source: 'local' };

  cacheSet(key, result);
  return result;
}
