import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

export interface OrderRow {
  order_id: string | number;
  reference_code: string;
  order_date: string | null;
  delivery_date: string | null;
  quantity: number;
  cash: number;
  status: 'pending' | 'transit' | 'delivered' | string;
}

@Component({
  selector: 'app-history-item',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './history-item.html',
  styleUrl: './history-item.css',
})
export class HistoryItem {
  row = input.required<OrderRow>();
  statusChange = output<{ orderId: string | number; status: string }>();

  onStatusSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusChange.emit({ orderId: this.row().order_id, status: value });
  }
}