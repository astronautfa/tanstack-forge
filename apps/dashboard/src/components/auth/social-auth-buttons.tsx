import { type ComponentProps } from "react";
import { Button } from "@app/ui/components/button";
import { cn } from "@app/ui/lib/utils";

export type SocialProvider = "discord" | "google" | "github";

interface SocialAuthButtonProps extends ComponentProps<typeof Button> {
    provider: SocialProvider;
    label: string;
}

function SocialAuthButton({
    provider,
    label,
    className,
    ...props
}: SocialAuthButtonProps) {
    // TODO: Replace with actual auth implementation
    const handleAuth = async () => {
        console.log(`Sign in with ${provider}`);
        // In the real implementation, this would call your auth service
    };

    return (
        <Button
            onClick={handleAuth}
            type="button"
            variant="outline"
            size="lg"
            className={cn(className)}
            {...props}
        >
            {props.children || `Sign in with ${label}`}
        </Button>
    );
}

interface SocialAuthButtonsProps {
    type: "signin" | "signup";
}

export function SocialAuthButtons({ type }: SocialAuthButtonsProps) {
    const actionText = type === "signin" ? "Sign in" : "Sign up";

    return (
        <div className="space-y-2">
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                </span>
            </div>

            <div className="flex flex-col gap-2">
                <SocialAuthButton
                    provider="discord"
                    label="Discord"
                    className="bg-[#5865F2] hover:bg-[#5865F2]/80 text-white hover:text-white"
                >
                    {actionText} with Discord
                </SocialAuthButton>

                <SocialAuthButton
                    provider="github"
                    label="GitHub"
                    className="bg-neutral-700 hover:bg-neutral-700/80 text-white hover:text-white"
                >
                    {actionText} with GitHub
                </SocialAuthButton>

                <SocialAuthButton
                    provider="google"
                    label="Google"
                    className="bg-[#DB4437] hover:bg-[#DB4437]/80 text-white hover:text-white"
                >
                    {actionText} with Google
                </SocialAuthButton>
            </div>
        </div>
    );
}