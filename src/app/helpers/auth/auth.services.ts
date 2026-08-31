import { Injectable, inject } from '@angular/core';
import { CoreService } from '../core.service'; // Path to your Core service
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
  UserStateInput,
  UserStateOutput,
} from './auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private core = inject(CoreService);
  private baseUrl = '/api/auth/';

  /**
   * POST /api/users/login
   */
  async login(input: LoginInput): Promise<LoginOutput> {
    return this.core.fetcher<LoginOutput>(
      `${this.baseUrl}login`,
      'POST',
      input
    );
  }

  /**
   * POST /api/users/logout
   */
  async logout(payload?: Record<string, any>): Promise<LogoutOutput> {
    return this.core.fetcher<LogoutOutput>(
      `${this.baseUrl}logout`,
      'POST',
      payload
    );
  }

  /**
   * POST /api/users/signup
   */
  async signup(input: SignupInput): Promise<SignupOutput> {
    return this.core.fetcher<SignupOutput>(
      `${this.baseUrl}signup`,
      'POST',
      input
    );
  }

  /**
   * POST /api/users/verify-otp
   */
  async verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpOutput> {
    return this.core.fetcher<VerifyOtpOutput>(
      `${this.baseUrl}verify-otp`,
      'POST',
      input
    );
  }

  /**
   * POST /api/users/resend-otp
   */
  async resendOtp(input: ResendOtpInput): Promise<ResendOtpOutput> {
    return this.core.fetcher<ResendOtpOutput>(
      `${this.baseUrl}resend-otp`,
      'POST',
      input
    );
  }

  /**
   * GET /api/users/state
   */
  async getState(input?: UserStateInput): Promise<UserStateOutput> {
    return this.core.fetcher<UserStateOutput>(
      `${this.baseUrl}state`,
      'GET',
      input
    );
  }
}
