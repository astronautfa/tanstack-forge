import { Button } from '@react-email/components';

const buttonStyle = {
    backgroundColor: '#292b35',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '500',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'inline-block',
    padding: '12px 24px',
    marginTop: '16px',
    marginBottom: '16px',
} as const;

export default function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Button href={href} style={buttonStyle}>
            {children}
        </Button>
    );
}
