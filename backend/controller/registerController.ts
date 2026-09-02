import { Request, Response } from 'express';
import User from '../model/userModel';
import Cart from '../model/cartModel';
import { hashPassword } from '../service/authService';
import { formatValidationError, registerSchema } from '../validators/authValidators';
import { generateTimeBasedOtp } from '../utils/otpUtils';
import { sendVerificationEmail } from '../service/gmail/emailService';

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatValidationError(parsed.error));
    }

    const { username, first_name, last_name, email, password } = parsed.data;

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser && existingUser.get('is_verified')) {
      return res.status(400).json({
        message: 'Email is already registered',
      });
    }

    const password_hash = await hashPassword(password);
    let user;

    // Reuse existing unverified account or create a new user
    if (existingUser) {
      user = await existingUser.update({
        username,
        first_name,
        last_name,
        password_hash,
      });
    } else {
      user = await User.create({
        username,
        first_name,
        last_name,
        email,
        password_hash,
      });

      await Cart.create({
        user_id: user.get('user_id') as number,
      })
    }

    const userId = user.get('user_id') as string;
    const otp = generateTimeBasedOtp(userId);

    // DEV LOGGING: Print to console for local testing only
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n======================================================`);
      console.log(`🔑 [DEV MODE] Initial Registration OTP for ${email}: ${otp}`);
      console.log(`======================================================\n`);
    }

    /*
    // UNCOMMENT BELOW TO ENABLE REAL EMAIL SENDING VIA SMTP:
    try {
      await sendVerificationEmail(email, username, otp);
    } catch (emailError) {
      console.error("REGISTRATION EMAIL ERROR:", emailError);
      return res.status(502).json({
        message: "Account created, but unable to send verification email. Use /api/auth/resend-verification to try again.",
      });
    }
    */

    return res.status(201).json({
      message: 'Registration successful! Please verify using the OTP code.',
      user: {
        username: user.get('username'),
        first_name: user.get('first_name'),
        last_name: user.get('last_name'),
        email: user.get('email'),
      },
      requiresOtp: !user.get('is_verified'),
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};