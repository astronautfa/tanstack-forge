import {
    adminClient,
    inferAdditionalFields,
    magicLinkClient,
    organizationClient,
    passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from ".";

type AuthClientType = ReturnType<typeof createAuthClient>;

export const authClient = createAuthClient({
    plugins: [
        inferAdditionalFields<typeof auth>(),
        magicLinkClient(),
        organizationClient(),
        adminClient(),
        passkeyClient(),
    ],
}) as AuthClientType;

export type AuthClientErrorCodes = typeof authClient.$ERROR_CODES & {
    INVALID_INVITATION: string;
};