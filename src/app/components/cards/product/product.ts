import { Component, input, output } from '@angular/core';
import { CommonModule, KeyValuePipe, CurrencyPipe } from '@angular/common';

export interface BenchStatus {
  status?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, KeyValuePipe, CurrencyPipe],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product {
  // Required Inputs
  id = input.required<string | number>();
  sku = input.required<string>();
  name = input.required<string>();
  category = input.required<string>();
  price = input.required<number>();
  stock_quantity = input.required<number>();

  // Optional Inputs
  description = input<string | null>(null);
  image_url = input<string | null>(null);
  specs = input<Record<string, any> | null>(null);
  bench_status = input<BenchStatus | null>(null);
  is_active = input<boolean>(true);

  // Outputs (Events)
  add_to_cart = output<{ id: string | number; quantity: number }>();

  // Handlers
  onAddToCart(): void {
    this.add_to_cart.emit({ id: this.id(), quantity: 1 });
  }
}