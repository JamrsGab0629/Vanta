import { Component } from '@angular/core';
import { Transactions } from '../../components/admin/transactions/transactions';

@Component({
  selector: 'app-history',
  imports: [Transactions],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History {}
