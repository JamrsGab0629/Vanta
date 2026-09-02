// --- Inputs ---
export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface ResendOtpInput {
  email: string;
}

// --- Outputs ---
export interface AuthUser {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  is_verified: boolean;
  created_at: string;
}

export interface LoginOutput {
  token: string;
  user: AuthUser;
}

export interface SignupOutput {
  message: string;
  user_id?: string;
  requiresOtp: boolean;
}

export interface VerifyOtpOutput {
  success: boolean;
  message?: string;
}

export interface ResendOtpOutput {
  success: boolean;
  message: string;
}

export interface LogoutOutput {
  success: boolean;
  message?: string;
}