import { z } from "zod";

export const serverSchema = {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().url(),
    RESEND_API_KEY: z.string().min(1),
    MAIL_FROM: z.string().email(),
    ENABLE_SIGNUP: z.enum(["true", "false"]).default("false"),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
};

export const clientSchema = {
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
};