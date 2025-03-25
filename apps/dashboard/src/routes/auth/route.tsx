import { createFileRoute, Outlet, redirect, useMatches } from "@tanstack/react-router";
import { LoadingContainer } from "@app/ui/components/loading-container";
import { useState, useEffect } from "react";

import { createContext, useContext } from "react";

interface AuthContextType {
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
    isLoading: false,
    setIsLoading: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const Route = createFileRoute("/auth")({
    component: AuthLayout,
    beforeLoad: ({ context }) => {
        const { user } = context;

        if (user) {
            throw redirect({
                to: '/',
                replace: true,
            });
        }
    },
});

function AuthLayout() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ isLoading, setIsLoading }}>
            <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
                <div className="w-full max-w-md">
                    <LoadingContainer isLoading={isLoading} className="bg-accent rounded-lg border shadow-sm p-6">
                        <div className="flex flex-col items-center gap-2 mb-6">
                            <div
                                className="flex size-11 shrink-0 items-center justify-center rounded-full border"
                                aria-hidden="true"
                            >
                                <svg
                                    className="stroke-zinc-800 dark:stroke-zinc-100"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 32 32"
                                    aria-hidden="true"
                                >
                                    <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
                                </svg>
                            </div>
                        </div>

                        <Outlet />
                    </LoadingContainer>

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        <span>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</span>
                    </div>
                </div>
            </div>
        </AuthContext.Provider>
    );
}