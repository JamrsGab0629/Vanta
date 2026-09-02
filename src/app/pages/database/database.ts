import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductAdmin } from '../../components/cards/product-admin/product-admin';
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

  // Edit Modal Signals
  isEditModalOpen = signal<boolean>(false);
  activeProduct = signal<ProductItem | null>(null);
  tempPrice = signal<number>(0);
  tempQuantityToAdd = signal<number>(0);

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
      const response = await this.productService.getProducts();
      this.products.set(Array.isArray(response) ? response : (response as any).products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  // Opens the modal when the pencil icon is clicked
  onEditProduct(productId: string | number): void {
    console.log(productId);
    const product = this.products().find((p) => {
      // console.log(p.product_id);
      p.product_id  === productId;
    });
    if (product) {
      this.activeProduct.set(product);
      this.tempPrice.set(product.price);
      this.tempQuantityToAdd.set(0);
      this.isEditModalOpen.set(true);
    }
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.activeProduct.set(null);
  }

  saveProductEdit(): void {
    const prod = this.activeProduct();
    if (prod) {
      this.products.update((list) =>
        list.map((p) => {
          if (p.product_id === prod.product_id) {
            return {
              ...p,
              price: Number(this.tempPrice()),
              stock_quantity: p.stock_quantity + Number(this.tempQuantityToAdd() || 0),
            };
          }
          return p;
        })
      );
    }
    this.closeEditModal();
  }

  deleteProduct(): void {
    const prod = this.activeProduct();
    if (prod && confirm(`Are you sure you want to delete ${prod.name}?`)) {
      this.products.update((list) => list.filter((p) => p.product_id !== prod.product_id));
      this.closeEditModal();
    }
  }
}