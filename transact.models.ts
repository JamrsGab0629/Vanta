export type OrderStatus = 'PROCESSING' | 'IN_TRANSIT' | 'DELIVERED' | 'REFUNDED' | 'CANCELLED';
export type BenchState = 'PASS' | 'RUNNING' | 'QUEUED';

export interface OrderItem {
  sku: string;
  name: string;
  category: string;
  price: number;
  qty: number;
  serial: string;
  specs: string;
}

export interface TimelineEvent { label: string; at: string; }

export interface Order {
  id: string;
  placedAt: string;
  status: OrderStatus;
  items: OrderItem[];
  bench: { thermal: BenchState; speed: BenchState; integrity: BenchState };
  carrier?: string;
  tracking?: string;
  eta?: string;
  timeline: TimelineEvent[];
}

export const TAX_RATE = 0.12;
// Prices in the cart are tax-exclusive: ₱19,350 + 12% = ₱21,672
export const subtotal = (o: Order) => o.items.reduce((s, i) => s + i.price * i.qty, 0);
export const tax = (o: Order) => Math.round(subtotal(o) * TAX_RATE * 100) / 100;
export const total = (o: Order) => subtotal(o) + tax(o);

export const REFUND_REASONS = ['Defective Hardware', 'Damaged Package', 'Missing Components'] as const;
