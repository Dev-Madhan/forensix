import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";

const appURL =
  env.BETTER_AUTH_URL ||
  env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

export const auth = betterAuth({
  // Core config — Better Auth reads BETTER_AUTH_SECRET / BETTER_AUTH_URL from
  // env automatically, but we provide them explicitly to ensure they're always
  // present and to avoid any edge-case where the env hasn't been injected yet.
  secret: env.BETTER_AUTH_SECRET,
  baseURL: appURL,

  // Trusted origins for CSRF protection.
  // Include both localhost (dev) and the Vercel production domain.
  trustedOrigins: [
    "http://localhost:3000",
    "https://forensix-sketch.vercel.app",
  ],

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },

  // Only add truly custom application fields here.
  // Do NOT add 'passwordHash' or 'password' — Better Auth manages those
  // internally via the Account model. Adding them here causes a conflict
  // that produces the internal_server_error during OAuth callbacks.
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "INVESTIGATOR",
      },
      badgeId: {
        type: "string",
        required: false,
      },
      avatarUrl: {
        type: "string",
        required: false,
      },
      provider: {
        type: "string",
        required: false,
        defaultValue: "email",
      },
    },
  },
});

