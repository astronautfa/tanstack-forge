import { Heading, Link, Text } from "@react-email/components";
import PrimaryButton from "@/emails/components/PrimaryButton";
import Wrapper from "@/emails/components/Wrapper";

export interface OrganizationInvitationProps {
    url: string;
    organizationName: string;
}

export function OrganizationInvitation({
    url,
    organizationName,
}: OrganizationInvitationProps) {
    return (
        <Wrapper>
            <Heading className="text-xl">
                You've been invited to join <strong>{organizationName}</strong>
            </Heading>
            <Text>
                You have been invited to join {organizationName}. Click the button below to accept the invitation.
            </Text>

            <PrimaryButton href={url}>
                Join Organization
            </PrimaryButton>

            <Text className="mt-4 text-muted-foreground text-sm">
                If the button doesn't work, copy and paste this link in your browser:
                <Link href={url}>{url}</Link>
            </Text>
        </Wrapper>
    );
}

export default OrganizationInvitation;