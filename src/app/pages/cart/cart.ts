import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { CartCard, CartItem } from '../../components/cards/cart.card/cart.card';
import { CartService } from '../../helpers/cart/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CartCard, CurrencyPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  private cartService = inject(CartService);

  carted = signal<CartItem[]>([]);

  // Dynamic cart overview calculations
  subtotal = computed(() =>
    this.carted().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  readonly taxRate = 0.12;
  tax = computed(() => this.subtotal() * this.taxRate);
  total = computed(() => this.subtotal() + this.tax());

  async ngOnInit() {
    try {
      const res = await this.cartService.getCart();
      this.carted.set(res.items);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }

  async onQuantityChange(event: { productId: string; quantity: number }) {
    try {
      const res = this.cartService.modifyQuantity(event.productId, event.quantity);
      if (res instanceof Promise) {
        await res;
      } else {
        await firstValueFrom(res);
      }

      this.carted.update((items) =>
        items.map((item) =>
          item.product_id === event.productId ? { ...item, quantity: event.quantity } : item
        )
      );
    } catch (error) {
      console.error('Failed to update quantity:', error);
      this.carted.update((items) => [...items]);
    }
  }

  async onRemoveItem(productId: string) {
    try {
      const res = this.cartService.removeToCart(productId);
      if (res instanceof Promise) {
        await res;
      } else {
        await firstValueFrom(res);
      }

      this.carted.update((items) => items.filter((item) => item.product_id !== productId));
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
    }
  }
}