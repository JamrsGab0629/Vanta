import { Component } from '@angular/core';
import { Stage } from "../../components/app/stage/stage";
import { OrderSummary } from "../../components/app/order-summary/order-summary";

@Component({
  selector: 'app-confirmation',
  imports: [Stage, OrderSummary],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.css',
})
export class Confirmation {}
