import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transactions } from '../../components/admin/transactions/transactions';
import { TransactionService } from '../../helpers/transaction/transaction.service';
import { ToastService } from '../../helpers/toast/toast.service';
import { OrderRow } from '../../components/admin/history-item/history-item';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, Transactions],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History implements OnInit {
  private transactionService = inject(TransactionService);
  private toastService = inject(ToastService);

  rows = signal<OrderRow[]>([]);
  isLoading = signal<boolean>(true);
  searchTerm = signal<string>('');

  filteredRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.rows();
    return this.rows().filter((r) => r.reference_code.toLowerCase().includes(term));
  });

  ordersToday = computed(() => {
    const today = new Date().toDateString();
    return this.rows().filter((r) => r.order_date && new Date(r.order_date).toDateString() === today).length;
  });

  cashCollected = computed(() =>
    this.rows()
      .filter((r) => r.status === 'delivered')
      .reduce((sum, r) => sum + (Number(r.cash) || 0), 0),
  );

  avgDeliveryHours = computed(() => {
    const delivered = this.rows().filter((r) => r.order_date && r.delivery_date);
    if (delivered.length === 0) return 0;

    const totalHours = delivered.reduce((sum, r) => {
      const start = new Date(r.order_date!).getTime();
      const end = new Date(r.delivery_date!).getTime();
      return sum + (end - start) / (1000 * 60 * 60);
    }, 0);

    return totalHours / delivered.length;
  });

  pendingOrders = computed(() => this.rows().filter((r) => r.status === 'pending').length);

  ngOnInit(): void {
    this.loadTransactions();
  }

  onSearchChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
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
          delivery_date: order?.delivered_at ?? null,
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
      const response = await this.transactionService.updateOrderStatus(event.orderId, event.status);

      this.rows.update((list) =>
        list.map((r) =>
          r.order_id === event.orderId
            ? { ...r, status: event.status, delivery_date: (response as any)?.delivered_at ?? null }
            : r,
        ),
      );

      this.toastService.show('Order status updated', 'success');
    } catch (error) {
      console.error('Failed to update status', error);
      this.toastService.show("Couldn't update status — try again", 'error');
      this.loadTransactions();
    }
  }
}