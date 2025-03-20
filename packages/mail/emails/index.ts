import { EmailVerification, type EmailVerificationProps } from "@/emails/EmailVerification";
import { ForgotPassword, type ForgotPasswordProps } from "@/emails/ForgotPassword";
import { MagicLink, type MagicLinkProps } from "@/emails/MagicLink";
import { NewUser, type NewUserProps } from "@/emails/NewUser";
import { NewsletterSignup, type NewsletterSignupProps } from "@/emails/NewsletterSignup";
import { OrganizationInvitation, type OrganizationInvitationProps } from "@/emails/OrganizationInvitation";

export const mailTemplates = {
    magicLink: MagicLink,
    forgotPassword: ForgotPassword,
    newUser: NewUser,
    newsletterSignup: NewsletterSignup,
    organizationInvitation: OrganizationInvitation,
    emailVerification: EmailVerification,
} as const;

export type TemplateId = keyof typeof mailTemplates;

// Define a template props map for type safety
export interface TemplatePropsMap {
    emailVerification: EmailVerificationProps;
    forgotPassword: ForgotPasswordProps;
    magicLink: MagicLinkProps;
    newUser: NewUserProps;
    newsletterSignup: NewsletterSignupProps;
    organizationInvitation: OrganizationInvitationProps;
}