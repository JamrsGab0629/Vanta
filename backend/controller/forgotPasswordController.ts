import { Request, Response } from 'express';
import { hashPassword } from '../service/authService';
import { findUserByEmail } from '../service/userService';
import { generateTimeBasedOtp } from '../utils/otpUtils';
import { sendVerificationEmail } from '../service/gmail/emailService';
import crypto from 'crypto';
// Optional: replace with your actual mailer utility (e.g. nodemailer / Resend)
// import { sendOtpEmail } from '../utils/mailUtils';

/**
 * STEP 1: Request Password Reset
 * Finds the user by email, generates a time-based OTP, and emails it.
 */

const isOtpValid = (inputOtp: string, userId: string): boolean => {
  const currentOtp = generateTimeBasedOtp(userId, 0, 5);
  const prevOtp = generateTimeBasedOtp(userId, -1, 5);

  const bufInput = Buffer.from(inputOtp);
  const bufCurrent = Buffer.from(currentOtp);
  const bufPrev = Buffer.from(prevOtp);

  const matchCurrent =
    bufInput.length === bufCurrent.length && crypto.timingSafeEqual(bufInput, bufCurrent);
  const matchPrev = bufInput.length === bufPrev.length && crypto.timingSafeEqual(bufInput, bufPrev);

  return matchCurrent || matchPrev;
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(cleanEmail);

    // Always return success to prevent email enumeration/harvesting attacks
    if (!user || !(user.getDataValue('is_verified') as boolean)) {
      res.status(200).json({
        message: 'If an account with that email exists, an OTP code has been sent.',
      });
      return;
    }

    // Generate current 5-minute window OTP based on user ID
    const otp = generateTimeBasedOtp(user.getDataValue('user_id') as string);
    // await sendVerificationEmail(email, user.getDataValue('username'), otp);
    console.log(otp);

    res.status(200).json({
      message: 'If an account with that email exists, an OTP code has been sent.',
    });
  } catch (error: any) {
    console.error('requestPasswordReset error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * STEP 2: Verify Password Reset OTP
 * Checks input OTP against current (0) and previous (-1) 5-minute windows.
 */
export const verifyPasswordResetOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP code are required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(cleanEmail);

    if (!user || !(user.getDataValue('is_verified') as boolean)) {
      res.status(400).json({ message: 'Invalid code or email.' });
      return;
    }

    const userId = user.getDataValue('user_id') as string;

    if (!isOtpValid(String(otp), userId)) {
      res.status(400).json({ message: 'Invalid or expired OTP code.' });
      return;
    }

    res.status(200).json({
      message: 'OTP verified successfully.',
      verified: true,
    });
  } catch (error: any) {
    console.error('verifyPasswordResetOtp error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * STEP 3: Reset Password
 * Re-verifies the OTP, hashes the new password, and saves the updated user document.
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({ message: 'Email, OTP, and new password are required.' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters long.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(cleanEmail);

    if (!user || !(user.getDataValue('is_verified') as boolean)) {
      res.status(400).json({ message: 'Invalid code or email.' });
      return;
    }

    const userId = user.getDataValue('user_id') as string;

    if (!isOtpValid(String(otp), userId)) {
      res.status(400).json({ message: 'Invalid or expired OTP code.' });
      return;
    }

    const updatedPassword = await hashPassword(newPassword);
    await user.update({ password_hash: updatedPassword });

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error: any) {
    console.error('resetPassword error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
