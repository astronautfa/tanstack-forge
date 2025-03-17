import { z } from "zod";

// Base email schema for reuse
const emailSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email is required" })
        .email({ message: "Must be a valid email address" }),
});

// Password validation with common requirements
const passwordSchema = z.object({
    password: z
        .string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});

// Login schema combines email and password
export const loginSchema = emailSchema.extend({
    ...passwordSchema.shape,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Registration schema adds name and password confirmation
export const registerSchema = emailSchema.extend({
    name: z.string().min(1, { message: "Name is required" }),
    ...passwordSchema.shape,
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// Forgot password just needs an email
export const forgotPasswordSchema = emailSchema;

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Reset password needs a new password and confirmation
export const resetPasswordSchema = passwordSchema.extend({
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;