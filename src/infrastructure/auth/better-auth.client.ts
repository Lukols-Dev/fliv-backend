import { PrismaPg } from '@prisma/adapter-pg';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { customSession } from 'better-auth/plugins';
import { PrismaClient } from 'generated/prisma/client';

type HeaderValue = string | string[] | undefined;

type HeadersLike = Pick<Headers, 'get'> | Record<string, HeaderValue>;

type CtxWithHeaders = {
  headers?: HeadersLike;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL env variable is not set');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

const X_CLIENT_HEADER = 'x-client';
const X_CLIENT_MOBILE = 'mobile';
const REQUIRED_MOBILE_ROLE_KEY = 'DRIVER';

const GENERIC_AUTH_MESSAGE = 'Invalid email or password';
const MOBILE_AUTH_DELAY_MS = 250;

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function getHeader(ctx: CtxWithHeaders, name: string): string | null {
  const h = ctx?.headers;
  if (!h) return null;

  if ('get' in h && typeof h.get === 'function') {
    const v = h.get(name);
    return typeof v === 'string' ? v : null;
  }

  const obj = h as Record<string, HeaderValue>;
  const key = Object.keys(obj).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  if (!key) return null;

  const v = obj[key];
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v[0] ?? null;

  return null;
}

function isMobileClient(ctx: CtxWithHeaders): boolean {
  const raw = getHeader(ctx, X_CLIENT_HEADER);
  return (raw ?? '').trim().toLowerCase() === X_CLIENT_MOBILE;
}

function throwGenericAuth() {
  throw new APIError('UNAUTHORIZED', {
    message: GENERIC_AUTH_MESSAGE,
  });
}

export const betterAuthClient = betterAuth({
  url: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET as string,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-in/email') return;

      const mobile = isMobileClient(ctx);

      // Anti-enumeration: normalize response timing for mobile attempts.
      if (mobile) await sleep(MOBILE_AUTH_DELAY_MS);

      if (!ctx.body || typeof ctx.body !== 'object') return;
      const body = ctx.body as Record<string, unknown>;

      const emailRaw = body.email;
      if (typeof emailRaw !== 'string') return;

      const email = emailRaw.trim().toLowerCase();
      if (!email) return;

      // Fetch minimal user data
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

      // If user doesn't exist -> let Better Auth handle invalid credentials.
      // (No extra signals; message remains generic.)
      if (!user) return;

      const roleKeys = user.roles?.map((ur) => ur.role.key) ?? [];
      const isActive = !!user.isActive;

      // Your existing rule (account must be active and have at least one role).
      const hasAnyRole = roleKeys.length > 0;

      // Mobile rule: must be DRIVER.
      const hasDriverRole = roleKeys.includes(REQUIRED_MOBILE_ROLE_KEY);

      const allowed = mobile
        ? isActive && hasDriverRole
        : isActive && hasAnyRole;

      if (!allowed) {
        // IMPORTANT: generic message => no enumeration via "inactive" / "no role" / "not driver".
        throwGenericAuth();
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
    // No session on sign-up: registration must not log the user in.
    // Mobile accounts still require manual DB activation before sign-in.
    autoSignIn: false,
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
