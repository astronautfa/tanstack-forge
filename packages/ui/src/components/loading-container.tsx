'use client';

import { BorderTrail } from "@app/ui/components/border-trail";
import { cn } from "@app/ui/lib/utils";

interface LoadingContainerProps {
    children: React.ReactNode;
    isLoading?: boolean;
    className?: string;
}

export function LoadingContainer({
    children,
    isLoading = false,
    className,
}: LoadingContainerProps) {
    return (
        <div className={cn("relative rounded-lg", className)}>
            {isLoading && (
                <BorderTrail
                    size={100}
                    color="bg-primary"
                    style={{
                        boxShadow: "0px 0px 15px 5px rgb(var(--primary) / 15%)"
                    }}
                />
            )}
            {children}
        </div>
    );
}