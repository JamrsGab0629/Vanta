import crypto from "crypto";

const SYSTEM_SALT = process.env.OTP_SECRET || "your-system-secret-key";

/**
 * Generates a stateless 6-digit TOTP code based on user ID and moving time steps.
 * @param windowOffset - 0 for current window, -1 for previous window (grace period)
 * @param windowMinutes - Expiration time block (default: 5 minutes)
 */
export const generateTimeBasedOtp = (
  uuid: string, 
  windowOffset = 0, 
  windowMinutes = 5
): string => {
  const currentStep = Math.floor(Date.now() / (windowMinutes * 60 * 1000));
  const targetStep = currentStep + windowOffset;
  
  const payload = `${uuid}:${targetStep}`;
  const hash = crypto.createHmac("sha256", SYSTEM_SALT).update(payload).digest("hex");

  // Dynamic truncation to extract a secure 6-digit number
  const offset = parseInt(hash.slice(-1), 16);
  const binary = (parseInt(hash.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff);
  
  return (binary % 1000000).toString().padStart(6, "0");
};