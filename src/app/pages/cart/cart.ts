import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CartCard, CartItem } from '../../components/cards/cart.card/cart.card';
import { CartService } from '../../helpers/cart/cart.service';
import { Stage } from "../../components/app/stage/stage";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CartCard, CurrencyPipe, Stage],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  carted = signal<CartItem[]>([]);
  errorMessage = signal<string | null>(null);
  saving = signal(false);

  subtotal = computed(() =>
    this.carted().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  readonly taxRate = 0.12;
  tax = computed(() => this.subtotal() * this.taxRate);
  total = computed(() => this.subtotal() + this.tax());

  // Saving: wait 400ms after the last click per product, then save.
  // Saves run one after another, so they can't finish out of order.
  private timers = new Map<string, any>();
  private pendingQty = new Map<string, number>();
  private queue: Promise<void> = Promise.resolve();
  private activeSaves = 0;
  private saveFailed = false;
  private errorTimer: any;

  async ngOnInit() {
    await this.reloadCart();
  }

  ngOnDestroy() {
    // Leaving the page by any route still saves what you changed
    this.flushTimers();
  }

  // Always pull the real cart from the server, so the screen matches the database
  private async reloadCart() {
    try {
      const res = await this.cartService.getCart();
      this.carted.set(res.items);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }

  private showError(message: string) {
    this.errorMessage.set(message);
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => this.errorMessage.set(null), 5000);
  }

  onQuantityChange(event: { productId: string; quantity: number }) {
    const id = event.productId;

    // Update totals right away so it feels instant
    this.carted.update((items) =>
      items.map((item) => (item.product_id === id ? { ...item, quantity: event.quantity } : item))
    );

    this.pendingQty.set(id, event.quantity);
    clearTimeout(this.timers.get(id));
    this.timers.set(
      id,
      setTimeout(() => {
        this.timers.delete(id);
        const qty = this.pendingQty.get(id);
        this.pendingQty.delete(id);
        if (qty !== undefined) this.enqueueSave(id, qty);
      }, 400)
    );
  }

  private enqueueSave(productId: string, quantity: number) {
    this.activeSaves++;
    this.saving.set(true);

    this.queue = this.queue.then(async () => {
      try {
        await this.cartService.modifyQuantity(productId, quantity);
        this.errorMessage.set(null);
      } catch (error) {
        this.saveFailed = true;
        console.error('Failed to update quantity:', error);
        this.showError(error instanceof Error ? error.message : "Couldn't update the quantity.");
        await this.reloadCart(); // put the screen back to what the server actually has
      } finally {
        this.activeSaves--;
        if (this.activeSaves === 0) this.saving.set(false);
      }
    });
  }

  // Sends every change that is still waiting on its timer right now
  private flushTimers() {
    for (const [id, timer] of this.timers) {
      clearTimeout(timer);
      const qty = this.pendingQty.get(id);
      if (qty !== undefined) this.enqueueSave(id, qty);
    }
    this.timers.clear();
    this.pendingQty.clear();
  }

  private async flush() {
    this.flushTimers();
    await this.queue;
  }

  async onCheckout() {
    this.saveFailed = false;
    await this.flush(); // make sure the server has your latest quantities first
    if (this.saveFailed) return; // stay on the page so the error stays visible

    this.router.navigate(['../checkout'], { relativeTo: this.route });
  }

  async onRemoveItem(productId: string) {
    // Drop any unsaved quantity change for an item that is being removed
    clearTimeout(this.timers.get(productId));
    this.timers.delete(productId);
    this.pendingQty.delete(productId);

    try {
      await this.cartService.removeToCart(productId);
      this.carted.update((items) => items.filter((item) => item.product_id !== productId));
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      this.showError(error instanceof Error ? error.message : "Couldn't remove the item.");
    }
  }
}