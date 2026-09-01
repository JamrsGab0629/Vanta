import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductAdmin } from '../../components/cards/product-admin/product-admin';
import { ProductService } from '../../helpers/product/product.service';

export interface ProductItem {
  id: string | number;
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
  selector: 'app-database',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductAdmin],
  templateUrl: './database.html',
  styleUrl: './database.css',
})
export class Database implements OnInit {
  private productService = inject(ProductService);

  products = signal<ProductItem[]>([]);
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('all');
  categories = signal<string[]>(["all", 'GPU', 'CPU', 'SSD', "RAM", "MOTHERBOARD"]);

  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();

    return this.products().filter((p) => {
      const matchesSearch =
        !query || p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
      const matchesCategory =
        category === 'all' || p.category.toLowerCase() === category.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  });

  ngOnInit(): void {
    this.fetchProducts();
  }

  async fetchProducts(): Promise<void> {
    try {
      // Handles Promise<FetchProductsOutput>
      const response = await this.productService.getProducts();
      // Adjust property access if response wraps products array (e.g., response.products)
      this.products.set(Array.isArray(response) ? response : (response as any).products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  onEditProduct(productId: string | number): void {
    alert("Edit in process");
    console.log('Edit product requested:', productId);
  }
}