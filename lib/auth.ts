import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { dash } from "@better-auth/infra";
import { username } from "better-auth/plugins";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            // TODO: Integrate your email sending service here
            console.log(`Password reset link for ${user.email}: ${url}`);
        },
    },
    plugins: [
        dash(),
        username()
    ]
});
