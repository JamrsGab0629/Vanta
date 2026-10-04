import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TransactStore } from '../../../../transact.store';
import { Order, OrderStatus, TAX_RATE, subtotal, tax, total } from '../../../../transact.models';
import { VantaIconComponent } from '../../components/icons/vanta-icons.component';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, VantaIconComponent],
  template: `
    <div class="table" role="table" aria-label="Transaction history">
      <div class="grid head" role="row">
        <span>ORDER / DATE</span><span>ITEMS</span><span>TOTAL</span><span>STATUS</span><span>ACTIONS</span>
      </div>

      @for (o of store.history(); track o.id) {
        <div class="grid body" role="row">
          <span><b class="mono">{{ o.id }}</b><small>{{ o.placedAt }}</small></span>
          <span>
            {{ o.items[0].name }}
            @if (o.items.length > 1) { <small>+{{ o.items.length - 1 }} more</small> }
          </span>
          <span class="mono amount">{{ totalOf(o) | currency:'PHP':'symbol-narrow' }}</span>
          <span>
            @switch (o.status) {
              @case ('DELIVERED') { <em class="badge ok">DELIVERED</em> }
              @case ('REFUNDED') { <em class="badge copper">REFUNDED</em> }
              @default { <em class="badge err">CANCELLED</em> }
            }
          </span>
          <span><button class="btn-secondary" (click)="selected.set(o)"><vanta-icon name="eye" [size]="14" /> VIEW</button></span>
        </div>
      } @empty {
        <div class="empty">No finalized transactions yet.</div>
      }
    </div>

    @if (selected(); as o) {
      <div class="overlay" role="dialog" aria-modal="true" aria-labelledby="detail-title" (click)="selected.set(null)" (keydown.escape)="selected.set(null)">
        <div class="modal" (click)="$event.stopPropagation()">
          <header class="mrow">
            <div>
              <h2 id="detail-title">{{ o.id }}</h2>
              <em class="badge" [class]="badgeClass(o.status)">{{ o.status }}</em>
            </div>
            <button class="x" aria-label="Close" (click)="selected.set(null)"><vanta-icon name="close" /></button>
          </header>

          <section>
            <h3>HARDWARE</h3>
            @for (i of o.items; track i.sku) {
              <div class="item">
                <div><span class="sku">SKU · {{ i.sku }}</span><b>{{ i.name }}</b><small>{{ i.specs }}</small>
                  <small>Serial: <span class="mono">{{ i.serial }}</span></small></div>
                <div class="mono right">{{ i.price * i.qty | currency:'PHP':'symbol-narrow' }}<small>qty {{ i.qty }}</small></div>
              </div>
            }
          </section>

          <section class="sums">
            <div><span>Subtotal</span><span class="mono">{{ subtotalOf(o) | currency:'PHP':'symbol-narrow' }}</span></div>
            <div><span>Tax ({{ rate * 100 }}%)</span><span class="mono">{{ taxOf(o) | currency:'PHP':'symbol-narrow' }}</span></div>
            <div class="grand"><span>Total</span><span class="mono">{{ totalOf(o) | currency:'PHP':'symbol-narrow' }}</span></div>
          </section>

          <section>
            <h3>TIMELINE</h3>
            <ol class="timeline">
              @for (e of o.timeline; track $index) {
                <li><span class="pip"></span><b>{{ e.label }}</b><small>{{ e.at }}</small></li>
              }
            </ol>
          </section>
        </div>
      </div>
    }
  `,
  styles: `
    :host { color: var(--text); font-family: var(--body); display: block; }
    .table { border: 1px solid var(--border); background: var(--panel); }
    .grid { display: grid; grid-template-columns: var(--history-grid-cols); gap: 16px; padding: 16px 20px; align-items: center; }
    .head { font-family: var(--font-mono); font-size: 11px; letter-spacing: 1px; color: var(--text-dim); background: var(--bg-raised); border-bottom: 1px solid var(--border); }
    .body { border-bottom: 1px solid var(--border-soft); font-size: 14px; }
    .body:last-child { border-bottom: 0; }
    .body:hover { background: var(--panel2); }
    small { display: block; color: var(--text-dim); font-family: var(--font-mono); font-size: 11px; margin-top: 3px; }
    .mono { font-family: var(--font-mono); }
    .amount { color: var(--bone); }
    .badge { font-style: normal; font-family: var(--font-mono); font-size: 11px; letter-spacing: 1px; padding: 4px 8px; border: 1px solid; display: inline-block; }
    .badge.ok, .badge.DELIVERED { color: var(--ok); border-color: var(--ok); background: color-mix(in srgb, var(--green) 10%, transparent); }
    .badge.copper, .badge.REFUNDED { color: var(--copper); border-color: var(--copper); background: var(--copper-soft); }
    .badge.err, .badge.CANCELLED { color: var(--error); border-color: var(--error); background: color-mix(in srgb, var(--red) 10%, transparent); }
    .empty { padding: 48px; text-align: center; color: var(--text-dim); font-family: var(--font-mono); }

    .overlay { background: rgba(11, 11, 12, 0.88); backdrop-filter: blur(8px); position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 24px; overflow-y: auto; }
    .modal { width: min(620px, 100%); background: var(--panel); border: 1px solid var(--border); padding: 28px; display: grid; gap: 24px; }
    .mrow { display: flex; justify-content: space-between; align-items: flex-start; }
    h2 { font-family: var(--font-mono); font-size: 20px; margin: 0 0 8px; }
    h3 { font-family: var(--font-mono); font-size: 11px; letter-spacing: 1px; color: var(--text-dim); margin: 0 0 10px; font-weight: 500; }
    .x { background: none; border: 1px solid var(--border); color: var(--text-dim); padding: 6px; cursor: pointer; }
    .x:hover { color: var(--copper); border-color: var(--copper); }
    .item { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-top: 1px solid var(--border-soft); }
    .item b { display: block; margin: 2px 0; } .sku { font-family: var(--font-mono); font-size: 11px; color: var(--copper); }
    .right { text-align: right; }
    .sums { background: var(--bg-raised); border: 1px solid var(--border); padding: 14px; display: grid; gap: 8px; font-size: 14px; }
    .sums div { display: flex; justify-content: space-between; }
    .grand { border-top: 1px solid var(--border); padding-top: 10px; color: var(--copper); font-weight: 700; font-size: 16px; }
    .timeline { list-style: none; margin: 0; padding: 0 0 0 14px; border-left: 1px solid var(--border); display: grid; gap: 14px; }
    .timeline li { position: relative; padding-left: 14px; }
    .pip { position: absolute; left: -19px; top: 5px; width: 9px; height: 9px; background: var(--copper); }

    @media (max-width: 860px) {
      .table { overflow-x: auto; } .grid { min-width: 760px; }
    }
  `,
})
export class TransactionHistoryComponent {
  readonly store = inject(TransactStore);
  readonly selected = signal<Order | null>(null);
  readonly rate = TAX_RATE;
  readonly totalOf = total;
  readonly taxOf = tax;
  readonly subtotalOf = subtotal;

  badgeClass(s: OrderStatus) { return s; }
}
