import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { VantaIconComponent } from '../../components/icons/vanta-icons.component';
import { TransactionService } from '../../helpers/transaction/transaction.service';
import { TransactionModel } from '../../helpers/transaction/transaction.interface';

// Helper functions declared directly inside the main file
function toNumber(val: unknown, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return Number.isNaN(num) ? fallback : num;
}

function calcItemTotal(price: unknown, quantity: unknown): number {
  return toNumber(price) * toNumber(quantity);
}

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, VantaIconComponent],
  template: `
    <div class="table" role="table" aria-label="Transaction history">
      <div class="grid head" role="row">
        <span>TRANSACTION / ORDER</span>
        <span>ITEMS</span>
        <span>TOTAL</span>
        <span>STATUS</span>
        <span>ACTIONS</span>
      </div>

      @for (t of transactions(); track t.transaction_id) {
        <div class="grid body" role="row">
          <span>
            <b class="mono">#{{ t.transaction_id }}</b>
            <small>Order #{{ t.Receipt.order_id }}</small>
          </span>
          <span class="item-summary">
            @if (t.Receipt.Order.items.length > 0) {
              <img
                class="row-thumb"
                [src]="getImageUrl(t.Receipt.Order.items[0].product.image_url)"
                [alt]="t.Receipt.Order.items[0].product.name"
              />
              <span class="item-text">
                {{ t.Receipt.Order.items[0].product.name }}
                @if (t.Receipt.Order.items.length > 1) {
                  <small>+{{ toNumber(t.Receipt.Order.items.length) - 1 }} more</small>
                }
              </span>
            }
          </span>
          <span class="mono amount">{{
            toNumber(t.Receipt.total_price) | currency: 'PHP' : 'symbol-narrow'
          }}</span>
          <span>
            <em class="badge" [class]="badgeClass(t.status)">
              {{ t.status }}
            </em>
          </span>
          <span>
            <button class="btn-secondary" (click)="viewDetails(t)">
              <vanta-icon name="eye" [size]="14" /> VIEW
            </button>
          </span>
        </div>
      } @empty {
        <div class="empty">No finalized transactions yet.</div>
      }
    </div>

    @if (selected(); as t) {
      <div
        class="overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        (click)="closeDetails()"
        (keydown.escape)="closeDetails()"
      >
        <div class="modal" (click)="$event.stopPropagation()">
          <header class="mrow">
            <div>
              <h2 id="detail-title">Transaction #{{ t.transaction_id }}</h2>
              <em class="badge" [class]="badgeClass(t.status)">{{ t.status }}</em>
            </div>
            <button class="x" aria-label="Close" (click)="closeDetails()">
              <vanta-icon name="close" />
            </button>
          </header>

          <section>
            <h3>TELEMETRY</h3>
            <dl class="telemetry">
              <div>
                <dt>ORDER ID</dt>
                <dd>#{{ t.Receipt.order_id }}</dd>
              </div>
              <div>
                <dt>TRACKING NO.</dt>
                <dd class="copper">{{ t.tracking_code }}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3>HARDWARE</h3>
            @for (item of t.Receipt.Order.items; track item.order_item_id) {
              <div class="item">
                <div class="product-thumb">
                  <img
                    class="row-thumb"
                    [src]="getImageUrl(item.product.image_url)"
                    [alt]="item.product.name"
                  />
                </div>
                <div class="item-info">
                  <span class="sku">SKU · {{ item.product.sku }}</span>
                  <b>{{ item.product.name }}</b>
                </div>
                <div class="mono right">
                  {{ calcItemTotal(item.price, item.quantity) | currency: 'PHP' : 'symbol-narrow' }}
                  <small>qty {{ toNumber(item.quantity) }}</small>
                </div>
              </div>
            }
          </section>

          <section class="sums">
            <div class="grand">
              <span>Total Amount</span>
              <span class="mono">{{
                toNumber(t.Receipt.total_price) | currency: 'PHP' : 'symbol-narrow'
              }}</span>
            </div>
          </section>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      color: var(--text);
      font-family: var(--body);
      display: block;
    }
    .table {
      border: 1px solid var(--border);
      background: var(--panel);
    }
    .grid {
      display: grid;
      grid-template-columns: 1.2fr 2fr 1.2fr 1fr 100px;
      gap: 16px;
      padding: 16px 20px;
      align-items: center;
    }
    .head {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 1px;
      color: var(--text-dim);
      background: var(--bg-raised);
      border-bottom: 1px solid var(--border);
    }
    .body {
      border-bottom: 1px solid var(--border-soft);
      font-size: 14px;
    }
    .body:last-child {
      border-bottom: 0;
    }
    .body:hover {
      background: var(--panel2);
    }
    small {
      display: block;
      color: var(--text-dim);
      font-family: var(--font-mono);
      font-size: 11px;
      margin-top: 3px;
    }
    .mono {
      font-family: var(--font-mono);
    }
    .amount {
      color: var(--bone);
    }
    .item-summary {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .row-thumb {
      width: 36px;
      height: 36px;
      object-fit: cover;
      background: var(--bg-raised);
      border: 1px solid var(--border);
      flex-shrink: 0;
    }
    .badge {
      font-style: normal;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 1px;
      padding: 4px 8px;
      border: 1px solid var(--border);
      display: inline-block;
      text-transform: uppercase;
    }
    .badge.delivered,
    .badge.completed {
      color: var(--ok);
      border-color: var(--ok);
      background: color-mix(in srgb, var(--green) 10%, transparent);
    }
    .badge.refunded,
    .badge.processing,
    .badge.delivering {
      color: var(--copper);
      border-color: var(--copper);
      background: var(--copper-soft);
    }
    .badge.cancelled,
    .badge.failed {
      color: var(--error);
      border-color: var(--error);
      background: color-mix(in srgb, var(--red) 10%, transparent);
    }
    .empty {
      padding: 48px;
      text-align: center;
      color: var(--text-dim);
      font-family: var(--font-mono);
    }

    .overlay {
      background: rgba(11, 11, 12, 0.88);
      backdrop-filter: blur(8px);
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: grid;
      place-items: center;
      padding: 24px;
      overflow-y: auto;
    }
    .modal {
      width: min(620px, 100%);
      background: var(--panel);
      border: 1px solid var(--border);
      padding: 28px;
      display: grid;
      gap: 24px;
    }
    .mrow {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    h2 {
      font-family: var(--font-mono);
      font-size: 20px;
      margin: 0 0 8px;
    }
    h3 {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 1px;
      color: var(--text-dim);
      margin: 0 0 10px;
      font-weight: 500;
    }
    .x {
      background: none;
      border: 1px solid var(--border);
      color: var(--text-dim);
      padding: 6px;
      cursor: pointer;
    }
    .x:hover {
      color: var(--copper);
      border-color: var(--copper);
    }
    .telemetry {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
      margin: 0;
    }
    .telemetry div {
      background: var(--bg-raised);
      padding: 12px;
    }
    dt {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--text-dim);
    }
    dd {
      margin: 4px 0 0;
      font-family: var(--font-mono);
      font-size: 13px;
    }
    dd.copper {
      color: var(--copper);
    }
    .item {
      display: grid;
      grid-template-columns: 48px 1fr auto;
      gap: 14px;
      align-items: center;
      padding: 12px 0;
      border-top: 1px solid var(--border-soft);
    }
    .product-thumb {
      width: 48px;
      height: 48px;
      background: var(--bg-raised);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .product-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .item-info b {
      display: block;
      margin: 2px 0;
      font-size: 14px;
    }
    .sku {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--copper);
    }
    .right {
      text-align: right;
    }
    .sums {
      background: var(--bg-raised);
      border: 1px solid var(--border);
      padding: 14px;
      display: grid;
      gap: 8px;
      font-size: 14px;
    }
    .grand {
      display: flex;
      justify-content: space-between;
      color: var(--copper);
      font-weight: 700;
      font-size: 16px;
    }

    @media (max-width: 860px) {
      .table {
        overflow-x: auto;
      }
      .grid {
        min-width: 760px;
      }
    }
  `,
})
export class TransactionHistoryComponent implements OnInit {
  private transactionService = inject(TransactionService);

  readonly transactions = signal<TransactionModel[]>([]);
  readonly selected = signal<TransactionModel | null>(null);

  // Expose helpers to template scope
  readonly toNumber = toNumber;
  readonly calcItemTotal = calcItemTotal;

  async ngOnInit() {
    await this.loadTransactions();
  }

  async loadTransactions() {
    try {
      const data = await this.transactionService.getAllTransaction({ status: 'ALL' });
      this.transactions.set(data);
    } catch (err) {
      console.error('Error loading transaction history:', err);
    }
  }

  viewDetails(t: TransactionModel) {
    this.selected.set(t);
  }

  closeDetails() {
    this.selected.set(null);
  }

  badgeClass(status: string): string {
    return status.toLowerCase();
  }

  getImageUrl(path: string | null | undefined, label = 'GPU'): string {
    if (path) {
      return `http://localhost:3000${path}`;
    }

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#161616"/>
      <line x1="0" y1="100" x2="100" y2="0" stroke="#d97736" stroke-width="7"/>
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#607080" font-family="monospace" font-size="12" font-weight="600" letter-spacing="1">${label}</text>
    </svg>
    `;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}
