import {
    Body,
    Container,
    Font,
    Head,
    Html,
    Preview,
    Section,
} from "@react-email/components";
import { type PropsWithChildren } from "react";

interface WrapperProps extends PropsWithChildren {
    preview?: string | string[];
}

const main = {
    backgroundColor: '#fafafe',
    fontFamily: 'Inter, system-ui, sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '40px 20px',
    maxWidth: '600px',
};

export default function Wrapper({ children, preview }: WrapperProps) {
    return (
        <Html lang="en">
            <Head>
                <Font
                    fontFamily="Inter"
                    fallbackFontFamily="Arial"
                    webFont={{
                        url: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
                        format: 'woff2',
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Preview>{preview || 'Elevio Email'}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        padding: '24px',
                        color: '#292b35',
                    }}>
                        {children}
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}