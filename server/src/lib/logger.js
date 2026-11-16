import pino from 'pino';
import {config} from '../config.js';

// JSON logs, as the TRD asks. Tests stay quiet.
// Rule: never log passwords, tokens, emails or message text.

export const logger = pino({
  level: config.nodeEnv === 'test' ? 'silent' : config.logLevel,
});