import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProductStore } from '../../helpers/product/product.store';

@Component({
  selector: 'app-product-manage',
  imports: [RouterLink],
  templateUrl: './product-manage.html',
  styleUrl: './product-manage.css',
})
export class ProductManage {
  private router = inject(Router);
  private store = inject(ProductStore);

  products = this.store.products;

  selectedId = signal<string>('');
  stockQty = signal(0);
  price = signal(0);
  confirmingDelete = signal(false);
  savedMessage = signal('');

  selectedProduct = computed(() => {
    const id = this.selectedId();
    return id ? this.store.getProduct(id) : undefined;
  });

  onProductSelect(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedId.set(id);
    this.confirmingDelete.set(false);
    this.savedMessage.set('');

    const product = id ? this.store.getProduct(id) : undefined;
    this.stockQty.set(product?.stockQty ?? 0);
    this.price.set(product?.price ?? 0);
  }

  onStockInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.stockQty.set(Number.isNaN(value) ? 0 : value);
  }

  onPriceInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.price.set(Number.isNaN(value) ? 0 : value);
  }

  saveChanges(): void {
    const id = this.selectedId();
    if (!id) return;
    this.store.updateProduct(id, { stockQty: this.stockQty(), price: this.price() });
    this.savedMessage.set('Changes saved.');
  }

  requestDelete(): void {
    this.confirmingDelete.set(true);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  confirmDelete(): void {
    const id = this.selectedId();
    if (!id) return;
    this.store.deleteProduct(id);
    this.router.navigate(['/admin/database']);
  }
}
