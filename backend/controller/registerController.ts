import { Request, Response } from "express";
import User from "../model/userModel";
import { hashPassword } from "../service/authService"; 
import { formatValidationError, registerSchema } from "../validators/authValidators";
import { generateOtp } from "../service/gmail/otpService";
import { sendVerificationEmail } from "../service/gmail/emailService";

export const register = async (req: Request, res: Response) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json(formatValidationError(parsed.error));

        // Added first_name and last_name here
        const { username, first_name, last_name, email, password } = parsed.data;

        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email is already registered"
            });
        }

        // Generate OTP and expiration time (10 mins)
        const { otp, expiresAt } = generateOtp();
        const password_hash = await hashPassword(password);

        // Create user with first_name and last_name included
        const newUser = await User.create({
            username,
            first_name,
            last_name,
            email,
            password_hash,
            is_verified: false,
            otp_code: otp,
            otp_expires_at: expiresAt,
        });

        // Log OTP to terminal for dev / testing without needing SMTP configured
        console.log(`\n======================================================`);
        console.log(`🔑 [DEV MODE] Registration OTP for ${email}: ${otp}`);
        console.log(`======================================================\n`);

        /*
        // UNCOMMENT BELOW TO ENABLE REAL EMAIL SENDING VIA SMTP:
        try {
            await sendVerificationEmail(email, username, otp);
        } catch (emailError) {
            console.error("REGISTRATION EMAIL ERROR:", emailError);
            return res.status(502).json({
                message: "Unable to send verification email. Use /api/auth/resend-verification to try again.",
            });
        }
        */

        return res.status(201).json({
            message: "Registration successful! Please verify using the OTP code.",
            otp, // Returned for fast dev/testing without email setup
            user: {
                username: newUser.get("username"),
                first_name: newUser.get("first_name"),
                last_name: newUser.get("last_name"),
                email: newUser.get("email"),
            }
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({
            message: "Server error"
        });
    }
};