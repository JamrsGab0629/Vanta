import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Footnote } from '../../components/auth/footnote/footnote';
import { Otp } from '../../components/auth/otp/otp';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../helpers/auth/auth.services';

type ResetStep = 'email' | 'otp' | 'password';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, Footnote, Otp, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly strengthColors = ['#C24B3F', '#C24B3F', '#D98B52', '#D98B52', '#7FA871'];
  readonly strengthLabels = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'];

  readonly isLoading = signal(false);
  readonly step = signal<ResetStep>('email');
  
  // Stored temporarily during step transitions
  verifiedOtpCode = signal<string>('');

  emailForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  passwordForm: FormGroup = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
  );

  get email(): string {
    return this.emailForm.get('email')?.value || '';
  }

  get password(): string {
    return this.passwordForm.get('password')?.value || '';
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get passwordScore(): number {
    const val = this.password;
    let score = 0;
    if (val.length >= 8) score++;
    if (val.length >= 12) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score++;
    return score;
  }

  get strengthLabel(): string {
    return this.password.length === 0
      ? 'Minimum 8 characters'
      : this.strengthLabels[this.passwordScore];
  }

  isEmailInvalid(): boolean {
    const control = this.emailForm.get('email');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isPasswordInvalid(controlName: string): boolean {
    const control = this.passwordForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get isConfirmPasswordInvalid(): boolean {
    const confirmControl = this.passwordForm.get('confirmPassword');
    const isTouched = confirmControl?.touched || this.passwordForm.touched;
    return !!(
      isTouched &&
      (confirmControl?.invalid || this.passwordForm.hasError('passwordMismatch'))
    );
  }

  /** STEP 1: Request OTP for password reset */
  async onRequestOtp(): Promise<void> {
    if (this.isLoading()) return;

    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    try {
      await this.authService.requestPasswordReset({ email: this.email });
      this.step.set('otp');
    } catch (error: any) {
      alert(error?.error?.message || error?.message || 'Failed to send OTP code.');
      console.error('Request OTP error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /** STEP 2: Verify OTP code */
  async onOtpVerified(code: string): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    try {
      // Validate OTP with backend or save code for final password submit
      await this.authService.verifyPasswordResetOtp({ email: this.email, otp: code });
      this.verifiedOtpCode.set(code);
      this.step.set('password');
    } catch (error: any) {
      alert(error?.error?.message || error?.message || 'Invalid or expired OTP code.');
      console.error('OTP Verification Error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onOtpResend(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.authService.requestPasswordReset({ email: this.email });
      alert('A new OTP code has been sent to your email.');
    } catch (error) {
      console.error('OTP Resend Error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onOtpBack(): void {
    this.step.set('email');
  }

  /** STEP 3: Submit new password */
  async onResetPassword(): Promise<void> {
    if (this.isLoading()) return;

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    try {
      await this.authService.resetPassword({
        email: this.email,
        otp: this.verifiedOtpCode(),
        newPassword: this.password,
      });
      alert('Password updated successfully! Please log in.');
      await this.router.navigate(['/auth/login']);
    } catch (error: any) {
      alert(error?.error?.message || error?.message || 'Failed to update password.');
      console.error('Password reset error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}