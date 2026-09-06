// src/app/helpers/cart/cart.service.ts
import { Injectable } from '@angular/core';
import { CoreService } from '../core.service';
import {
  CartItem,
  FetchCart,
} from "./cart.interface"
@Injectable({
  providedIn: 'root',
})

export class CartService {
  constructor(private coreService: CoreService) {}

  // Fetch the current user's cart
  async getCart(): Promise<FetchCart> {
    return await this.coreService.fetcher('/api/cart/', 'GET');
  }

  // Add an item to the cart
  async addToCart(product_id: string, quantity: number = 1): Promise<{ message: string }> {
    return await this.coreService.fetcher('/api/car/', 'POST', {
      product_id,
      quantity,
    });
  }

  // Modifying an item to the cart
  async modifyQuantity(product_id: string, quantity: number): Promise<{ message: string }> {
    return await this.coreService.fetcher('/api/cart/', "POST", {
      product_id,
      quantity,
    });
  }

  // Delete an from current user's cart
  async removeToCart(product_id: string): Promise<{ message: string }>{
    return await this.coreService.fetcher('/api/cart/', "DELETE", {
      product_id,
    })
  }
}