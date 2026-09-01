import { Request, Response } from "express";
import { findUserByEmail } from "../service/userService";
import { formatValidationError, verifyOtpSchema } from "../validators/authValidators";
import { generateTimeBasedOtp } from "../utils/otpUtils";

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const parsed = verifyOtpSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json(formatValidationError(parsed.error));
        }

        const { email, otp } = parsed.data;

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.get("is_verified")) {
            return res.status(400).json({ message: "Account is already verified" });
        }

        const userId = user.get("user_id") as string;

        // 1. Generate expected OTP for current 5-minute window
        const currentOtp = generateTimeBasedOtp(userId, 0);

        // 2. Generate expected OTP for previous 5-minute window (handles edge-case latency)
        const previousOtp = generateTimeBasedOtp(userId, -1);

        // 3. Verify if submitted OTP matches either active window
        if (otp !== currentOtp && otp !== previousOtp) {
            return res.status(400).json({ message: "Invalid or expired OTP code." });
        }

        // Update database verification status
        await user.update({
            is_verified: true,
        });

        return res.status(200).json({ message: "Email verified successfully! You can now log in." });

    } catch (error) {
        console.error("VERIFY OTP ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};