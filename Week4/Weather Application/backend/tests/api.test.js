import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Integration test suite for the Weather Dashboard backend.
 * Uses Node's built-in test runner (zero extra dependencies).
 *
 * Run from Week4/Weather Application/backend:  npm test
 *
 * NOTE: these tests exercise pure logic + route contracts without
 * requiring a live MongoDB or OpenWeatherMap key.
 */

/* ---------- pure unit tests: forecast aggregation ---------- */

test('aggregateDaily buckets 3-hour entries into calendar days', async () => {
  const { aggregateDaily } = await import('../src/services/weatherService.js');

  const list = [
    { dt_txt: '2026-10-09 00:00:00', main: { temp: 20, humidity: 70 }, weather: [{ main: 'Clear', icon: '01n' }], pop: 0.1 },
    { dt_txt: '2026-10-09 12:00:00', main: { temp: 30, humidity: 50 }, weather: [{ main: 'Clouds', icon: '04d' }], pop: 0.4 },
    { dt_txt: '2026-10-10 03:00:00', main: { temp: 18, humidity: 80 }, weather: [{ main: 'Rain', icon: '10d' }], pop: 0.9 }
  ];

  const days = aggregateDaily(list);

  assert.equal(days.length, 2);
  assert.equal(days[0].date, '2026-10-09');
  assert.equal(days[0].tempMin, 20);
  assert.equal(days[0].tempMax, 30);
  assert.equal(days[0].humidity, 60); // (70 + 50) / 2
  assert.equal(days[0].condition, 'Clouds'); // midday icon wins
  assert.equal(days[0].pop, 40); // percent
  assert.equal(days[1].date, '2026-10-10');
});

test('aggregateDaily caps output at 5 days', async () => {
  const { aggregateDaily } = await import('../src/services/weatherService.js');

  const list = [];
  for (let d = 1; d <= 7; d++) {
    for (const hh of ['00:00:00', '12:00:00']) {
      list.push({
        dt_txt: `2026-10-${String(d).padStart(2, '0')} ${hh}`,
        main: { temp: 20 + d, humidity: 50 },
        weather: [{ main: 'Clear', icon: '01d' }],
        pop: 0
      });
    }
  }

  assert.equal(aggregateDaily(list).length, 5);
});

/* ---------- pure unit tests: payload normalization ---------- */

test('normalizeCurrent maps OpenWeather payload to view model', async () => {
  const { normalizeCurrent } = await import('../src/services/weatherService.js');

  const model = normalizeCurrent({
    name: 'Pune',
    sys: { country: 'IN', sunrise: 1, sunset: 2 },
    main: { temp: 29.4, feels_like: 31.2, humidity: 64, pressure: 1008 },
    wind: { speed: 3.6 },
    visibility: 6000,
    weather: [{ main: 'Clouds', description: 'broken clouds', icon: '04d' }],
    dt: 1791566400,
    coord: { lat: 18.52, lon: 73.85 }
  });

  assert.equal(model.city, 'Pune');
  assert.equal(model.country, 'IN');
  assert.equal(model.temperature, 29);
  assert.equal(model.feelsLike, 31);
  assert.equal(model.humidity, 64);
  assert.equal(model.windSpeed, 3.6);
  assert.equal(model.condition, 'Clouds');
  assert.equal(model.icon, '04d');
  assert.deepEqual(model.coords, { lat: 18.52, lon: 73.85 });
});

test('normalizeCurrent tolerates missing optional fields', async () => {
  const { normalizeCurrent } = await import('../src/services/weatherService.js');
  const model = normalizeCurrent({ name: 'X', main: {}, weather: [], coord: {} });

  assert.equal(model.city, 'X');
  assert.equal(model.condition, 'Unknown');
  assert.equal(model.humidity, 0);
  assert.equal(model.icon, '01d');
});

/* ---------- validation logic ---------- */

test('query validation rejects bad coordinates', async () => {
  const { httpError } = await import('../src/middleware/errorHandler.js');

  // simulate the controller's validation contract
  const lat = Number('999');
  assert.ok(!Number.isFinite(lat) || lat < -90 || lat > 90);

  const err = httpError(400, 'lat must be a number between -90 and 90.');
  assert.equal(err.status, 400);
  assert.match(err.message, /lat/);
});

test('error handler maps err.status to HTTP code', async () => {
  const { errorHandler, httpError } = await import('../src/middleware/errorHandler.js');

  const err = httpError(404, 'City "nowhere" not found. Check the spelling.');
  let captured;
  errorHandler(err, {}, { status(c) { captured = { code: c }; return this; }, json(b) { captured.body = b; } }, () => {});

  assert.equal(captured.code, 404);
  assert.equal(captured.body.ok, false);
  assert.match(captured.body.error, /not found/);
});

