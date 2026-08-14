import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Footnote } from '../../components/auth/footnote/footnote';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, Footnote, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private fb = inject(FormBuilder);

  readonly strengthColors = ['#C24B3F', '#C24B3F', '#D98B52', '#D98B52', '#7FA871'];
  readonly strengthLabels = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'];

  signupForm: FormGroup = this.fb.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
    },
    { validators: this.passwordMatchValidator }
  );

  /**
   * Custom validator to ensure password and confirmPassword match.
   */
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Calculates password strength score (0 - 4).
   */
  get passwordScore(): number {
    const val = this.signupForm.get('password')?.value || '';
    let score = 0;
    if (val.length >= 8) score++;
    if (val.length >= 12) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score++;
    return score;
  }

  get strengthLabel(): string {
    const val = this.signupForm.get('password')?.value || '';
    return val.length === 0 ? 'Minimum 8 characters' : this.strengthLabels[this.passwordScore];
  }

  // Helper getters for template validation checks
  isInvalidAndTouched(controlName: string): boolean {
    const control = this.signupForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get isConfirmPasswordInvalid(): boolean {
    const confirmControl = this.signupForm.get('confirmPassword');
    const isTouched = confirmControl?.touched || this.signupForm.touched;
    return !!(isTouched && (confirmControl?.invalid || this.signupForm.hasError('passwordMismatch')));
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    // Connect this to your backend service/API call
    alert('Account creation submitted (demo only — connect this to your backend).');
    console.log(this.signupForm.value);
  }
}
