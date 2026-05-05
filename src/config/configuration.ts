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

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    defaultFolder: process.env.CLOUDINARY_DEFAULT_FOLDER ?? 'fliv',
  },

  here: {
    geocodingApiKey: process.env.HERE_GEOCODING_API_KEY,
    geocodingBaseUrl:
      process.env.HERE_GEOCODING_BASE_URL ??
      'https://geocode.search.hereapi.com/v1/geocode',
  },
});
