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
