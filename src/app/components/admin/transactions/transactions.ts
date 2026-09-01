import { Component, Input } from '@angular/core';
import { HistoryItem } from '../history-item/history-item';

@Component({
  selector: 'app-transactions',
  imports: [HistoryItem],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  @Input() searchTerm = '';
}
