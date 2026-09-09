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
  private baseUrl = 'api/transaction/';

  /**
   * POST api/transaction/
   * Post a transaction
   */
  async completeTransaction<TransactionInformation>(input: TransactionInformation): Promise<{ message: string }> {
    return this.core.fetcher<{ message: string }>(
      this.baseUrl,
      'POST',
      input
    );
  }
}
