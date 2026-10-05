import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { VantaIconComponent } from '../../components/icons/vanta-icons.component';
import { TransactionService } from '../../helpers/transaction/transaction.service';
import { TransactionModel } from '../../helpers/transaction/transaction.interface';

@Component({
  selector: 'app-processing-transactions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, VantaIconComponent],
  template: `
    @for (t of transactions(); track t.transaction_id) {
      <article class="card">
        <header class="row top">
          <div>
            <div class="eyebrow">TRANSACTION</div>
            <div class="id">#{{ t.transaction_id }}</div>
            <div class="dim">ORDER #{{ t.Receipt.order_id }}</div>
          </div>
          <div class="amount">{{ t.Receipt.total_price | currency: 'PHP' : 'symbol-narrow' }}</div>
        </header>

        <dl class="telemetry">
          <div>
            <dt>TRACKING NO.</dt>
            <dd class="copper">{{ t.tracking_code }}</dd>
          </div>
          <div>
            <dt>STATUS</dt>
            <dd>{{ t.status }}</dd>
          </div>
        </dl>

        <ul class="items">
          @for (item of t.Receipt.Order.items; track item.order_item_id) {
            <li>
              <span class="sku">{{ item.product.sku }}</span>
              <span class="name">{{ item.product.name }}</span>
              <span class="dim">× {{ item.quantity }}</span>
            </li>
          }
        </ul>
      </article>
    } @empty {
      <div class="empty">
        <vanta-icon name="box" [size]="28" />
        <p>Nothing on the bench right now.</p>
      </div>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 20px;
      color: var(--text);
      font-family: var(--body);
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      padding: 24px;
      display: grid;
      gap: 20px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .top {
      align-items: flex-start;
    }
    .eyebrow,
    .sku,
    .dim,
    dt {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-dim);
      letter-spacing: 0.5px;
    }
    .sku {
      color: var(--copper);
    }
    .id {
      font-family: var(--font-mono);
      font-size: 18px;
      font-weight: 600;
      margin: 2px 0;
    }
    .amount {
      font-family: var(--font-display);
      font-size: 24px;
      color: var(--copper);
    }
    .telemetry {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
      margin: 0;
    }
    .telemetry div {
      background: var(--bg-raised);
      padding: 14px;
    }
    dd {
      margin: 6px 0 0;
      font-family: var(--font-mono);
      font-size: 14px;
    }
    dd.copper {
      color: var(--copper);
    }
    .items {
      list-style: none;
      margin: 0;
      padding: 0;
      border-top: 1px solid var(--border-soft);
    }
    .items li {
      display: grid;
      grid-template-columns: 160px 1fr auto;
      gap: 16px;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid var(--border-soft);
    }
    .name {
      font-weight: 600;
      font-size: 15px;
    }
    .empty {
      border: 1px dashed var(--border);
      padding: 64px 0;
      text-align: center;
      color: var(--text-dim);
      font-family: var(--font-mono);
    }
    @media (max-width: 640px) {
      .items li {
        grid-template-columns: 1fr;
        gap: 4px;
      }
    }
  `,
})
export class ProcessingTransactionsComponent implements OnInit {
  private transactionService = inject(TransactionService);
  readonly transactions = signal<TransactionModel[]>([]);

  async ngOnInit() {
    try {
      const data = await this.transactionService.getAllTransaction({ status: 'pending' });
      this.transactions.set(data);
    } catch (err) {
      console.error('Error loading processing transactions:', err);
    }
  }
}