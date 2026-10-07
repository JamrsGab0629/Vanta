import { inject, Injectable } from '@angular/core';
import { CoreService } from '../core.service';
import { FetchShippingRates, ShippingRate } from './shipping.interface';

@Injectable({ providedIn: 'root' })
export class ShippingService {
  private core = inject(CoreService);

  // Every province we deliver to, with its fee and delivery estimate
  async getRates(): Promise<ShippingRate[]> {
    const res = await this.core.fetcher<FetchShippingRates>('/api/checkout/shipping-rates', 'GET');
    return res.rates ?? [];
  }
}