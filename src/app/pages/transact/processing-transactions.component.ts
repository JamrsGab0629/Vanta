import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TransactStore } from '../../../../transact.store';
import { total } from '../../../../transact.models';
import { VantaIconComponent } from '../../components/icons/vanta-icons.component';

@Component({
  selector: 'app-processing-transactions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, VantaIconComponent],
  template: `
    @for (o of store.processing(); track o.id) {
      <article class="card">
        <header class="row top">
          <div>
            <div class="eyebrow">ORDER</div>
            <div class="id">{{ o.id }}</div>
            <div class="dim">Placed {{ o.placedAt }}</div>
          </div>
          <div class="amount">{{ totalOf(o) | currency:'PHP':'symbol-narrow' }}</div>
        </header>

        <ul class="items">
          @for (i of o.items; track i.sku) {
            <li>
              <span class="sku">SKU · {{ i.sku }}</span>
              <span class="name">{{ i.name }}</span>
              <span class="dim">{{ i.category }} × {{ i.qty }}</span>
            </li>
          }
        </ul>

        <div class="bench">
          @for (t of [['THERMAL', o.bench.thermal], ['SPEED', o.bench.speed], ['SYSTEM INTEGRITY', o.bench.integrity]]; track t[0]) {
            <div class="test" [class.pass]="t[1] === 'PASS'" [class.run]="t[1] === 'RUNNING'">
              <span class="dot"></span><span>{{ t[0] }}</span><b>{{ t[1] }}</b>
            </div>
          }
        </div>

        <footer class="row">
          @if (confirmId() === o.id) {
            <span class="warn"><vanta-icon name="warning" /> Cancel {{ o.id }}? This cannot be undone.</span>
            <span class="actions">
              <button class="btn-secondary" (click)="confirmId.set(null)">KEEP ORDER</button>
              <button class="btn-primary" (click)="confirmCancel(o.id)">YES, CANCEL</button>
            </span>
          } @else {
            <span class="dim">Bench testing in progress. Ships once all three checks pass.</span>
            <button class="btn-secondary btn-danger" (click)="confirmId.set(o.id)">
              <vanta-icon name="close" [size]="14" /> CANCEL TRANSACTION
            </button>
          }
        </footer>
      </article>
    } @empty {
      <div class="empty"><vanta-icon name="box" [size]="28" />
        <p>Nothing on the bench right now.</p></div>
    }
  `,
  styles: `
    :host { display: grid; gap: 20px; color: var(--text); font-family: var(--body); }
    .card { background: var(--panel); border: 1px solid var(--border); padding: 24px; display: grid; gap: 20px; }
    .row { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
    .top { align-items: flex-start; }
    .eyebrow, .sku, .dim { font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); letter-spacing: .5px; }
    .sku { color: var(--copper); }
    .id { font-family: var(--font-mono); font-size: 18px; font-weight: 600; margin: 2px 0; }
    .amount { font-family: var(--font-display); font-size: 24px; color: var(--copper); }
    .items { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--border-soft); }
    .items li { display: grid; grid-template-columns: 160px 1fr auto; gap: 16px; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--border-soft); }
    .name { font-weight: 600; font-size: 15px; }
    .bench { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); }
    .test { background: var(--bg-raised); padding: 12px 14px; display: flex; align-items: center; gap: 10px; font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); }
    .test b { margin-left: auto; font-weight: 600; }
    .dot { width: 7px; height: 7px; background: var(--text-faint); }
    .pass .dot { background: var(--ok); } .pass b { color: var(--ok); }
    .run .dot { background: var(--copper); animation: pulse 1.4s infinite; } .run b { color: var(--copper); }
    @keyframes pulse { 50% { opacity: .25; } }
    @media (prefers-reduced-motion: reduce) { .run .dot { animation: none; } }
    .warn { display: inline-flex; align-items: center; gap: 8px; color: var(--error); font-family: var(--font-mono); font-size: 12px; }
    .actions { display: flex; gap: 8px; }
    .empty { border: 1px dashed var(--border); padding: 64px 0; text-align: center; color: var(--text-dim); font-family: var(--font-mono); }
    @media (max-width: 640px) { .items li { grid-template-columns: 1fr; gap: 4px; } }
  `,
})
export class ProcessingTransactionsComponent {
  readonly store = inject(TransactStore);
  readonly confirmId = signal<string | null>(null);
  readonly totalOf = total;

  confirmCancel(id: string) { this.store.cancel(id); this.confirmId.set(null); }
}
