import { Heading, Text } from "@react-email/components";
import Wrapper from "./components/Wrapper";

export interface NewsletterSignupProps {
}

export function NewsletterSignup({ }: NewsletterSignupProps) {
    return (
        <Wrapper>
            <Heading className="text-xl">
                Thanks for subscribing!
            </Heading>
            <Text>Thank you for subscribing to our newsletter. You'll receive updates from us soon.</Text>
        </Wrapper>
    );
}

export default NewsletterSignup;