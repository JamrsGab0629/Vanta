import { Injectable, signal } from '@angular/core';

export interface Product {
  id: string;
  sku: string;
  category: string;
  title: string;
  keySpec: string;
  stockQty: number;
  price: number;
}

const LOW_STOCK_THRESHOLD = 10;

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private readonly _products = signal<Product[]>([
    { id: '1', sku: '0114-GPU', category: 'GPU', title: 'Ridgeline RX-7800', keySpec: '16GB GDDR6 · 2,650 MHz', stockQty: 214, price: 40446.33 },
    { id: '2', sku: '0092-CPU', category: 'CPU', title: 'Vanta Core X9', keySpec: '16C/32T · 5.7 GHz Boost', stockQty: 8, price: 29851.76 },
    { id: '3', sku: '0208-SSD', category: 'STORAGE', title: 'Fathom G5 2TB', keySpec: '12,400 MB/s Read', stockQty: 132, price: 11778.67 },
    { id: '4', sku: '0331-COOL', category: 'COOLING', title: 'Vanta Torrent 360', keySpec: '360mm Copper AIO', stockQty: 67, price: 8662.62 },
    { id: '5', sku: '0119-GPU', category: 'GPU', title: 'Ridgeline RX-6600', keySpec: '8GB GDDR6 · 2,490 MHz', stockQty: 5, price: 20503.61 },
    { id: '6', sku: '0088-CPU', category: 'CPU', title: 'Vanta Core X5', keySpec: '6C/12T · 4.9 GHz Boost', stockQty: 98, price: 14271.51 },
    { id: '7', sku: '0201-SSD', category: 'STORAGE', title: 'Fathom G4 1TB', keySpec: '7,000 MB/s Read', stockQty: 210, price: 6169.78 },
    { id: '8', sku: '0328-COOL', category: 'COOLING', title: 'Vanta Torrent 240', keySpec: '240mm Copper AIO', stockQty: 45, price: 6169.78 },
  ]);

  readonly products = this._products.asReadonly();

  getProduct(id: string): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  isLowStock(product: Product): boolean {
    return product.stockQty < LOW_STOCK_THRESHOLD;
  }

  updateProduct(id: string, changes: Partial<Pick<Product, 'stockQty' | 'price'>>): void {
    this._products.update((list) =>
      list.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  }

  deleteProduct(id: string): void {
    this._products.update((list) => list.filter((p) => p.id !== id));
  }
}
