import { Component } from '@angular/core';
import { Stage } from "../../components/app/stage/stage";
import { CartOverview } from "../../components/app/cart-overview/cart-overview";
import { CartItem } from "../../components/app/cart-item/cart-item";

@Component({
  selector: 'app-cart',
  imports: [Stage, CartOverview, CartItem],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {}
