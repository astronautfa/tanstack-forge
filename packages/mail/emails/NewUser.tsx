import { Link, Text } from "@react-email/components";
import PrimaryButton from "@/emails/components/PrimaryButton";
import Wrapper from "@/emails/components/Wrapper";

export interface NewUserProps {
    url: string;
    name: string;
    otp: string;
}

export function NewUser({
    url,
    name,
    otp,
}: NewUserProps) {
    return (
        <Wrapper>
            <Text>Welcome {name}! We're excited to have you on board.</Text>

            <Text>
                Your one-time password:
                <br />
                <strong className="font-bold text-2xl">{otp}</strong>
            </Text>

            <Text>Or use the link below:</Text>

            <PrimaryButton href={url}>
                Confirm Email &rarr;
            </PrimaryButton>

            <Text className="text-muted-foreground text-sm">
                If the button doesn't work, copy and paste this link in your browser:
                <Link href={url}>{url}</Link>
            </Text>
        </Wrapper>
    );
}

export default NewUser;