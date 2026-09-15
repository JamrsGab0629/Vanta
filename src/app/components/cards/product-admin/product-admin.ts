import { Component, input, output, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-admin',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-admin.html',
  styleUrl: './product-admin.css',
})
export class ProductAdmin {
  id = input.required<string | number>();
  sku = input.required<string>();
  name = input.required<string>();
  category = input.required<string>();
  price = input.required<number>();
  stock_quantity = input.required<number>();

  // Updated types to accept undefined:
  description = input<string | null | undefined>(null);
  image_url = input<string | null | undefined>(null);
  is_active = input<boolean>(true);
  specs = input<Record<string, string | number> | null | undefined>(null);
  bench_status = input<{ status?: 'Pending' | 'Passed' | 'Failed' } | null | undefined>(null);

  edit = output<string | number>();

  // TODO: replace with your actual backend origin (or pull from environment.ts)
  private apiOrigin = 'http://localhost:3000';

  fullImageUrl = computed(() => {
    const url = this.image_url();
    if (!url) return '';
    return url.startsWith('http') ? url : `${this.apiOrigin}${url}`;
  });

  onEdit(): void {
    this.edit.emit(this.id());
  }
}