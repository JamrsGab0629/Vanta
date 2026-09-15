import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryItem, OrderRow } from '../history-item/history-item';
import { TransactionService } from '../../../helpers/transaction/transaction.service';
import { ToastService } from '../../../helpers/toast/toast.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, HistoryItem],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  private transactionService = inject(TransactionService);
  private toastService = inject(ToastService);

  rows = signal<OrderRow[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadTransactions();
  }

  async loadTransactions(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.transactionService.getAllTransactions();
      const transactions = response?.transactions ?? [];

      const mapped: OrderRow[] = transactions.map((t: any) => {
        const order = t?.Receipt?.Order;
        const receipt = t?.Receipt;
        const items = order?.items ?? [];
        const quantity = items.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 0), 0);

        return {
          order_id: order?.order_id,
          reference_code: `VN-${order?.order_id ?? '000'}`,
          order_date: receipt?.receipt_date ?? null,
          delivery_date: null,
          quantity,
          cash: Number(receipt?.total_price ?? 0),
          status: order?.status === 'paid' ? 'pending' : (order?.status ?? 'pending'),
        };
      });

      this.rows.set(mapped);
    } catch (error) {
      console.error('Failed to load transactions', error);
      this.rows.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onStatusChange(event: { orderId: string | number; status: string }): Promise<void> {
    try {
      await this.transactionService.updateOrderStatus(event.orderId, event.status);
      this.toastService.show('Order status updated', 'success');
    } catch (error) {
      console.error('Failed to update status', error);
      this.toastService.show("Couldn't update status — try again", 'error');
      this.loadTransactions();
    }
  }
}