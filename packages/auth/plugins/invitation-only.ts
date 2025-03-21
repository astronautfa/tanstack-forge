import { db } from "@app/database";
import type { BetterAuthPlugin } from "better-auth";
import { APIError } from "better-auth/api";
import { createAuthMiddleware } from "better-auth/plugins";
import { env } from "@app/env";

const config = {
    auth: {
        enableSignup: env.ENABLE_SIGNUP === "true",
    },
};

export const invitationOnlyPlugin = () =>
    ({
        id: "invitationOnlyPlugin",
        hooks: {
            before: [
                {
                    matcher: (context) =>
                        context.path.startsWith("/sign-up/email"),
                    handler: createAuthMiddleware(async (ctx) => {
                        if (config.auth.enableSignup) {
                            return;
                        }

                        const { email } = ctx.body;

                        const hasInvitation = await db.invitation.count({
                            where: {
                                email,
                                status: "pending",
                            },
                        });

                        if (!hasInvitation) {
                            throw new APIError("BAD_REQUEST", {
                                code: "INVALID_INVITATION",
                                message: "No invitation found for this email",
                            });
                        }
                    }),
                },
            ],
        },
        $ERROR_CODES: {
            INVALID_INVITATION: "No invitation found for this email",
        },
    }) satisfies BetterAuthPlugin;