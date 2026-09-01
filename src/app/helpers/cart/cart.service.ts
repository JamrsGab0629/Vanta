// src/app/helpers/cart/cart.service.ts
import { Injectable } from '@angular/core';
import { CoreService } from '../core.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private coreService: CoreService) {}

  // Fetch the current user's cart
  getCart() {
    return this.coreService.fetcher('/api/cart', 'GET');
  }

  // Add an item to the cart
  addToCart(product_id: number, quantity: number = 1) {
    return this.coreService.fetcher('/api/cart', 'POST', {
      product_id,
      quantity,
    });
  }
}