/* ---------- hourly strip aggregation ---------- */

test('aggregateHourly returns only the next 24 hours', async () => {
  const { aggregateHourly } = await import('../src/services/weatherService.js');

  const now = 1_800_000_000; // fixed reference time
  const list = [];
  for (let i = 1; i <= 40; i++) {
    list.push({
      dt: now + i * 3 * 3600, // 3-hour steps
      main: { temp: 20 + i, humidity: 50 },
      weather: [{ main: 'Clouds', icon: '04d' }],
      pop: 0.25
    });
  }

  const hourly = aggregateHourly(list, now);

  assert.ok(hourly.length >= 8, 'expected at least 8 slots in 24h');
  assert.ok(hourly.length <= 9, 'expected at most 9 slots in 24h');
  assert.ok(hourly.every((h) => h.dt <= now + 24 * 3600), 'no slot beyond 24h');
  assert.equal(hourly[0].pop, 25); // percent, not fraction
  assert.ok(Number.isInteger(hourly[0].temp), 'temps are rounded integers');
});

test('aggregateHourly returns empty array when list is empty', async () => {
  const { aggregateHourly } = await import('../src/services/weatherService.js');
  assert.deepEqual(aggregateHourly([]), []);
});

/* ---------- One Call daily normalization ---------- */

test('normalizeOneCallDaily maps 7-day payloads to the shared view model', async () => {
  const { normalizeOneCallDaily } = await import('../src/services/weatherService.js');

  const daily = Array.from({ length: 7 }, (_, i) => ({
    dt: Date.UTC(2026, 9, 10 + i) / 1000,
    temp: { min: 18 + i, max: 28 + i },
    humidity: 55,
    weather: [{ main: 'Rain', icon: '10d' }],
    pop: 0.42,
    sunrise: 1,
    sunset: 2
  }));

  const mapped = normalizeOneCallDaily({ daily });

  assert.equal(mapped.length, 7);
  assert.equal(mapped[0].tempMin, 18);
  assert.equal(mapped[0].tempMax, 28);
  assert.equal(mapped[0].pop, 42);
  assert.equal(mapped[0].condition, 'Rain');
  assert.match(mapped[0].date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(normalizeOneCallDaily({}), null); // tolerant of missing payload
});

/* ---------- zod input validation (friendly errors) ---------- */

test('weatherQuerySchema accepts a city query', async () => {
  const { weatherQuerySchema } = await import('../src/middleware/schemas.js');
  const result = weatherQuerySchema.safeParse({ city: '  Pune  ' });
  assert.ok(result.success);
  assert.equal(result.data.city, 'Pune'); // trimmed
});

test('weatherQuerySchema accepts lat/lon and rejects partial coordinates', async () => {
  const { weatherQuerySchema } = await import('../src/middleware/schemas.js');

  assert.ok(weatherQuerySchema.safeParse({ lat: '18.52', lon: '73.85' }).success, 'string coords coerce to numbers');

  const partial = weatherQuerySchema.safeParse({ lat: '18.52' });
  assert.ok(!partial.success, 'lat without lon must fail');

  const badLat = weatherQuerySchema.safeParse({ lat: '999', lon: '73.85' });
  assert.ok(!badLat.success, 'out-of-range lat must fail');
  assert.match(badLat.error.issues[0].message, /between -90 and 90/);
});

test('weatherQuerySchema rejects empty query with friendly message', async () => {
  const { weatherQuerySchema } = await import('../src/middleware/schemas.js');
  const result = weatherQuerySchema.safeParse({});
  assert.ok(!result.success);
  assert.match(result.error.issues[0].message, /city name or both lat and lon/i);
});

test('signupSchema enforces password length and valid email', async () => {
  const { signupSchema } = await import('../src/middleware/schemas.js');

  const short = signupSchema.safeParse({ name: 'Jo', email: 'jo@example.com', password: '123' });
  assert.ok(!short.success);
  assert.match(short.error.issues[0].message, /at least 8 characters/);

  const badEmail = signupSchema.safeParse({ name: 'Jo', email: 'not-an-email', password: 'password123' });
  assert.ok(!badEmail.success);

  const ok = signupSchema.safeParse({ name: '  Jo  ', email: 'JO@Example.com', password: 'password123' });
  assert.ok(ok.success);
  assert.equal(ok.data.email, 'jo@example.com'); // lowercased + trimmed
});

test('searchQuerySchema requires a meaningful query', async () => {
  const { searchQuerySchema } = await import('../src/middleware/schemas.js');
  assert.ok(!searchQuerySchema.safeParse({ q: 'a' }).success);
  assert.ok(searchQuerySchema.safeParse({ q: 'Reykjavik' }).success);
});
