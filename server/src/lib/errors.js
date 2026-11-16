// One error type for problems we EXPECT: bad input, not logged in, email taken.
// Anything that is not an AppError is a bug, and the error handler treats it so.
export class AppError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status; // HTTP status number, for example 404
    this.code = code; // short machine-readable word from the TRD list
    this.fields = fields; // optional { fieldName: 'what is wrong' }
  }
}

// Shortcuts so the rest of the code reads like a sentence:
//   throw conflict('An account with this email already exists.');
export const badRequest = (message, fields) =>
  new AppError(400, 'VALIDATION_ERROR', message, fields);
export const unauthenticated = (message = 'Please log in.') =>
  new AppError(401, 'UNAUTHENTICATED', message);
export const forbidden = (message = 'Not allowed.') => new AppError(403, 'FORBIDDEN', message);
export const notFound = (message = 'Not found.') => new AppError(404, 'NOT_FOUND', message);
export const conflict = (message) => new AppError(409, 'CONFLICT', message);