import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.string().optional(),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),

  API_PREFIX: z.string().optional(),

  SWAGGER_ENABLED: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_DEFAULT_FOLDER: z.string().min(1).default('fliv'),

  HERE_GEOCODING_API_KEY: z.string().min(1),
  HERE_GEOCODING_BASE_URL: z.string().url().optional(),
  HERE_ROUTING_API_KEY: z.string().min(1).optional(),
  HERE_ROUTING_BASE_URL: z.string().url().optional(),
});

export type EnvVars = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvVars {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.format());
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}
