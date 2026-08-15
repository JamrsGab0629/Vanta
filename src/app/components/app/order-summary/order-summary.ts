import { Component } from '@angular/core';
import { OrderList } from "../order-list/order-list";
import { OrderItem } from "../order-item/order-item";

@Component({
  selector: 'app-order-summary',
  imports: [OrderItem],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.css',
})
export class OrderSummary {}
