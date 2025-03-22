import { config } from "@/src/util/config";
import { logger } from "@/src/util/logger";
import type { SendEmailHandler } from "@/types";
import { env } from "@app/env";

const { from } = config.mails;

export const send: SendEmailHandler = async ({ to, subject, html }) => {
    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from,
                to,
                subject,
                html,
            }),
        });

        if (!response.ok) {
            logger.error(await response.json());
            throw new Error("Could not send email");
        }
    } catch (error) {
        logger.error("Resend provider error:", error);
        throw error;
    }
};