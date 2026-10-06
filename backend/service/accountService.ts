import bcrypt from "bcrypt"; // using bcryptjs? change this to: import bcrypt from "bcryptjs";
import User from "../model/userModel";
import { AppError } from "../utils/app-error";

// Use the same number you use when hashing in signup so hashes stay consistent.
const SALT_ROUNDS = 10;

export const changePassword = async (
    userId: number,
    currentPassword: string,
    newPassword: string
): Promise<void> => {
    const user: any = await User.findByPk(userId);
    if (!user) throw new AppError(404, "Account not found.");

    const matches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!matches) {
        // 400 (not 401) so the frontend doesn't treat it as an expired session.
        throw new AppError(400, "Current password is incorrect.");
    }

    user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();
};
