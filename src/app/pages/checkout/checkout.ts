import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Stage } from '../../components/app/stage/stage';
import { CartService } from '../../helpers/cart/cart.service';
import { TransactionService } from '../../helpers/transaction/transaction.service';
import { TransactionInformation } from '../../helpers/transaction/transaction.interface';
import { UserService } from '../../helpers/user/user.service';
import { Transaction } from '../../core/transaction';

interface ShippingRate {
  fee: number;
  delivery: string;
}

interface UserInfoData {
  first_name: string;
  last_name: string;
  contact_no: string;
  address: string;
  city: string;
  province: string;
}

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
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private transaction = inject(Transaction)

  items = signal<any[]>([]);
  shipping = signal<number>(150.0);
  estimatedDelivery = signal<string>('3 to 5 business days (Rest of Luzon)');

  readonly taxRate = 0.12;

  private readonly shippingZones: Record<string, ShippingRate> = {
    bulacan: { fee: 80.0, delivery: '1 to 2 business days (Local Delivery)' },
    manila: { fee: 120.0, delivery: '2 to 3 business days (Metro Manila)' },
    'quezon city': { fee: 120.0, delivery: '2 to 3 business days (Metro Manila)' },
    caloocan: { fee: 120.0, delivery: '2 to 3 business days (Metro Manila)' },
    makati: { fee: 120.0, delivery: '2 to 3 business days (Metro Manila)' },
    pasig: { fee: 120.0, delivery: '2 to 3 business days (Metro Manila)' },
    ncr: { fee: 120.0, delivery: '2 to 3 business days (Metro Manila)' },
    cebu: { fee: 250.0, delivery: '5 to 7 business days (Visayas/Mindanao)' },
    davao: { fee: 250.0, delivery: '5 to 7 business days (Visayas/Mindanao)' },
    visayas: { fee: 250.0, delivery: '5 to 7 business days (Visayas/Mindanao)' },
    mindanao: { fee: 250.0, delivery: '5 to 7 business days (Visayas/Mindanao)' },
  };

  private readonly defaultShipping: ShippingRate = {
    fee: 150.0,
    delivery: '3 to 5 business days (Rest of Luzon)',
  };

  subtotal = computed(() =>
    this.items().reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0,
    ),
  );

  tax = computed(() => this.subtotal() * this.taxRate);

  total = computed(() => this.subtotal() + this.shipping() + this.tax());

  itemCount = computed(() =>
    this.items().reduce((acc, item) => acc + (Number(item.quantity) || 1), 0),
  );

  checkoutForm: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    phone_number: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    province: ['', Validators.required],
    is_permanent: [false],
  });

  ngOnInit() {
    this.loadCart();
    this.loadUserInfo();

    this.checkoutForm.valueChanges.subscribe((values) => {
      const fullAddress =
        `${values.address || ''} ${values.city || ''} ${values.province || ''}`.toLowerCase();

      let matchedRate = this.defaultShipping;

      for (const [keyword, rate] of Object.entries(this.shippingZones)) {
        if (fullAddress.includes(keyword)) {
          matchedRate = rate;
          break;
        }
      }

      this.shipping.set(matchedRate.fee);
      this.estimatedDelivery.set(matchedRate.delivery);
    });
  }

  async loadCart() {
    try {
      const response: any = await this.cartService.getCart();
      this.items.set(response?.items || []);
    } catch (error) {
      console.error('Failed to load cart items', error);
      this.items.set([]);
    }
  }

  async loadUserInfo() {
    try {
      const response: UserInfoData = await this.userService.fetchUserData();
      this.checkoutForm.patchValue({
        first_name: response.first_name,
        last_name: response.last_name,
        phone_number: response.contact_no,
        address: response.address,
        city: response.city,
        province: response.province,
      });
    } catch (error) {
      console.error('Failed to load user info', error);
    }
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
        address: `${formValues.address}, ${formValues.city}, ${formValues.province}`,
        contact_number: formValues.phone_number,
        save_address: formValues.is_permanent,
      };

      const response = await this.transactionService.completeTransaction(transactionData);

      // Construct the full information payload with response data (fixed missing fee value)
      const completeInformation = {
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        contact_no: formValues.phone_number,
        address: formValues.address,
        city: formValues.city,
        province: formValues.province,
        fee: this.shipping(),
        estimate_time: this.estimatedDelivery(),
        code: response?.tracking_code ?? 'N/A',
      };

      this.transaction.setInformation(completeInformation);
      this.transaction.setItems(this.items());

      this.router.navigate(['../confirmation'], { relativeTo: this.route });
    } catch (error) {
      console.error('Transaction failed', error);
    }
  }
}