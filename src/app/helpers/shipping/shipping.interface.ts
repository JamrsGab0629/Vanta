export interface ShippingRate {
  province: string;
  region: string;
  fee: number;
  delivery: string;
}

export interface FetchShippingRates {
  success: boolean;
  rates: ShippingRate[];
}