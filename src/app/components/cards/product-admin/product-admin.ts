import { Component, input, output } from '@angular/core';
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

  onEdit(): void {
    this.edit.emit(this.id());
  }
}