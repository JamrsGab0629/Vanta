import { Component, Input, computed, signal } from '@angular/core';

interface Order {
  referenceCode: string;
  timeOfOrder: string;
  timeOfDelivery: string;
  quantity: number;
  cash: string;
  status: 'delivered' | 'transit' | 'pending';
}

@Component({
  selector: 'app-history-item',
  imports: [],
  templateUrl: './history-item.html',
  styleUrl: './history-item.css',
})
export class HistoryItem {
  private searchTermSig = signal('');

  @Input()
  set searchTerm(value: string) {
    this.searchTermSig.set(value ?? '');
  }
  get searchTerm(): string {
    return this.searchTermSig();
  }

  orders = signal<Order[]>([
    { referenceCode: 'VN-40218-7X', timeOfOrder: 'Jul 21, 2026 · 10:42 AM', timeOfDelivery: 'Jul 21, 2026 · 3:15 PM', quantity: 4, cash: '₱75,114.25', status: 'delivered' },
    { referenceCode: 'VN-40217-2K', timeOfOrder: 'Jul 21, 2026 · 9:05 AM', timeOfDelivery: 'Jul 21, 2026 · 1:40 PM', quantity: 2, cash: '₱26,673.39', status: 'delivered' },
    { referenceCode: 'VN-40216-9Q', timeOfOrder: 'Jul 20, 2026 · 6:20 PM', timeOfDelivery: '—', quantity: 1, cash: '₱40,446.33', status: 'transit' },
    { referenceCode: 'VN-40215-3M', timeOfOrder: 'Jul 20, 2026 · 4:52 PM', timeOfDelivery: 'Jul 20, 2026 · 8:10 PM', quantity: 3, cash: '₱21,002.18', status: 'delivered' },
    { referenceCode: 'VN-40214-8L', timeOfOrder: 'Jul 20, 2026 · 2:11 PM', timeOfDelivery: '—', quantity: 1, cash: '₱11,778.67', status: 'pending' },
    { referenceCode: 'VN-40213-1D', timeOfOrder: 'Jul 19, 2026 · 11:30 AM', timeOfDelivery: 'Jul 19, 2026 · 5:02 PM', quantity: 5, cash: '₱54,624.36', status: 'delivered' },
  ]);

  filteredOrders = computed(() => {
    const term = this.searchTermSig().trim().toLowerCase();
    if (!term) return this.orders();
    return this.orders().filter((order) =>
      order.referenceCode.toLowerCase().includes(term)
    );
  });
}
