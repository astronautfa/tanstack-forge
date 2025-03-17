import type {
    LoginFormValues,
    RegisterFormValues,
    ForgotPasswordFormValues,
    ResetPasswordFormValues
} from "@/lib/validations/auth";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data
const MOCK_USERS = [
    {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        password: "Password123"
    }
];

/**
 * Mock authentication API service
 * This would be replaced with actual API calls in production
 */
export const authApi = {
    /**
     * Sign in with email and password
     */
    signIn: async (data: LoginFormValues) => {
        await delay(1000); // Simulate network delay

        const user = MOCK_USERS.find(u => u.email === data.email);

        if (!user) {
            throw new Error("User not found");
        }

        if (user.password !== data.password) {
            throw new Error("Invalid email or password");
        }

        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword
        };
    },

    /**
     * Register a new user
     */
    register: async (data: RegisterFormValues) => {
        await delay(1000);

        // Check if user already exists
        if (MOCK_USERS.some(u => u.email === data.email)) {
            throw new Error("User with this email already exists");
        }

        // In a real app, you would save to DB here
        const newUser = {
            id: String(MOCK_USERS.length + 1),
            name: data.name,
            email: data.email,
            password: data.password
        };

        // Add to mock users (this is just for demo, in reality would persist to DB)
        // MOCK_USERS.push(newUser);

        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        return {
            user: userWithoutPassword
        };
    },

    /**
     * Send password reset email
     */
    forgotPassword: async (data: ForgotPasswordFormValues) => {
        await delay(1000);

        // Check if user exists
        const user = MOCK_USERS.find(u => u.email === data.email);

        if (!user) {
            // For security reasons, don't reveal if user exists or not
            return { success: true };
        }

        // Would send email in real implementation
        return { success: true };
    },

    /**
     * Reset password with token
     */
    resetPassword: async (data: ResetPasswordFormValues & { token: string }) => {
        await delay(1000);

        // Validate token in real implementation
        if (data.token !== "valid-token") {
            throw new Error("Invalid or expired token");
        }

        // Would update password in DB in real implementation

        return { success: true };
    },

    /**
     * Sign out current user
     */
    signOut: async () => {
        await delay(500);
        return { success: true };
    }
};