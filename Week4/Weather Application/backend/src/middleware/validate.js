import { httpError } from './errorHandler.js';

/**
 * Zod validation middleware — rejects invalid payloads with HTTP 400
 * and a friendly, human-readable message BEFORE controllers run.
 *
 * Usage: router.post('/path', validateBody(schema), handler)
 *        router.get('/path', validateQuery(schema), handler)
 */
function run(schema, source, req, res, next) {
  const result = schema.safeParse(req[source]);
  if (result.success) {
    // merge coerced/transformed values back onto the request
    if (source === 'query') req.query = result.data;
    else req[source] = result.data;
    return next();
  }

  const messages = result.error.issues
    .map((issue) => {
      const path = issue.path.join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join(' | ');

  return next(httpError(400, messages));
}

export const validateBody = (schema) => (req, res, next) => run(schema, 'body', req, res, next);
export const validateQuery = (schema) => (req, res, next) => run(schema, 'query', req, res, next);
