// lib/hooks/use-auth.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { authApi } from "@/lib/api/auth-api";

/**
 * Hook for login functionality
 */
export function useLogin() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: authApi.signIn,
        onSuccess: (data) => {
            // Update user data in the query cache
            queryClient.setQueryData(["user"], data.user);

            // Invalidate user query to trigger a refetch
            queryClient.invalidateQueries({ queryKey: ["user"] });

            // Redirect to dashboard
            router.navigate({ to: "/" });
        }
    });
}

/**
 * Hook for registration functionality
 */
export function useRegister() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: authApi.register,
        onSuccess: (data) => {
            // Update user data in the query cache
            queryClient.setQueryData(["user"], data.user);

            // Invalidate user query to trigger a refetch
            queryClient.invalidateQueries({ queryKey: ["user"] });

            // Redirect to dashboard
            router.navigate({ to: "/" });
        }
    });
}

/**
 * Hook for forgot password functionality
 */
export function useForgotPassword() {
    return useMutation({
        mutationFn: authApi.forgotPassword
    });
}

/**
 * Hook for reset password functionality
 */
export function useResetPassword() {
    const router = useRouter();

    return useMutation({
        mutationFn: authApi.resetPassword,
        onSuccess: () => {
            // Redirect to login page after successful password reset
            router.navigate({ to: "/" });
        }
    });
}

/**
 * Hook for sign out functionality
 */
export function useSignOut() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: authApi.signOut,
        onSuccess: () => {
            // Clear user from query cache
            queryClient.setQueryData(["user"], null);

            // Redirect to home page
            router.navigate({ to: "/" });
        }
    });
}