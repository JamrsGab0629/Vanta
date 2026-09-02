import { Component, OnInit, inject } from '@angular/core';
import { Product } from '../../components/cards/product/product';
import { ProductService } from '../../helpers/product/product.service';

export interface ProductItem {
  product_id: string | number;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  description?: string | null;
  image_url?: string | null;
  specs?: Record<string, string | number> | null;
  bench_status?: { status?: 'Pending' | 'Passed' | 'Failed' } | null;
  is_active?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Product],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private productService = inject(ProductService);

  categories: string[] = ['ALL', 'CPU', 'MOTHERBOARD', 'SSD', 'RAM'];
  selectedCategory: string = 'ALL';
  products: ProductItem[] = [];

  ngOnInit(): void {
    this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    try {
      const data = await this.productService.getProducts();
      // If data is wrapped in an object (e.g. data.products), assign accordingly
      this.products = data.products ?? data;
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }
  get filteredProducts(): ProductItem[] {
    if (this.selectedCategory === 'ALL') {
      return this.products;
    }
    return this.products.filter(
      (p) => p.category?.toUpperCase() === this.selectedCategory.toUpperCase(),
    );
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  onAddCart(productId: string | number, event: any): void {
    // Instantly adds 1 unit
    console.log('Adding 1 unit of product to cart:', productId);
  }
}
