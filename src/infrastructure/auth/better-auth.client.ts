import { PrismaPg } from '@prisma/adapter-pg';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { customSession } from 'better-auth/plugins';
import { PrismaClient } from 'generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL env variable is not set');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

const ACCOUNT_NOT_ACTIVE_ERROR_CODE = 'ACCOUNT_NOT_ACTIVE';

export const betterAuthClient = betterAuth({
  url: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET as string,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Block sign-in when user is inactive or has no role assigned
      if (ctx.path !== '/sign-in/email') return;

      if (!ctx.body || typeof ctx.body !== 'object') return;
      const body = ctx.body as Record<string, unknown>;
      const emailRaw = body.email;
      if (typeof emailRaw !== 'string') return;
      const email = emailRaw.trim().toLowerCase();
      if (!email) return;

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          isActive: true,
          roles: {
            select: {
              role: { select: { key: true } },
            },
          },
        },
      });

      // If user doesn't exist, let Better Auth handle invalid credentials
      if (!user) return;

      const hasAnyRole = (user.roles?.length ?? 0) > 0;
      if (!user.isActive || !hasAnyRole) {
        throw new APIError('UNAUTHORIZED', {
          code: ACCOUNT_NOT_ACTIVE_ERROR_CODE,
          message: 'Account is not active. Please contact the administrator.',
        });
      }
    }),
  },
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        required: true,
      },
      lastName: {
        type: 'string',
        required: true,
      },
      isAgreedToTerms: {
        type: 'boolean',
        required: true,
      },
      isAgreedToPrivacyPolicy: {
        type: 'boolean',
        required: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!user.isAgreedToTerms || !user.isAgreedToPrivacyPolicy) {
            throw new APIError('BAD_REQUEST', {
              message:
                'You must accept the terms and privacy policy to create an account.',
            });
          }

          await Promise.resolve();
          return { data: user };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    disableOriginCheck: true, // TODO: remove this on production, ONLY FOR DEV!
  },
  trustedOrigins: [process.env.FRONTEND_URL ?? 'http://localhost:3000'],
  plugins: [
    customSession(async ({ user, session }) => {
      const userWithRoles = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          avatarUrl: true,
          roles: {
            include: {
              role: true, // Role.key
            },
          },
        },
      });

      const roleKeys = userWithRoles?.roles.map((ur) => ur.role.key) ?? [];

      return {
        user: {
          ...user,
          roles: roleKeys,
          avatarUrl: userWithRoles?.avatarUrl ?? null,
        },
        session,
      };
    }),
  ],
});
