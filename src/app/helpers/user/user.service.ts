import { Injectable, inject } from '@angular/core';
import { CoreService } from '../core.service';
import {
  UserModelOutput, 
  UserFetchDataOutput,
  UserFectchOutput,
} from './user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private core = inject(CoreService);
  private baseUrl = 'api/auth';

  /**
   * POST api/auth/fetch-user-data
   * get the user data
   */
  async fetchUserData(input: Record<string, any> = {}): Promise<UserFetchDataOutput> {
    const response = await this.core.fetcher<UserFectchOutput>(
      `${this.baseUrl}/fetch-user-info`,
      'POST',
      input
    );

    console.log(response.data)

    if (!response?.data) {
      return response as any;
    }

    const { first_name, last_name, contact_no, address } = response.data;

    let temp_address = '';
    let city = '';
    let province = '';

    if (address) {
      const parts = address.split(',').map((part: string) => part.trim());
      if (parts.length > 0) {
        province = parts.pop() ?? '';
        city = parts.pop() ?? '';
        temp_address = parts.join(', ');
      }
    }

    return {
      first_name: first_name ?? '',
      last_name: last_name ?? '',
      contact_no: contact_no ?? '',
      address: temp_address,
      city: city,
      province: province,
    } as UserFetchDataOutput;
  }
}