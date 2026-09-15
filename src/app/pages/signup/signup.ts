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
import { SignupInput, SignupOutput } from '../../helpers/auth/auth.interface';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, Footnote, Otp, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly strengthColors = ['#C24B3F', '#C24B3F', '#D98B52', '#D98B52', '#7FA871'];
  readonly strengthLabels = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'];

  /** Signals for instant reactivity */
  readonly isLoading = signal(false);
  readonly step = signal<'form' | 'otp'>('form');

  signupForm: FormGroup = this.fb.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
    },
    { validators: this.passwordMatchValidator },
  );

  get firstName(): string {
    return this.signupForm.get('firstName')?.value || '';
  }

  get lastName(): string {
    return this.signupForm.get('lastName')?.value || '';
  }

  get username(): string {
    return this.signupForm.get('username')?.value || '';
  }

  get email(): string {
    return this.signupForm.get('email')?.value || '';
  }

  get password(): string {
    return this.signupForm.get('password')?.value || '';
  }

  get apiPayload(): SignupInput {
    return {
      username: this.username,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      password: this.password,
    };
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

  isInvalidAndTouched(controlName: string): boolean {
    const control = this.signupForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get isConfirmPasswordInvalid(): boolean {
    const confirmControl = this.signupForm.get('confirmPassword');
    const isTouched = confirmControl?.touched || this.signupForm.touched;
    return !!(
      isTouched &&
      (confirmControl?.invalid || this.signupForm.hasError('passwordMismatch'))
    );
  }

  async onSubmit(): Promise<void> {
    if (this.isLoading()) return;

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    try {
      const response: SignupOutput = await this.authService.signup(this.apiPayload);

      if (response.requiresOtp) {
        this.step.set('otp');
      } else {
        await this.router.navigate(['/auth/login']);
      }
    } catch (error: any) {
      if (error?.status === 400 || error?.statusCode === 400) {
        alert('Username or email is already taken.');
      } else {
        alert(error?.error?.message || error?.message || 'Signup failed. Please try again.');
      }
      console.error('Signup error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onOtpVerified(code: string): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    try {
      await this.authService.verifyOtp({ email: this.email, otp: code });
      await this.router.navigate(['/auth/login']);
    } catch (error: any) {
      if (error?.status === 400 || error?.statusCode === 400) {
        alert('OTP code does not match.');
      } else {
        alert(error?.error?.message || error?.message || 'Verification failed. Please try again.');
      }
      console.error('OTP verification error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onOtpResend(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.authService.resendOtp({ email: this.email });
      alert('A new OTP has been sent to your email.');
    } catch (error) {
      console.error('OTP resend error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onOtpBack(): void {
    this.step.set('form');
  }
}