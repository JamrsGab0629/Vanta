import { Component, computed, inject, OnInit, signal, Signal, WritableSignal } from '@angular/core';
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

  // Search filter query
  public searchTerm: WritableSignal<string> = signal('');

  // Computed signal for filtered transactions based on reference code (tracking_code)
  public filteredTransactions: Signal<TransactionModel[]> = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.transactions();

    return this.transactions().filter((t) =>
      t.tracking_code?.toLowerCase().includes(term)
    );
  });

  // Computed signal for dynamic stats calculations
  public stats = computed(() => {
  const list = this.transactions();

  const totalTransactions = list.length;

  const successfulOrders = list.filter((t) => {
    const s = t.status?.toLowerCase();
    return s === 'completed' || s === 'delivered';
  });

  const totalCash = successfulOrders.reduce(
    (sum, t) => sum + (Number(t.total_price) || 0),
    0
  );

  const pendingTransactions = list.filter((t) => {
    const s = t.status?.toLowerCase();
    return s !== 'completed' && s !== 'delivered' && s !== 'cancelled';
  }).length;

  // 4th Stat: Avg. Order Value
  const avgOrderValue = successfulOrders.length
    ? totalCash / successfulOrders.length
    : 0;

  return { totalTransactions, totalCash, pendingTransactions, avgOrderValue };
});

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