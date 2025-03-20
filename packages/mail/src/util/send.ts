import { render } from "@react-email/render";
import { mailTemplates } from "@/emails";
import { logger } from "@/logger";
import { send } from "@/provider/index";
import type { TemplateId, TemplatePropsMap } from "@/emails";

/**
 * Send an email using a template or raw content
 */
export async function sendEmail<T extends TemplateId>(
    params: {
        to: string;
    } & (
            | {
                templateId: T;
                context: TemplatePropsMap[T];
            }
            | {
                subject: string;
                text?: string;
                html?: string;
            }
        ),
) {
    const { to } = params;

    let html: string;
    let text: string;
    let subject: string;

    if ("templateId" in params) {
        const { templateId, context } = params;
        const Template = mailTemplates[templateId];

        // Type assertion using the specific template's parameter type
        // This avoids the intersection type problem
        const email = Template(context as any);

        // Generate subject based on template type
        subject = getSubjectForTemplate(templateId, context);

        // Render to HTML and plaintext
        html = await render(email);
        text = await render(email, { plainText: true });
    } else {
        subject = params.subject;
        text = params.text ?? "";
        html = params.html ?? "";
    }

    try {
        await send({
            to,
            subject,
            text,
            html,
        });
        logger.info(`Email sent to ${to} with subject "${subject}"`);
        return true;
    } catch (e) {
        logger.error("Failed to send email:", e);
        return false;
    }
}

/**
 * Generate subject line based on template type
 */
function getSubjectForTemplate<T extends TemplateId>(templateId: T, context: TemplatePropsMap[T]): string {
    switch (templateId) {
        case "emailVerification":
            return "Verify your email";
        case "forgotPassword":
            return "Reset your password";
        case "magicLink":
            return "Your magic login link";
        case "newUser":
            return `Welcome to our platform, ${(context as any).name || ''}!`;
        case "newsletterSignup":
            return "Thanks for subscribing!";
        case "organizationInvitation":
            return `You've been invited to join ${(context as any).organizationName || ''}`;
        default:
            return "New message";
    }
}