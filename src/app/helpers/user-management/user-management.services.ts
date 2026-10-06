import { inject, Injectable } from '@angular/core';
import { CoreService } from '../core.service';
import { ApiResponse, AppUser, ListUsersParams } from './user-management.interface';

const BASE = '/api/admin/users';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private core = inject(CoreService);

  getUsers(params: ListUsersParams = {}): Promise<ApiResponse<AppUser[]>> {
    // GET payloads are sent as query params by CoreService.fetcher (?search=&role=)
    return this.call<AppUser[]>(BASE, 'GET', params);
  }

  promote(id: number): Promise<ApiResponse<AppUser>> {
    return this.call<AppUser>(`${BASE}/${id}/promote`, 'PATCH');
  }

  demote(id: number): Promise<ApiResponse<AppUser>> {
    return this.call<AppUser>(`${BASE}/${id}/demote`, 'PATCH');
  }

  remove(id: number): Promise<ApiResponse<void>> {
    return this.call<void>(`${BASE}/${id}`, 'DELETE');
  }

  // CoreService.fetcher throws Error(serverMessage) on failure. Convert that
  // into { success: false, message } so the page never needs try/catch.
  private async call<T>(path: string, method: 'GET' | 'PATCH' | 'DELETE', payload?: any): Promise<ApiResponse<T>> {
    try {
      const body = await this.core.fetcher<{ success: boolean; data?: T }>(path, method, payload);
      return { success: true, data: body.data };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      };
    }
  }
}