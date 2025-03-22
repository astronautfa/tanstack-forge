import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { serverSchema, clientSchema } from "./schema";

export const env = createEnv({
    server: serverSchema,
    client: clientSchema,
    clientPrefix: "NEXT_PUBLIC_",
    runtimeEnv: process.env,
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});

// For edge runtime (if needed)
export const edgeEnv = createEnv({
    server: {
        DATABASE_URL: z.string().url(),
    },
    runtimeEnv: process.env,
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});