import { Component, input, output, OnInit, OnDestroy } from '@angular/core';
import { CurrencyPipe, NgIf } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
export class CartCard implements OnInit, OnDestroy {
  item = input.required<CartItem>();

  quantityChange = output<{ productId: string; quantity: number }>();
  remove = output<string>();

  private qtySubject = new Subject<number>();
  private subSubscription!: Subscription;

  localQuantity = 1;

  ngOnInit() {
    this.localQuantity = this.item().quantity;

    this.subSubscription = this.qtySubject.pipe(
      debounceTime(2000)
    ).subscribe((newQty) => {
      this.quantityChange.emit({ productId: this.item().product_id, quantity: newQty });
    });
  }

  increment() {
    const maxStock = this.item().stock_quantity;
    if (!maxStock || this.localQuantity < maxStock) {
      this.localQuantity++;
      this.qtySubject.next(this.localQuantity);
    }
  }

  decrement() {
    if (this.localQuantity > 1) {
      this.localQuantity--;
      this.qtySubject.next(this.localQuantity);
    }
  }

  onRemove() {
    this.remove.emit(this.item().product_id);
  }

  ngOnDestroy() {
    this.subSubscription?.unsubscribe();
  }
}