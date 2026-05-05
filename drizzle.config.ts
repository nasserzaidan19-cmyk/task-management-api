import { Config } from "drizzle-kit";
import { env } from "./src/config/env";

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL as string,
  },
  verbose: true,
  strict: true,
} satisfies Config;
