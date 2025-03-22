import { env } from "@app/env";

export const config = {
    mails: {
        from: env.MAIL_FROM || 'noreply@example.com',
    }
};