import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryItem, OrderRow } from '../history-item/history-item';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, HistoryItem],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  rows = input.required<OrderRow[]>();
  isLoading = input.required<boolean>();
  statusChange = output<{ orderId: string | number; status: string }>();

  onStatusChange(event: { orderId: string | number; status: string }): void {
    this.statusChange.emit(event);
  }
}