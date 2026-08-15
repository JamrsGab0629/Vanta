import { Component } from '@angular/core';
import { CheckoutList } from "../../components/app/checkout-list/checkout-list";
import { Stage } from "../../components/app/stage/stage";
import { CheckoutItem } from "../../components/app/checkout-item/checkout-item";

@Component({
  selector: 'app-checkout',
  imports: [Stage, CheckoutItem],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {}
