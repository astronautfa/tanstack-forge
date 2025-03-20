import { Link, Text } from "@react-email/components";
import PrimaryButton from "@/emails/components/PrimaryButton";
import Wrapper from "@/emails/components/Wrapper";

export interface ForgotPasswordProps {
    url: string;
}

export function ForgotPassword({
    url,
}: ForgotPasswordProps) {
    return (
        <Wrapper>
            <Text>You requested a password reset. Click the button below to create a new password.</Text>

            <PrimaryButton href={url}>
                Reset Password &rarr;
            </PrimaryButton>

            <Text className="text-muted-foreground text-sm">
                If the button doesn't work, copy and paste this link in your browser:
                <Link href={url}>{url}</Link>
            </Text>
        </Wrapper>
    );
}

export default ForgotPassword;