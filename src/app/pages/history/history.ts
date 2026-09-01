import { Component, signal } from '@angular/core';
import { Transactions } from '../../components/admin/transactions/transactions';

@Component({
  selector: 'app-history',
  imports: [Transactions],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History {
  searchTerm = signal('');

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }
}
