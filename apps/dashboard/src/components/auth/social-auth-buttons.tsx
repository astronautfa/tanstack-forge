import { type ComponentProps } from "react";
import { Button } from "@app/ui/components/button";
import { cn } from "@app/ui/lib/utils";
import { authClient } from "@app/auth/client";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@app/ui/components/tooltip";
import { Icons } from "@app/ui/icons"
import { Badge } from "@app/ui/components/badge";
import { useStorage } from "@/lib/hooks/use-storage";
import { useAuth } from "@/routes/auth/route";

export type SocialProvider = "google" | "github";

const LAST_LOGIN_METHOD_KEY = "last_login_method";

interface SocialAuthButtonProps extends ComponentProps<typeof Button> {
    provider: SocialProvider;
    label: string;
    isLastUsed?: boolean;
    onAuth: (provider: SocialProvider) => Promise<void>;
}

const getIcon = (provider: SocialProvider) => {
    switch (provider) {
        case "github":
            return <Icons.github size='sm' className="mr-2" />;
        case "google":
            return <Icons.google size='sm' className="mr-2" />;
        default:
            return null;
    }
};

function SocialAuthButton({
    provider,
    label,
    isLastUsed = false,
    className,
    onAuth,
    ...props
}: SocialAuthButtonProps) {
    const { isLoading } = useAuth();

    const handleAuth = async () => {
        if (isLoading) return;
        await onAuth(provider);
    };

    const buttonContent = (
        <div className="flex items-center justify-center w-full">
            {getIcon(provider)}
            <span>{props.children || `Sign in with ${label}`}</span>

            {isLastUsed && (
                <Badge
                    variant="secondary"
                    className="ml-2 md:hidden text-xs py-[4px] px-1.5 bg-primary/70 text-primary-foreground border border-primary"
                >
                    Previously used
                </Badge>
            )}
        </div>
    );

    if (isLastUsed) {
        return (
            <TooltipProvider delayDuration={0}>
                <Tooltip open={!isLoading}>
                    <TooltipTrigger asChild>
                        <Button
                            variant={isLastUsed ? 'default' : 'outline'}
                            onClick={handleAuth}
                            disabled={isLoading}
                            className={cn(
                                "flex w-full relative",
                                isLastUsed && "bg-primary/10 text-primary border-primary hover:bg-primary/20 hover:text-primary",
                                className
                            )}
                            {...props}
                        >
                            {buttonContent}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5} className="hidden md:block">
                        <p className="text-sm">Previously used</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <Button
            variant="outline"
            onClick={handleAuth}
            disabled={isLoading}
            className={cn("flex w-full relative", className)}
            {...props}
        >
            {buttonContent}
        </Button>
    );
}

interface SocialAuthButtonsProps {
    type: "signin" | "signup";
}

export function SocialAuthButtons({ type }: SocialAuthButtonsProps) {
    const actionText = type === "signin" ? "Sign in" : "Sign up";

    const { setIsLoading } = useAuth();


    const [lastLoginMethod, setLastLoginMethod, _, storageError] = useStorage<SocialProvider | null>(
        LAST_LOGIN_METHOD_KEY,
        null
    );

    if (storageError) {
        console.error("Error accessing login method storage:", storageError);
    }

    const handleAuth = async (provider: SocialProvider) => {
        try {
            const callbackURL = new URL('/', window.location.origin);
            setIsLoading(true)
            const { error } = await authClient.signIn.social({
                provider,
                callbackURL: callbackURL.toString(),
            }, {
                onSuccess: () => {
                    setLastLoginMethod(provider);
                },
                onError: () => {
                    setIsLoading(false)
                    throw error
                },
            });

        } catch (error) {
            setIsLoading(false)
            console.error("Social auth error:", error);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-col gap-2">
                <SocialAuthButton
                    provider="github"
                    label="GitHub"
                    isLastUsed={lastLoginMethod === "github"}
                    className={lastLoginMethod === "github" ? "order-first" : ""}
                    onAuth={handleAuth}
                >
                    {actionText} with GitHub
                </SocialAuthButton>

                <SocialAuthButton
                    provider="google"
                    label="Google"
                    isLastUsed={lastLoginMethod === "google"}
                    className={lastLoginMethod === "google" ? "order-first" : ""}
                    onAuth={handleAuth}
                >
                    {actionText} with Google
                </SocialAuthButton>
            </div>
        </div>
    );
}