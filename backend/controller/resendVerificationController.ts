import { Request, Response } from "express";
import User from "../model/userModel";
import { sendVerificationEmail } from "../service/gmail/emailService";
import { generateOtp } from "../service/gmail/otpService";
import { formatValidationError, resendVerificationSchema } from "../validators/authValidators";

export const resendVerification = async (req: Request, res: Response) => {
    const parsed = resendVerificationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(formatValidationError(parsed.error));

    try {
        const user = await User.findOne({ where: { email: parsed.data.email } });
        if (!user || user.get("is_verified")) {
            return res.status(200).json({ message: "If an unverified account exists, a code has been sent." });
        }

        const { otp, expiresAt } = generateOtp();
        await user.update({ otp_code: otp, otp_expires_at: expiresAt });

        // Log OTP to terminal for dev / testing without needing SMTP configured
        console.log(`\n======================================================`);
        console.log(`🔑 [DEV MODE] Resent OTP for ${parsed.data.email}: ${otp}`);
        console.log(`======================================================\n`);

        /*
        // UNCOMMENT BELOW TO ENABLE REAL EMAIL SENDING VIA SMTP:
        await sendVerificationEmail(parsed.data.email, user.get("username") as string, otp);
        */

        return res.status(200).json({ 
            message: "If an unverified account exists, a code has been sent.",
            otp // Returned for dev testing without email setup
        });
    } catch (error) {
        console.error("RESEND VERIFICATION ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
