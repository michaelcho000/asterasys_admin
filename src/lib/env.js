// Environment variable validation and type safety

const getEnvVariable = (key, defaultValue = '') => {
  const value = process.env[key];
  if (value === undefined && defaultValue === '') {
    console.warn(`Environment variable ${key} is not defined`);
  }
  return value || defaultValue;
};

const env = {
  // Application
  app: {
    name: getEnvVariable('NEXT_PUBLIC_APP_NAME', 'Duralux Admin'),
    url: getEnvVariable('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    version: getEnvVariable('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
  },
  
  // API
  api: {
    url: getEnvVariable('NEXT_PUBLIC_API_URL', 'http://localhost:3000/api'),
    secretKey: getEnvVariable('API_SECRET_KEY'),
  },
  
  // Database
  database: {
    url: getEnvVariable('DATABASE_URL'),
  },
  
  // Authentication
  auth: {
    nextAuthUrl: getEnvVariable('NEXTAUTH_URL', 'http://localhost:3000'),
    nextAuthSecret: getEnvVariable('NEXTAUTH_SECRET'),
    jwtSecret: getEnvVariable('JWT_SECRET'),
  },
  
  // Feature Flags
  features: {
    analytics: getEnvVariable('NEXT_PUBLIC_ENABLE_ANALYTICS', 'false') === 'true',
    chat: getEnvVariable('NEXT_PUBLIC_ENABLE_CHAT', 'true') === 'true',
    notifications: getEnvVariable('NEXT_PUBLIC_ENABLE_NOTIFICATIONS', 'true') === 'true',
  },
  
  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  debug: getEnvVariable('DEBUG', 'false') === 'true',
};

export default env;