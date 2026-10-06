import { AppError } from "../utils/app-error";

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}

// Passwords are intentionally NOT trimmed: spaces are valid characters.
export const parseChangePassword = (body: any): ChangePasswordInput => {
    const currentPassword = body?.currentPassword;
    const newPassword = body?.newPassword;

    if (typeof currentPassword !== "string" || currentPassword.length === 0) {
        throw new AppError(400, "Current password is required.");
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
        throw new AppError(400, "New password must be at least 8 characters.");
    }
    // bcrypt only uses the first 72 bytes, so longer passwords would be silently cut.
    if (Buffer.byteLength(newPassword, "utf8") > 72) {
        throw new AppError(400, "New password is too long (72 characters max).");
    }
    if (newPassword === currentPassword) {
        throw new AppError(400, "New password must be different from your current password.");
    }

    return { currentPassword, newPassword };
};
