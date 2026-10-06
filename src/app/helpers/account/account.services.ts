import { inject, Injectable } from '@angular/core';
import { CoreService } from '../core.service';
import { ChangePasswordResult } from './account.interface';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private core = inject(CoreService);

  // CoreService.fetcher throws Error(serverMessage) on failure; convert it
  // so the page can just read { success, message }.
  async changePassword(currentPassword: string, newPassword: string): Promise<ChangePasswordResult> {
    try {
      await this.core.fetcher('/api/account/password', 'PATCH', { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Could not update your password.',
      };
    }
  }
}
