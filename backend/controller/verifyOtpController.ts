import { Request, Response } from "express";
import { findUserByEmail } from "../service/userService";
import { formatValidationError, verifyOtpSchema } from "../validators/authValidators";

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const parsed = verifyOtpSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json(formatValidationError(parsed.error));

        const { email, otp } = parsed.data;

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

      
        if (user.get("is_verified")) {
            return res.status(400).json({ message: "Account is already verified" });
        }

      
        if (user.get("otp_code") !== otp) {
            return res.status(400).json({ message: "Invalid OTP code" });
        }

        const expiresAt = new Date(user.get("otp_expires_at") as string);
        if (Date.now() > expiresAt.getTime()) {
            return res.status(400).json({ message: "OTP code has expired. Please request a new one." });
        }

        await user.update({
            is_verified: true,
            otp_code: null,
            otp_expires_at: null,
        });

        return res.status(200).json({ message: "Email verified successfully! You can now log in." });

    } catch (error) {
        console.error("VERIFY OTP ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
