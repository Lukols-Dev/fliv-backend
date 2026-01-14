import { PrismaPg } from '@prisma/adapter-pg';
import { APIError, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
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

export const betterAuthClient = betterAuth({
  url: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET as string,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
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
      // user.id pochodzi z Better Auth (to ten sam id co w tabeli User)
      const userWithRoles = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          roles: {
            include: {
              role: true, // Role.key
            },
          },
        },
      });

      const roleKeys = userWithRoles?.roles.map((ur) => ur.role.key) ?? [];

      return {
        // możesz dodać role także jako osobne pole na root (opcjonalne)
        // roles: roleKeys,

        user: {
          ...user,
          roles: roleKeys, // 👈 finalnie będziesz mieć session.user.roles: string[]
        },
        session,
      };
    }),
  ],
});
