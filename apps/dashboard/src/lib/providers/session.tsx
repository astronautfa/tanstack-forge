"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authClient } from "@app/auth/client";

export interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null;
    onboardingComplete?: boolean | null;
    banned: boolean;
    role?: string | null;
    metadata?: Record<string, any> | null;
    preferences?: Record<string, any> | null;
    banExpires?: Date | null;
}

interface SessionContextType {
    user: User | null;
    session: any | null;
    loaded: boolean;
    reloadSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
    user: null,
    session: null,
    loaded: false,
    reloadSession: async () => { },
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<any | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loaded, setLoaded] = useState(false);

    const loadSession = async () => {
        try {
            const { data, error } = await authClient.getSession();

            if (error) {
                console.error("Failed to fetch session:", error);
                setUser(null);
                setSession(null);
            } else if (data) {
                const userData = data.user as User;

                if (userData) {
                    if (userData.banned === undefined) {
                        userData.banned = false;
                    }
                }

                setUser(userData);
                setSession(data.session);
            }

            setLoaded(true);
        } catch (error) {
            console.error("Error fetching session:", error);
            setLoaded(true);
        }
    };

    useEffect(() => {
        loadSession();
    }, []);

    const reloadSession = async () => {
        await loadSession();
    };

    return (
        <SessionContext.Provider
            value={{
                user,
                session,
                loaded,
                reloadSession,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);

    if (context === undefined) {
        throw new Error("useSession must be used within a SessionProvider");
    }

    return context;
}