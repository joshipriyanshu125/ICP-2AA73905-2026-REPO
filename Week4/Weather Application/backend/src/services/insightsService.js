/**
 * Weather insights generator — concise explanations plus practical advice.
 *
 * Data source: the same WeatherBundle the dashboard renders (current +
 * hourly + daily from the weather service).
 *
 * - If AI_GATEWAY_API_KEY is configured, the bundle is sent to the
 *   Vercel AI Gateway's OpenAI-compatible chat-completions API. The legacy
 *   OPENAI_* variables remain supported for local/self-hosted deployments.
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
const deltaTemp = (c, unit) => (unit === 'F' ? `${Math.round((Number(c) || 0) * 1.8)}°F` : `${round(c)}°C`);

const cleanList = (value, limit = 4) =>
  Array.isArray(value)
    ? value.map((item) => String(item ?? '').trim()).filter(Boolean).slice(0, limit)
    : [];

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

/**
 * Local analysis used when the model is unavailable. It deliberately uses
 * the same current + forecast bundle as the model so the feature remains
 * useful without an AI credential.
 */
export function buildLocalAnalysis(bundle, unit = 'C') {
  const { current = {}, forecast = {} } = bundle || {};
  const days = Array.isArray(forecast.days) ? forecast.days : [];
  const today = days[0];
  const tomorrow = days[1];
  const changes = [];
  const activities = [];
  const precautions = [];
  const now = round(current.temperature);
  const todayHigh = Number(today?.tempMax);
  const tomorrowHigh = Number(tomorrow?.tempMax);
  const pop24 = (Array.isArray(forecast.hourly) ? forecast.hourly : [])
    .reduce((max, slot) => Math.max(max, Number(slot?.pop) || 0), 0);

  if (Number.isFinite(todayHigh) && Math.abs(todayHigh - now) >= 5) {
    changes.push(`Temperatures move from ${temp(now, unit)} now to a ${temp(todayHigh, unit)} high today.`);
  }
  if (Number.isFinite(tomorrowHigh) && Number.isFinite(todayHigh) && Math.abs(tomorrowHigh - todayHigh) >= 3) {
    changes.push(`Tomorrow is ${tomorrowHigh > todayHigh ? 'warmer' : 'cooler'} by about ${deltaTemp(Math.abs(tomorrowHigh - todayHigh), unit)}, reaching ${temp(tomorrowHigh, unit)}.`);
  }
  if (pop24 >= 30 || Number(today?.pop) >= 30) {
    changes.push(`Precipitation risk increases to ${Math.max(pop24, Number(today?.pop) || 0)}% over the near-term forecast.`);
  }
  if (today?.condition && current.condition && today.condition.toLowerCase() !== current.condition.toLowerCase()) {
    changes.push(`Conditions may shift from ${String(current.condition).toLowerCase()} to ${String(today.condition).toLowerCase()} later today.`);
  }
  if (!changes.length) changes.push('The current pattern looks fairly steady across the available forecast.');

  if (pop24 < 30 && !/storm|snow/i.test(String(current.condition))) {
    activities.push('Outdoor plans are a reasonable choice during the drier windows.');
  } else if (pop24 >= 60 || /storm|snow/i.test(String(current.condition))) {
    activities.push('Choose flexible indoor plans and use shorter outdoor windows between showers.');
  } else {
    activities.push('A short outdoor activity should work well if you keep a backup plan nearby.');
  }
  if (now >= 30) activities.push('Plan lower-intensity activities in shaded or air-conditioned places.');
  else if (now <= 8) activities.push('Indoor errands or a bundled-up walk are more comfortable than extended outdoor time.');
  else activities.push('A walk, commute, or casual outdoor activity should be comfortable with the right layer.');

  if (pop24 >= 40) precautions.push('Carry rain protection and allow extra time for wet travel.');
  if (Number(current.windSpeed) >= 12) precautions.push(`Secure loose items and be cautious around exposed areas with ${round(current.windSpeed)} m/s winds.`);
  if (now >= 32 || Number(current.feelsLike) >= 35) precautions.push('Drink water regularly and limit direct sun around the hottest part of the day.');
  if (now <= 5 || Number(current.feelsLike) <= 3) precautions.push('Wear insulating layers and protect exposed skin from the cold.');
  if (/fog|mist|haze/i.test(String(current.condition))) precautions.push('Expect reduced visibility; slow down and use low-beam headlights when driving.');
  if (!precautions.length) precautions.push('No major extra precaution stands out; check again before plans if conditions change.');

  return {
    summary: `${current.city || 'This location'} is currently ${String(current.condition || 'showing mixed conditions').toLowerCase()} at ${temp(now, unit)}.`,
    changes: changes.slice(0, 4),
    activities: activities.slice(0, 3),
    precautions: precautions.slice(0, 4)
  };
}

