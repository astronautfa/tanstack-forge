import { Link, Text } from "@react-email/components";
import PrimaryButton from "@/emails/components/PrimaryButton";
import Wrapper from "@/emails/components/Wrapper";

export interface MagicLinkProps {
    url: string;
}

export function MagicLink({
    url,
}: MagicLinkProps) {
    return (
        <Wrapper>
            <Text>Click the button below to sign in to your account.</Text>

            <Text>Use the link below to sign in:</Text>

            <PrimaryButton href={url}>
                Sign In &rarr;
            </PrimaryButton>

            <Text className="text-muted-foreground text-sm">
                If the button doesn't work, copy and paste this link in your browser:
                <Link href={url}>{url}</Link>
            </Text>
        </Wrapper>
    );
}

export default MagicLink;