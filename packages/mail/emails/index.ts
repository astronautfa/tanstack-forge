import { EmailVerification, type EmailVerificationProps } from "./EmailVerification";
import { ForgotPassword, type ForgotPasswordProps } from "./ForgotPassword";
import { MagicLink, type MagicLinkProps } from "./MagicLink";
import { NewUser, type NewUserProps } from "./NewUser";
import { NewsletterSignup, type NewsletterSignupProps } from "./NewsletterSignup";
import { OrganizationInvitation, type OrganizationInvitationProps } from "./OrganizationInvitation";

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