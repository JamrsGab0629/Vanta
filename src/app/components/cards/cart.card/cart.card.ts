import { Component, input, output, computed, linkedSignal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

export interface CartItem {
  product_id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  quantity: number;
  stock_quantity?: number;
}

@Component({
  selector: 'app-cart-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './cart.card.html',
  styleUrl: './cart.card.css'
})
export class CartCard {
  item = input.required<CartItem>();

  quantityChange = output<{ productId: string; quantity: number }>();
  remove = output<string>();

  // Follows item().quantity, so when the cart page reloads the real quantity
  // (for example after a failed save) the card shows it too.
  localQuantity = linkedSignal(() => this.item().quantity);

  atMax = computed(() => {
    const max = this.item().stock_quantity;
    return !!max && this.localQuantity() >= max;
  });

  // TODO: replace with your actual backend origin (or pull from environment.ts)
  private apiOrigin = 'http://localhost:3000';

  fullImageUrl = computed(() => {
    const url = this.item().image_url;
    if (!url) return '';
    return url.startsWith('http') ? url : `${this.apiOrigin}${url}`;
  });

  increment() {
    if (this.atMax()) return;
    this.localQuantity.update((q) => q + 1);
    this.emitChange();
  }

  decrement() {
    if (this.localQuantity() <= 1) return;
    this.localQuantity.update((q) => q - 1);
    this.emitChange();
  }

  private emitChange() {
    this.quantityChange.emit({ productId: this.item().product_id, quantity: this.localQuantity() });
  }

  onRemove() {
    this.remove.emit(this.item().product_id);
  }
}