import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(254);

const password = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be at most 128 characters long");

const nameField = z.string().trim().min(1, "Field is required").max(80);

export const registerSchema = z.object({
    username: z.string().trim().min(2, "Username must be at least 2 characters long").max(80),
    first_name: nameField,
    last_name: nameField,
    email,
    password,
}).strict();

export const loginSchema = z.object({
    email,
    password: z.string().min(1, "Password is required").max(128),
}).strict();

export const verifyOtpSchema = z.object({
    email,
    otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
}).strict();

export const resendVerificationSchema = z.object({ email }).strict();

export const formatValidationError = (error: z.ZodError) => ({
    message: "Invalid request data",
    errors: error.issues.map(({ path, message }) => ({ field: path.join("."), message })),
});