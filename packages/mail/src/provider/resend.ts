import { env } from "@app/env";
import { config } from "../util/config";
import { logger } from "../util/logger";
import type { SendEmailHandler } from "../../types";

const { from } = config.mails;

export const send: SendEmailHandler = async ({ to, subject, html }) => {
    if (!env.RESEND_API_KEY) {
        logger.error("Resend API key is missing. Please set the RESEND_API_KEY environment variable.");
        throw new Error("Resend API key is missing");
    }
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
        logger.info(`Email successfully sent to ${to}. ${response.json}`);
    } catch (error) {
        logger.error("Resend provider error:", error);
        throw error;
    }
};