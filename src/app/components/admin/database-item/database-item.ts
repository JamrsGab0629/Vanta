import { Component, inject } from '@angular/core';
import { ProductStore } from '../../../helpers/product/product.store';

@Component({
  selector: 'app-database-item',
  imports: [],
  templateUrl: './database-item.html',
  styleUrl: './database-item.css',
})
export class DatabaseItem {
  private store = inject(ProductStore);

  products = this.store.products;

  isLowStock(product: { stockQty: number }): boolean {
    return this.store.isLowStock(product as any);
  }

  formatPrice(value: number): string {
    return '₱' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
