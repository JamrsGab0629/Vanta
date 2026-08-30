// --- Inputs ---
export interface LoginInput {
  email?: string;
  password?: string;
}

export interface SignupInput {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface ResendOtpInput {
  email: string;
}

export interface UserStateInput {
  userId?: string;
}

// --- Outputs ---
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface LoginOutput {
  token: string;
  user: AuthUser;
}

export interface SignupOutput {
  message: string;
  userId: string;
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

export interface UserStateOutput {
  isAuthenticated: boolean;
  user?: AuthUser;
}
