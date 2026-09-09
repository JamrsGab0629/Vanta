import { Injectable, inject, signal } from '@angular/core';
import { CoreService } from '../core.service'; 
import {
  AuthUser, // Import your AuthUser schema
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
   * POST /api/users/login
   */
  async login(input: LoginInput): Promise<LoginOutput> {
    const response = await this.core.fetcher<LoginOutput>(
      `${this.baseUrl}/login`,
      'POST',
      input
    );

    return response;
  }

  /**
   * POST /api/users/logout
   */
  async logout(payload?: Record<string, any>): Promise<LogoutOutput> {
      return await this.core.fetcher<LogoutOutput>(
        `${this.baseUrl}/logout`,
        'POST',
        payload
      );
  }

  /**
   * POST /api/users/signup
   */
  async signup(input: SignupInput): Promise<SignupOutput> {
    return this.core.fetcher<SignupOutput>(
      `${this.baseUrl}/register`,
      'POST',
      input
    );
  }

  /**
   * POST /api/users/verify-otp
   */
  async verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpOutput> {
    return this.core.fetcher<VerifyOtpOutput>(
      `${this.baseUrl}/verify-otp`,
      'POST',
      input
    );
  }

  /**
   * POST /api/users/resend-otp
   */
  async resendOtp(input: ResendOtpInput): Promise<ResendOtpOutput> {
    return this.core.fetcher<ResendOtpOutput>(
      `${this.baseUrl}/resend-verification`,
      'POST',
      input
    );
  }

  /**
   * POST /api/users/verify-auth
   */
  async verifyAuth(input = {}): Promise<AuthStatus> {
    return this.core.fetcher<AuthStatus>(
      `${this.baseUrl}/verify-auth`,
      'POST',
      input
    );
  }

  /**
   * POST /api/users/fetch-user-data
   */
  async fetchUserData(input = {}): Promise<FetchUserDataOutput> {
    return this.core.fetcher<FetchUserDataOutput>(
      `${this.baseUrl}/fetch-user-data`,
      'POST',
      input
    )
  }
}