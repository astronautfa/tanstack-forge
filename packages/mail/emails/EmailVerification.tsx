import { Link, Text } from "@react-email/components";
import PrimaryButton from "@/components/PrimaryButton";
import Wrapper from "@/components/Wrapper";

export interface EmailVerificationProps {
    url: string;
    name: string;
}

export function EmailVerification({
    url,
    name,
}: EmailVerificationProps) {
    return (
        <Wrapper>
            <Text>Hello {name}, please verify your email address to get started.</Text>

            <PrimaryButton href={url}>
                Confirm Email &rarr;
            </PrimaryButton>

            <Text className="text-muted-foreground text-sm">
                If the button doesn't work, copy and paste this link in your browser:
                <Link href={url} className="break-all">
                    {url}
                </Link>
            </Text>
        </Wrapper>
    );
}

export default EmailVerification;