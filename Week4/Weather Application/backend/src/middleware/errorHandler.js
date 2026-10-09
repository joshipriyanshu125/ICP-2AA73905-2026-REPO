/**
 * Centralized error responder.
 * Errors thrown with `err.status` map to that HTTP code;
 * everything else becomes a 500 (stack hidden in production).
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Something went wrong';

  if (status >= 500) console.error('[error]', err);
  else console.warn(`[${status}]`, message);

  res.status(status).json({ ok: false, error: message });
}

export function notFound(req, res) {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/** Helper: throw an HTTP error from anywhere in the service layer. */
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
