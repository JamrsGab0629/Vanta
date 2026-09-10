import { Injectable, inject } from '@angular/core';
import { CoreService } from '../core.service';
import {
  TransactionInformation
} from './transaction.interface';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private core = inject(CoreService);
  private baseUrl = '/api/checkout';

  /**
   * POST api/checkout/
   * Post a tcheckout
   */
  async completeTransaction(input: TransactionInformation): Promise<{ message: string; tracking_code: string }> {
    return this.core.fetcher<{ message: string; tracking_code: string }>(
      `${this.baseUrl}/`,
      'POST',
      input
    );
  }
}