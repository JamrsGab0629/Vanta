import { Injectable, inject } from '@angular/core';
import { CoreService } from '../core.service';
import { TransactionInformation } from './transaction.interface';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private core = inject(CoreService);
  private baseUrl = '/api/checkout';
  private adminBaseUrl = '/api/transactions';

  async completeTransaction(input: TransactionInformation): Promise<{ message: string; tracking_code: string }> {
    return this.core.fetcher<{ message: string; tracking_code: string }>(
      `${this.baseUrl}/`,
      'POST',
      input
    );
  }

  async getAllTransactions(): Promise<any> {
    return this.core.fetcher<any>(`${this.adminBaseUrl}/admin/all`, 'GET');
  }

  async updateOrderStatus(orderId: string | number, status: string): Promise<{ message: string; is_successful?: boolean }> {
    return this.core.fetcher<{ message: string; is_successful?: boolean }>(
      `${this.adminBaseUrl}/admin/${orderId}/status`,
      'PATCH',
      { status }
    );
  }
}