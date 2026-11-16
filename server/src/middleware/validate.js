import { badRequest } from '../lib/errors.js';

// Turns zod's list of problems into { fieldName: 'first message for that field' }.
function toFields(zodError) {
  const fields = {};
  for (const issue of zodError.issues) {
    const key = issue.path.join('.') || 'form';
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

// Usage: validate({ body: someSchema }). The cleaned result lands on req.valid,
// so routes use req.valid.body, never the raw req.body.
export function validate(schemas) {
  return (req, res, next) => {
    const valid = {};
    for (const part of ['params', 'query', 'body']) {
      if (!schemas[part]) continue;
      const result = schemas[part].safeParse(req[part]);
      if (!result.success) {
        return next(badRequest('Please check the highlighted fields.', toFields(result.error)));
      }
      valid[part] = result.data;
    }
    req.valid = valid;
    next();
  };
}