import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../helpers/account/account.services';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  private fb = inject(FormBuilder);
  private account = inject(AccountService);

  form = this.fb.nonNullable.group({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  private values = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  submitting = signal(false);
  showPasswords = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  // Live checklist so people see what's missing before they press the button
  hasMinLength = computed(() => (this.values().newPassword ?? '').length >= 8);
  differsFromCurrent = computed(() => {
    const v = this.values();
    return !!v.newPassword && v.newPassword !== v.currentPassword;
  });
  matchesConfirm = computed(() => {
    const v = this.values();
    return !!v.newPassword && v.newPassword === v.confirmPassword;
  });

  canSubmit = computed(
    () =>
      !!this.values().currentPassword &&
      this.hasMinLength() &&
      this.differsFromCurrent() &&
      this.matchesConfirm() &&
      !this.submitting()
  );

  toggleShow() {
    this.showPasswords.update((v) => !v);
  }

  async onSubmit() {
    if (!this.canSubmit()) return;

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    const { currentPassword, newPassword } = this.form.getRawValue();
    const res = await this.account.changePassword(currentPassword, newPassword);
    this.submitting.set(false);

    if (!res.success) {
      this.error.set(res.message ?? 'Could not update your password.');
      return;
    }
    this.form.reset();
    this.success.set(true);
  }
}
