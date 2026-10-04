import { Injectable, computed, signal } from '@angular/core';
import { Order, OrderStatus } from './transact.models';

const now = () => new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

const SEED: Order[] = [
  {
    id: 'VNT-240981',
    placedAt: 'Oct 4, 2026',
    status: 'PROCESSING',
    items: [
      {
        sku: '0118-MBO',
        name: 'Aegis B650M WiFi',
        category: 'MOTHERBOARD',
        price: 11400,
        qty: 1,
        serial: 'MB650-A91X-44021',
        specs: 'AM5 · mATX · DDR5 · WiFi 6E',
      },
      {
        sku: '0117-RAM',
        name: 'HyperPulse DDR5 RGB',
        category: 'RAM',
        price: 7950,
        qty: 1,
        serial: 'HP5-32G-77310',
        specs: '32GB (2×16) · 6000 MT/s · CL30',
      },
    ],
    bench: { thermal: 'PASS', speed: 'RUNNING', integrity: 'QUEUED' },
    timeline: [
      { label: 'Order placed', at: 'Oct 4, 2026 5:12 PM' },
      { label: 'Bench testing started', at: 'Oct 4, 2026 5:40 PM' },
    ],
  },
  {
    id: 'VNT-240955',
    placedAt: 'Oct 2, 2026',
    status: 'IN_TRANSIT',
    items: [
      {
        sku: '0204-GPU',
        name: 'Fathom G5 12GB',
        category: 'GPU',
        price: 28900,
        qty: 1,
        serial: 'FG5-12-00918',
        specs: '12GB GDDR6 · 3-fan · 250W TGP',
      },
    ],
    bench: { thermal: 'PASS', speed: 'PASS', integrity: 'PASS' },
    carrier: 'LBC Express',
    tracking: 'LBC-7741-2209-8815',
    eta: 'Oct 6, 2026 · by 6:00 PM',
    timeline: [
      { label: 'Order placed', at: 'Oct 2, 2026 9:01 AM' },
      { label: 'Bench passed', at: 'Oct 3, 2026 10:20 AM' },
      { label: 'Shipped', at: 'Oct 3, 2026 4:45 PM' },
    ],
  },
  {
    id: 'VNT-240871',
    placedAt: 'Sep 24, 2026',
    status: 'DELIVERED',
    items: [
      {
        sku: '0301-SSD',
        name: 'Torrent 360 2TB NVMe',
        category: 'SSD',
        price: 9800,
        qty: 1,
        serial: 'T360-2T-55402',
        specs: '2TB · PCIe 4.0 · 7,400 MB/s',
      },
    ],
    bench: { thermal: 'PASS', speed: 'PASS', integrity: 'PASS' },
    timeline: [
      { label: 'Order placed', at: 'Sep 24, 2026' },
      { label: 'Shipped', at: 'Sep 25, 2026' },
      { label: 'Delivered', at: 'Sep 27, 2026' },
    ],
  },
  {
    id: 'VNT-240802',
    placedAt: 'Sep 12, 2026',
    status: 'REFUNDED',
    items: [
      {
        sku: '0150-CPU',
        name: 'Boost 5.7 Ryzen-class CPU',
        category: 'CPU',
        price: 15200,
        qty: 1,
        serial: 'CP57-9921-0034',
        specs: '8C/16T · 5.7GHz boost · AM5',
      },
    ],
    bench: { thermal: 'PASS', speed: 'PASS', integrity: 'PASS' },
    timeline: [
      { label: 'Order placed', at: 'Sep 12, 2026' },
      { label: 'Delivered', at: 'Sep 15, 2026' },
      { label: 'Refund approved', at: 'Sep 19, 2026' },
    ],
  },
  {
    id: 'VNT-240760',
    placedAt: 'Sep 3, 2026',
    status: 'CANCELLED',
    items: [
      {
        sku: '0117-RAM',
        name: 'HyperPulse DDR5 RGB',
        category: 'RAM',
        price: 7950,
        qty: 2,
        serial: 'Unassigned',
        specs: '32GB (2×16) · 6000 MT/s · CL30',
      },
    ],
    bench: { thermal: 'QUEUED', speed: 'QUEUED', integrity: 'QUEUED' },
    timeline: [
      { label: 'Order placed', at: 'Sep 3, 2026' },
      { label: 'Cancelled by customer', at: 'Sep 3, 2026' },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class TransactStore {
  readonly orders = signal<Order[]>(SEED);

  readonly processing = computed(() => this.orders().filter((o) => o.status === 'PROCESSING'));
  readonly inTransit = computed(() => this.orders().filter((o) => o.status === 'IN_TRANSIT'));
  readonly history = computed(() =>
    this.orders().filter((o) => ['DELIVERED', 'REFUNDED', 'CANCELLED'].includes(o.status)),
  );

  private setStatus(id: string, status: OrderStatus, event: string) {
    this.orders.update((list) =>
      list.map((o) =>
        o.id === id ? { ...o, status, timeline: [...o.timeline, { label: event, at: now() }] } : o,
      ),
    );
  }

  cancel(id: string) {
    this.setStatus(id, 'CANCELLED', 'Cancelled by customer');
  }
  markDelivered(id: string) {
    this.setStatus(id, 'DELIVERED', 'Delivered');
  }
  requestRefund(id: string, reason: string, _note: string) {
    this.setStatus(id, 'REFUNDED', `Refund claim filed: ${reason}`);
  }
}
