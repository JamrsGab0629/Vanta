import { Injectable, inject } from '@angular/core';
import { CoreService } from '../core.service'; 
import {
  LoginInput,
  LoginOutput,
  LogoutOutput,
  SignupInput,
  SignupOutput,
  VerifyOtpInput,
  VerifyOtpOutput,
  ResendOtpInput,
  ResendOtpOutput,
  AuthStatus,
  FetchUserDataOutput,
} from './auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private core = inject(CoreService);
  private baseUrl = '/api/auth';

  /**
   * POST /api/auth/login
   */
  async login(input: LoginInput): Promise<LoginOutput> {
    return this.core.fetcher<LoginOutput>(
      `${this.baseUrl}/login`,
      'POST',
      input
    );
  }

  /**
   * POST /api/auth/logout
   */
  async logout(payload?: Record<string, any>): Promise<LogoutOutput> {
    return this.core.fetcher<LogoutOutput>(
      `${this.baseUrl}/logout`,
      'POST',
      payload
    );
  }

  /**
   * POST /api/auth/register
   */
  async signup(input: SignupInput): Promise<SignupOutput> {
    return this.core.fetcher<SignupOutput>(
      `${this.baseUrl}/register`,
      'POST',
      input
    );
  }

  /**
   * POST /api/auth/verify-otp
   */
  async verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpOutput> {
    return this.core.fetcher<VerifyOtpOutput>(
      `${this.baseUrl}/verify-otp`,
      'POST',
      input
    );
  }

  /**
   * POST /api/auth/resend-verification
   */
  async resendOtp(input: ResendOtpInput): Promise<ResendOtpOutput> {
    return this.core.fetcher<ResendOtpOutput>(
      `${this.baseUrl}/resend-verification`,
      'POST',
      input
    );
  }

  /**
   * POST /api/auth/verify-auth
   */
  async verifyAuth(input: Record<string, any> = {}): Promise<AuthStatus> {
    return this.core.fetcher<AuthStatus>(
      `${this.baseUrl}/verify-auth`,
      'POST',
      input
    );
  }

  /**
   * POST /api/auth/fetch-user-data
   */
  async fetchUserData(input: Record<string, any> = {}): Promise<FetchUserDataOutput> {
    return this.core.fetcher<FetchUserDataOutput>(
      `${this.baseUrl}/fetch-user-data`,
      'POST',
      input
    );
  }

  async requestPasswordReset(input: { "email": string }): Promise<AuthStatus> {
    return this.core.fetcher<AuthStatus>(
      `${this.baseUrl}/request-password-reset`,
      'POST',
      input
    );
  }

  async verifyPasswordResetOtp(input: { "email": string, "otp": string }): Promise<AuthStatus> {
    return this.core.fetcher<AuthStatus>(
      `${this.baseUrl}/verify-password-reset-otp`,
      'POST',
      input
    );
  }

  async resetPassword(input: { "email": string, "otp": string, "newPassword": string }): Promise<AuthStatus> {
    return this.core.fetcher<AuthStatus>(
      `${this.baseUrl}/reset-password`,
      'POST',
      input
    );
  }
}