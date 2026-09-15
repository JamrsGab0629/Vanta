import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../helpers/transaction/transaction.service';
import { TransactionModel } from '../../helpers/transaction/transaction.interface';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History implements OnInit {
  private transactionService = inject(TransactionService);

  // Writable signal for state management inside the component
  public transactions: WritableSignal<TransactionModel[]> = signal([]);

  async ngOnInit(): Promise<void> {
    await this.initTransactions();
  }

  async initTransactions(): Promise<void> {
    try {
      const response = await this.transactionService.getTransactions({ all: true });
      if (response) {
        this.transactions.set(response);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }

  // Helper method to check if a status is terminal (cannot be changed)
  isStatusLocked(status?: string): boolean {
    if (!status) return false;
    const lower = status.toLowerCase();
    return lower === 'completed' || lower === 'delivered' || lower === 'cancelled';
  }

  // Handle changing status for a specific transaction
  async onStatusChange(transactionId: number | string, newStatus: string): Promise<void> {
    const currentTransaction = this.transactions().find((t) => t.transaction_id === transactionId);

    if (this.isStatusLocked(currentTransaction?.status)) {
      console.warn(`Transaction ${transactionId} is already ${currentTransaction?.status} and cannot be modified.`);
      return;
    }

    // Keep backup of old transactions list to revert on failure
    const previousState = this.transactions();

    try {
      // Optimistically update status and delivery time (updated_at) to NOW
      const nowIso = new Date().toISOString();
      this.transactions.update((list) =>
        list.map((t) =>
          t.transaction_id === transactionId
            ? { ...t, status: newStatus, updated_at: nowIso }
            : t
        )
      );

      // Execute backend API call
      await this.transactionService.updateStatus({
        transaction_id: String(transactionId),
        status: newStatus,
      });
    } catch (error) {
      console.error('Failed to update status. Reverting changes:', error);
      
      // Revert back to normal/original state on failure
      this.transactions.set(previousState);
    }
  }
}