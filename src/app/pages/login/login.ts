import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Footnote } from '../../components/auth/footnote/footnote';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../helpers/auth/auth.services';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, Footnote, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  /** Loading state during API calls */
  isLoading = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  // Control Getters
  get email(): string {
    return this.loginForm.get('email')?.value || '';
  }

  get password(): string {
    return this.loginForm.get('password')?.value || '';
  }

  /**
   * Helper method to check if a form control is invalid and touched/dirty.
   */
  isInvalidAndTouched(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    try {
      await this.authService.login({ email: this.email, password: this.password });

      // Fetch user role for conditional routing
      const response = await this.authService.fetchUserData();

      if (response.data?.role === 'admin') {
        await this.router.navigate(['/admin']);
      } else {
        await this.router.navigate(['/app']);
      }
    } catch (error: any) {
      // CoreService.fetcher throws Error(serverMessage), so there is no status code here
      alert(error?.message || 'Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}