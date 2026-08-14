import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Footnote } from '../../components/auth/footnote/footnote';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, Footnote, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  /**
   * Helper method to check if a form control is invalid and touched/dirty.
   */
  isInvalidAndTouched(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Connect this to your backend authentication service
    alert('Login submitted (demo only — connect this to your backend).');
    console.log(this.loginForm.value);
  }
}
