// checkout.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Stage } from "../../components/app/stage/stage";
import { CartService } from '../../helpers/cart/cart.service';
import { TransactionService } from '../../helpers/transaction/transaction.service';
import { TransactionInformation } from '../../helpers/transaction/transaction.interface';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Stage],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private transactionService = inject(TransactionService);

  items: any[] = [];

  checkoutForm: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone_number: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    province: ['', Validators.required],
    zip_code: ['', Validators.required],
    country: ['Philippines', Validators.required]
  });

  async ngOnInit() {
    try {
      const response: any = await this.cartService.getCart();
      this.items = response?.items || [];
    } catch (error) {
      console.error('Failed to load cart items', error);
      this.items = [];
    }
  }

  get subtotal(): number {
    return this.items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  }

  get shipping(): number {
    return 0;
  }

  get tax(): number {
    return this.subtotal * 0.08;
  }

  get total(): number {
    return this.subtotal + this.shipping + this.tax;
  }

  async onSubmit() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    try {
      const formValues = this.checkoutForm.value;
      const transactionData: TransactionInformation = {
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        email: formValues.email,
        address: `${formValues.address}, ${formValues.city}, ${formValues.province}`,
        zip_code: formValues.zip_code,
        phone_number: formValues.phone_number
      };

      await this.transactionService.completeTransaction(transactionData);
    } catch (error) {
      console.error('Transaction failed', error);
    }
  }
}
