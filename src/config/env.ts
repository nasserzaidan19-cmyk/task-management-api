import "dotenv/config";
import { z } from "zod";

const evnSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default(3000),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET:z.string(),
  BETTER_AUTH_URL:z.string().url()
});
export const env = evnSchema.parse(process.env);
