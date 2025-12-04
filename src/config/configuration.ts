export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',

  app: {
    port: parseInt(process.env.PORT ?? '4000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    apiVersion: 'v1',
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  auth: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
  },

  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== 'false',
  },
});
