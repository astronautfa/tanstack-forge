import { db } from "@app/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
    admin,
    createAuthMiddleware,
    magicLink,
    openAPI,
    organization,
    username,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { updateSeatsInOrganization } from "./lib/organization";
import { getUserByEmail } from "./lib/user";
import { invitationOnlyPlugin } from "./plugins/invitation-only";
import { env } from "@app/env";
import { sendEmail } from "@app/mail";

const config = {
    auth: {
        sessionCookieMaxAge: 30 * 24 * 60 * 60,
        enableSignup: env.ENABLE_SIGNUP === "true",
    },
};

const getBaseUrl = () => {
    if (env.NEXT_PUBLIC_SITE_URL) {
        return env.NEXT_PUBLIC_SITE_URL;
    }
    // if (env.NEXT_PUBLIC_VERCEL_URL) {
    //     return `https://${env.NEXT_PUBLIC_VERCEL_URL}`;
    // }
    return `http://localhost:3000`;
};

const appUrl = getBaseUrl();

export const auth: any = betterAuth({
    baseURL: appUrl,
    trustedOrigins: [appUrl],
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
    session: {
        expiresIn: config.auth.sessionCookieMaxAge,
        freshAge: 0,
        cookie: {
            name: 'auth_session',
            maxAge: config.auth.sessionCookieMaxAge,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
        },
        strategy: process.env.NODE_ENV === 'development' ? 'cookie' : 'refresh_token',
        recreateOnAuthentication: false,
    },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google", "github"],
        },
    },
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            if (ctx.path.startsWith("/organization/accept-invitation")) {
                const { invitationId } = ctx.body;

                if (!invitationId) {
                    return;
                }

                const invitation = await db.invitation.findUnique({
                    where: { id: invitationId },
                });

                if (!invitation) {
                    return;
                }

                await updateSeatsInOrganization(
                    invitation.organizationId,
                );
            } else if (ctx.path.startsWith("/organization/remove-member")) {
                const { organizationId } = ctx.body;

                if (!organizationId) {
                    return;
                }

                await updateSeatsInOrganization(organizationId);
            }
        }),
    },
    user: {
        additionalFields: {
            onboardingComplete: {
                type: "boolean",
                required: false,
            },
        },
        deleteUser: {
            enabled: true,
        },
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: async (
                { user: { email, name }, url },
            ) => {
                await sendEmail({
                    to: email,
                    templateId: "emailVerification",
                    context: {
                        url,
                        name,
                    },
                });
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        // If signup is disabled, the only way to sign up is via an invitation
        autoSignIn: !config.auth.enableSignup,
        requireEmailVerification: config.auth.enableSignup,
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                templateId: "forgotPassword",
                context: {
                    url,
                    name: user.name,
                },
            });
        },
    },
    emailVerification: {
        sendOnSignUp: config.auth.enableSignup,
        sendVerificationEmail: async (
            { user: { email, name }, url },
        ) => {
            await sendEmail({
                to: email,
                templateId: "emailVerification",
                context: {
                    url,
                    name,
                },
            });
        },
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
            scope: ["email", "profile"],
        },
        github: {
            clientId: env.GITHUB_CLIENT_ID as string,
            clientSecret: env.GITHUB_CLIENT_SECRET as string,
            scope: ["user:email"],
        },
    },
    plugins: [
        username(),
        admin(),
        passkey(),
        magicLink({
            disableSignUp: true,
            sendMagicLink: async ({ email, url }) => {
                await sendEmail({
                    to: email,
                    templateId: "magicLink",
                    context: {
                        url,
                    },
                });
            },
        }),
        organization({
            sendInvitationEmail: async (
                { email, id, organization },
            ) => {
                const existingUser = await getUserByEmail(email);

                const url = new URL(
                    existingUser ? "/auth/login" : "/auth/signup",
                    getBaseUrl(),
                );

                url.searchParams.set("invitationId", id);
                url.searchParams.set("email", email);

                await sendEmail({
                    to: email,
                    templateId: "organizationInvitation",
                    context: {
                        organizationName: organization.name,
                        url: url.toString(),
                    },
                });
            },
        }),
        openAPI(),
        invitationOnlyPlugin(),
    ],
    onAPIError: {
        onError(error, ctx) {
            console.error("API Error:", error, { ctx });
        },
    },
});

export * from "./lib/organization";

export type Session = typeof auth.$Infer.Session;

export type ActiveOrganization = typeof auth.$Infer.ActiveOrganization;

export type Organization = typeof auth.$Infer.Organization;

export type OrganizationMemberRole = typeof auth.$Infer.Member.role;

export type OrganizationInvitationStatus = typeof auth.$Infer.Invitation.status;

export type OrganizationMetadata = Record<string, unknown> | undefined;