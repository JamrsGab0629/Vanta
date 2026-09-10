import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Stage } from '../../components/app/stage/stage';
import { Transaction } from '../../core/transaction';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, Stage],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.css',
})
export class Confirmation {
  readonly transaction = inject(Transaction);
  private readonly router = inject(Router);

  readonly info = () => this.transaction.getInformation();
  readonly items = () => this.transaction.items();

  readonly subtotal = computed(() =>
    this.items().reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0,
    ),
  );

  readonly shippingFee = computed(() => Number(this.info()?.fee) || 0);
  readonly tax = computed(() => this.subtotal() * 0.12);
  readonly totalPaid = computed(() => this.subtotal() + this.shippingFee() + this.tax());
  
  getItemTotal(item: any): number {
    console.log(this.info());
    return (Number(item.price) || 0) * (Number(item.quantity) || 1);
  }

  goToHome(): void {
    this.transaction.clear()
    this.router.navigate(['/app/home']);
  }
}