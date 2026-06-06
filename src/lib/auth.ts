import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index"; // your drizzle instance
import { env } from "../config/env";
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  baseURL: env.API_URL,
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({
      user,
      url,
      token,
    }: {
      user: { name: string; email: string };
      url: string;
      token: string;
    }) => {
      const frontendResetUrl = `${env.BETTER_AUTH_URL}/auth/reset-password?token=${token}`;
      console.log(`=========================================`);
      console.log(`🔑 PASSWORD RESET REQUESTED`);
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`Click this clean frontend link to test:`);
      console.log(frontendResetUrl);
      console.log(`=========================================`);
    },
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID as string,
      clientSecret: env.clientSecret as string,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [env.BETTER_AUTH_URL],
});
