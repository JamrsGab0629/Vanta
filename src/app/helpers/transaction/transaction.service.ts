import { Injectable, inject } from '@angular/core';
import { CoreService } from '../core.service';
import {
  EditStatus,
  TransactionInformation,
  TransactionModel,
  TransactionsOutput,
} from './transaction.interface';
import { promises } from 'node:dns';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private core = inject(CoreService);
  private baseUrl = '/api';

  async getAllTransaction(input: { status: string } = { status: "ALL" }): Promise<TransactionModel[]> {
    const response = await this.core.fetcher<TransactionsOutput>(
      `${this.baseUrl}/transactions`,
      'POST',
      input,
    );

    return response?.transactions ?? [];
  }

  /**
   * POST api/checkout/
   * Post a tcheckout
   */
  async completeTransaction(
    input: TransactionInformation,
  ): Promise<{ message: string; tracking_code: string }> {
    return this.core.fetcher<{ message: string; tracking_code: string }>(
      `${this.baseUrl}/checkout/`,
      'POST',
      input,
    );
  }

  async getTransactions(input: { all: boolean } = { all: true }): Promise<TransactionModel[]> {
    let transactions: TransactionModel[];
    const response = await this.core.fetcher<TransactionsOutput>(
      `${this.baseUrl}/transactions/transactions/`,
      'GET',
      input,
    );

    if (response?.success && !response?.success) {
      throw new Error('Fetthing transaction failed');
    }

    return response?.transactions;
  }

  async updateStatus(input: EditStatus): Promise<{ message: string; success: boolean }> {
    return await this.core.fetcher<{ message: string; success: boolean }>(
      `${this.baseUrl}/transactions/update-transaction/`,
      'PUT',
      input,
    );
  }
}
