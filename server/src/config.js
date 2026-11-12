// Fail early and loudly if the database address is missing. A clear message
// now is better than a confusing "cannot connect" error later.
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing. Check your .env file.');
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
};
