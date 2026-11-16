// Fail early and loudly if a required setting is missing. A clear message
// now is better than a confusing error later.
function required(name){
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing. Check your .env file.`);
  }
  return value;
}

const jwtAccessSecret = required('JWT_ACCESS_SECRET');
//  A Short secret is easy to guess, which would let someone forge tokens.
if (jwtAccessSecret.length < 32){
  throw new Error('JWT_ACCESS_SECRET must be at least 32 characters.');
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret,
  cookieSecure: process.env.COOKIE_SECURE === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
};