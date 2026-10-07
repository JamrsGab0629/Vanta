import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Stage } from '../../components/app/stage/stage';
import { CartService } from '../../helpers/cart/cart.service';
import { TransactionService } from '../../helpers/transaction/transaction.service';
import { TransactionInformation } from '../../helpers/transaction/transaction.interface';
import { UserService } from '../../helpers/user/user.service';
import { ShippingService } from '../../helpers/shipping/shipping.service';
import { ShippingRate } from '../../helpers/shipping/shipping.interface';
import { Transaction } from '../../core/transaction';

interface UserInfoData {
  first_name: string;
  last_name: string;
  contact_no: string;
  address: string;
  city: string;
  province: string;
}

// Older saved addresses used city names in the province field
const LEGACY_METRO_MANILA = ['manila', 'quezon city', 'caloocan', 'makati', 'pasig', 'ncr', 'metro manila'];

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
  private shippingService = inject(ShippingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private transaction = inject(Transaction);

  items = signal<any[]>([]);

  readonly taxRate = 0.12;

  // Province list + fees come from the backend, so the price shown here
  // is always the same one the server charges.
  rates = signal<ShippingRate[]>([]);
  selectedProvince = signal<string>('');
  selectedRate = computed(
    () => this.rates().find((r) => r.province === this.selectedProvince()) ?? null,
  );
  shipping = computed(() => (this.items().length === 0 ? 0 : (this.selectedRate()?.fee ?? 0)));
  estimatedDelivery = computed(() => this.selectedRate()?.delivery ?? '—');

  // Province search box
  provinceQuery = signal<string>('');
  provinceOpen = signal<boolean>(false);
  activeIndex = signal<number>(0);

  filteredProvinces = computed(() => {
    const q = this.provinceQuery().trim().toLowerCase();
    const all = this.rates();
    if (!q) return all;

    const starts = (r: ShippingRate) => r.province.toLowerCase().startsWith(q);
    return all
      .filter((r) => r.province.toLowerCase().includes(q) || r.region.toLowerCase().includes(q))
      .sort((a, b) => Number(starts(b)) - Number(starts(a)));
  });

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
    barangay: ['', Validators.required],
    city: ['', Validators.required],
    province: ['', Validators.required],
    is_permanent: [false],
  });

  async ngOnInit() {
    // Keep the selected-province signal in step with the form
    this.checkoutForm.controls['province'].valueChanges.subscribe((value) =>
      this.selectedProvince.set(value ?? ''),
    );

    await Promise.all([this.loadCart(), this.loadRates()]);
    await this.loadUserInfo(); // after the rates, so a saved province can be matched
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

  async loadRates() {
    try {
      this.rates.set(await this.shippingService.getRates());
    } catch (error) {
      console.error('Failed to load shipping rates', error);
      this.errorMessage.set("Couldn't load shipping rates. Please refresh the page.");
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
        barangay: (response as any).barangay ?? '',
        city: response.city,
        province: this.matchSavedProvince(response.province),
      });
    } catch (error) {
      console.error('Failed to load user info', error);
    }
  }

  // Turns a saved province (maybe an old city name) into one from the list, or ''
  private matchSavedProvince(saved: string | null | undefined): string {
    const q = (saved ?? '').trim().toLowerCase();
    if (!q) return '';

    const exact = this.rates().find((r) => r.province.toLowerCase() === q);
    if (exact) return exact.province;

    if (LEGACY_METRO_MANILA.includes(q)) {
      return this.rates().find((r) => r.province.startsWith('Metro Manila'))?.province ?? '';
    }
    return '';
  }

  // ----- Province search box -----

  openProvince() {
    this.provinceQuery.set('');
    this.activeIndex.set(0);
    this.provinceOpen.set(true);
  }

  onProvinceInput(value: string) {
    this.provinceQuery.set(value);
    this.activeIndex.set(0);
    this.provinceOpen.set(true);
  }

  onProvinceKeydown(event: KeyboardEvent) {
    const list = this.filteredProvinces();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.provinceOpen.set(true);
        this.activeIndex.update((i) => Math.min(i + 1, list.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        if (this.provinceOpen() && list[this.activeIndex()]) {
          event.preventDefault(); // pick the province instead of submitting the form
          this.selectProvince(list[this.activeIndex()]);
        }
        break;
      case 'Escape':
        this.provinceOpen.set(false);
        break;
    }
  }

  selectProvince(rate: ShippingRate) {
    this.checkoutForm.controls['province'].setValue(rate.province);
    this.provinceOpen.set(false);
    this.provinceQuery.set('');
  }

  onProvinceBlur() {
    this.provinceOpen.set(false);
    this.checkoutForm.controls['province'].markAsTouched();
  }

  // ----- Checkout -----

  showConfirmModal = signal<boolean>(false);
  isProcessing = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onInitiateCheckout(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (this.items().length === 0) {
      this.errorMessage.set('Your cart is empty. Please add items before placing an order.');
      return;
    }

    this.errorMessage.set(null);
    this.showConfirmModal.set(true);
  }

  cancelCheckout(): void {
    this.showConfirmModal.set(false);
  }

  async confirmOrder(): Promise<void> {
    const formValues = this.checkoutForm.value;
    const transactionData: TransactionInformation = {
      first_name: formValues.first_name,
      last_name: formValues.last_name,
      address: `${formValues.address}, ${formValues.barangay}, ${formValues.city}, ${formValues.province}`,
      province: formValues.province,
      contact_number: formValues.phone_number,
      save_address: formValues.is_permanent,
    };

    this.showConfirmModal.set(false);
    this.errorMessage.set(null);
    this.isProcessing.set(true);

    try {
      const response = await this.transactionService.completeTransaction(transactionData);

      const completeInformation = {
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        contact_no: formValues.phone_number,
        address: formValues.address,
        barangay: formValues.barangay,
        city: formValues.city,
        province: formValues.province,
        fee: this.shipping(),
        estimate_time: this.estimatedDelivery(),
        code: response?.tracking_code ?? 'N/A',
      };

      this.transaction.setInformation(completeInformation);
      this.transaction.setItems(this.items());

      // Navigate to confirmation page
      await this.router.navigate(['../confirmation'], { relativeTo: this.route });
    } catch (error: any) {
      console.error('Transaction failed', error);
      this.errorMessage.set(error?.message || 'Transaction failed. Please try again.');
    } finally {
      this.isProcessing.set(false);
    }
  }
}