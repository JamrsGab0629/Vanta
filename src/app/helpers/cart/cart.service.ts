import { Injectable } from '@angular/core';
import { CoreService } from '../core.service';
import { CartItem, FetchCart } from './cart.interface';

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
  async addToCart(
    product_id: number | string,
    quantity: number = 1
  ): Promise<{ message: string }> {
    return await this.coreService.fetcher('/api/cart/', 'POST', {
      product_id: Number(product_id), // Ensures payload value is a number
      quantity: Number(quantity),
    });
  }

  // Modify item quantity in the cart
  async modifyQuantity(
    product_id: number | string,
    quantity: number
  ): Promise<{ message: string }> {
    return await this.coreService.fetcher('/api/cart/', 'POST', {
      product_id: Number(product_id),
      quantity: Number(quantity),
    });
  }

  // Delete item from current user's cart
  async removeToCart(
    product_id: number | string
  ): Promise<{ message: string }> {
    return await this.coreService.fetcher(`/api/cart/${Number(product_id)}`, 'DELETE');
  }
}