/* ---------------- LLM path (optional) ---------------- */

/** Ask an AI Gateway/OpenAI-compatible /chat/completions endpoint for JSON. */
async function callLlm(bundle, unit) {
  const gateway = Boolean(process.env.AI_GATEWAY_API_KEY);
  const key = process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY;
  const base = (gateway
    ? process.env.AI_GATEWAY_BASE_URL || 'https://ai-gateway.vercel.sh/v1'
    : process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = gateway
    ? process.env.AI_GATEWAY_MODEL || 'openai/gpt-4o-mini'
    : process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 500,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
            content:
            'You are a concise weather assistant for a dashboard. Reply ONLY with JSON using exactly these keys: ' +
            '{"summary":"...","changes":["..."],"activities":["..."],"precautions":["..."],"insights":["...","...","..."]}. ' +
            `Explain the most notable current-to-forecast changes, then give practical activities and precautions. Use °${unit} for temperatures and m/s for wind, matching the data given. ` +
            'Keep each item to one sentence, use plain language, do not invent data, and return 1-4 items per list.'
        },
        { role: 'user', content: weatherSummary(bundle, unit) }
      ]
    }),
    signal: AbortSignal.timeout(9000)
  });

  if (!response.ok) throw new Error(`LLM responded ${response.status}`);
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  const parsed = JSON.parse(String(content || '{}').replace(/^```json\s*|\s*```$/g, ''));
  const list = cleanList(parsed.insights, 3);
  if (!list.length) throw new Error('LLM returned no insights');

  const fallback = buildLocalAnalysis(bundle, unit);
  const fallbackInsights = buildLocalInsights(bundle, unit);
  while (list.length < 3) list.push(fallbackInsights[list.length]);
  return {
    insights: list,
    summary: String(parsed.summary || fallback.summary).trim(),
    changes: cleanList(parsed.changes).length ? cleanList(parsed.changes) : fallback.changes,
    activities: cleanList(parsed.activities).length ? cleanList(parsed.activities) : fallback.activities,
    precautions: cleanList(parsed.precautions).length ? cleanList(parsed.precautions) : fallback.precautions
  };
}

/**
 * Generate insights for a WeatherBundle.
 * Returns structured analysis plus the legacy `insights` list.
 * Never throws because of the AI layer — weather-data errors still
 * propagate from the caller (they surface as normal 404/5xx responses).
 */
export async function generateInsights(bundle, unit = 'C') {
  const { current = {} } = bundle || {};
  const key = `insights:${unit}:${current.city || ''}:${current.coords?.lat ?? ''}:${current.coords?.lon ?? ''}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  let result = null;
  if ((process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY) && Date.now() >= llmCooldownUntil) {
    try {
      result = { ...(await callLlm(bundle, unit)), source: 'llm' };
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
  if (!result) result = { ...buildLocalAnalysis(bundle, unit), insights: buildLocalInsights(bundle, unit), source: 'local' };

  cacheSet(key, result);
  return result;
}
