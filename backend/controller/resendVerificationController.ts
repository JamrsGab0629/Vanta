import { Request, Response } from "express";
import User from "../model/userModel";
import { sendVerificationEmail } from "../service/gmail/emailService";
import { generateTimeBasedOtp } from "../utils/otpUtils";
import { formatValidationError, resendVerificationSchema } from "../validators/authValidators";

export const resendVerification = async (req: Request, res: Response) => {
    const parsed = resendVerificationSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(formatValidationError(parsed.error));
    }

    try {
        const user = await User.findOne({ where: { email: parsed.data.email } });
        
        // Return a generic response to prevent account enumeration
        if (!user || user.get("is_verified")) {
            return res.status(200).json({ 
                message: "If an unverified account exists, a code has been sent." 
            });
        }

        const userId = user.get("user_id") as string;
        const username = user.get("username") as string;

        // Generate the current active 5-minute window OTP statelessly
        const otp = generateTimeBasedOtp(userId);

        /*
        // DEV LOGGING: Print to console for local testing only (Commented out)
        if (process.env.NODE_ENV !== "production") {
            console.log(`\n======================================================`);
            console.log(`🔑 [DEV MODE] Resent OTP for ${parsed.data.email}: ${otp}`);
            console.log(`======================================================\n`);
        }
        */

        // ENABLED: Real email sending via SMTP
        await sendVerificationEmail(parsed.data.email, username, otp);

        // Standard response: NEVER expose the raw OTP in JSON payload
        return res.status(200).json({ 
            message: "If an unverified account exists, a code has been sent."
        });
        
    } catch (error) {
        console.error("RESEND VERIFICATION ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};