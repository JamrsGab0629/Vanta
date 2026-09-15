import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { Product } from '../../components/cards/product/product';
import { ProductService } from '../../helpers/product/product.service';
import { CartService } from '../../helpers/cart/cart.service';
import { ToastService } from '../../helpers/toast/toast.service';
import { ConfirmService } from '../../helpers/confirm/confirm.service';

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
  private cartService = inject(CartService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('productSection') productSection!: ElementRef;

  categories: string[] = ['ALL', 'GPU', 'CPU', 'SSD', 'RAM', 'MOTHERBOARD'];
  selectedCategory: string = 'ALL';
  products: ProductItem[] = [];

  ngOnInit(): void {
    this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    try {
      const data = await this.productService.getProducts();
      this.products = data.products ?? data;
      this.cdr.markForCheck();
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

  scrollToProducts(): void {
    this.productSection?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  async onAddCart(productId: string | number): Promise<void> {
    const confirmed = await this.confirmService.ask('Add this product to your cart?');
    if (!confirmed) return;

    try {
      await this.cartService.addToCart(String(productId), 1);
      this.toastService.show('Added to cart', 'success');
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      this.toastService.show("Couldn't add to cart — try again", 'error');
    }
  }
}