// src/backend/controller/registerController.ts
import { Request, Response } from "express";
import User from "../model/userModel";
import { hashPassword } from "../service/authService"; 
import { validatePassword } from "../service/validationService";
import { generateOtp } from "../service/gmail/otpService";
import { sendWelcomeEmail } from "../service/gmail/emailService";

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required"
            });
        }

        // Validate password length and rules
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.isValid) {
            return res.status(400).json({
                message: passwordCheck.error
            });
        }

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

        // Create user with unverified status and OTP fields
        const newUser = await User.create({
            username,
            email,
            password_hash,
            is_verified: false,
            otp_code: otp,
            otp_expires_at: expiresAt,
        });

       
        await sendWelcomeEmail(email, username, otp);

        return res.status(201).json({
            message: "Registration successful! Please check your email for the OTP verification code.",
            user: {
                username: newUser.get("username"),
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