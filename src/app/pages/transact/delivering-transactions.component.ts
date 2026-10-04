import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactStore } from '../../../../transact.store';
import { Order, REFUND_REASONS, total } from '../../../../transact.models';
import { VantaIconComponent } from '../../components/icons/vanta-icons.component';

@Component({
  selector: 'app-delivering-transactions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, FormsModule, VantaIconComponent],
  template: `
    @for (o of store.inTransit(); track o.id) {
      <article class="card">
        <header class="row">
          <div>
            <div class="eyebrow">ORDER</div>
            <div class="id">{{ o.id }}</div>
          </div>
          <div class="amount">{{ totalOf(o) | currency: 'PHP' : 'symbol-narrow' }}</div>
        </header>

        <dl class="telemetry">
          <div>
            <dt>CARRIER</dt>
            <dd>{{ o.carrier }}</dd>
          </div>
          <div>
            <dt>TRACKING NO.</dt>
            <dd class="copper">{{ o.tracking }}</dd>
          </div>
          <div>
            <dt>ESTIMATED ARRIVAL</dt>
            <dd>{{ o.eta }}</dd>
          </div>
        </dl>

        <ul class="items">
          @for (i of o.items; track i.sku) {
            <li>
              <span class="sku">{{ i.sku }}</span
              ><span>{{ i.name }}</span
              ><span class="dim">× {{ i.qty }}</span>
            </li>
          }
        </ul>

        <footer class="row">
          <button class="btn-secondary" (click)="store.markDelivered(o.id)">
            <vanta-icon name="check" [size]="14" /> SIMULATE DELIVERY COMPLETE
          </button>
          <button class="btn-primary" (click)="openRefund(o)">REQUEST REFUND</button>
        </footer>
      </article>
    } @empty {
      <div class="empty">
        <vanta-icon name="truck" [size]="28" />
        <p>No packages on the road.</p>
      </div>
    }

    @if (refundOrder(); as o) {
      <div
        class="overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-title"
        (click)="dismiss()"
        (keydown.escape)="dismiss()"
      >
        <div class="modal" (click)="$event.stopPropagation()">
          <header class="row">
            <h2 id="refund-title">Request a refund</h2>
            <button class="x" aria-label="Close" (click)="dismiss()">
              <vanta-icon name="close" />
            </button>
          </header>

          <div class="summary">
            <div class="eyebrow">{{ o.id }} · {{ o.tracking }}</div>
            @for (i of o.items; track i.sku) {
              <div class="line">
                <span class="sku">{{ i.sku }}</span
                ><span>{{ i.name }}</span> <span class="dim">S/N {{ i.serial }}</span>
              </div>
            }
            <div class="line tot">
              <span>Order total</span><b>{{ totalOf(o) | currency: 'PHP' : 'symbol-narrow' }}</b>
            </div>
          </div>

          <fieldset>
            <legend>Reason</legend>
            @for (r of reasons; track r) {
              <label class="radio" [class.on]="reason() === r">
                <input
                  type="radio"
                  name="reason"
                  [value]="r"
                  [checked]="reason() === r"
                  (change)="reason.set(r)"
                />
                {{ r }}
              </label>
            }
          </fieldset>

          <label class="field">
            <span>What happened?</span>
            <textarea
              rows="4"
              [ngModel]="note()"
              (ngModelChange)="note.set($event)"
              placeholder="Describe the issue, e.g. bent pins on arrival, fan noise at idle."
            ></textarea>
          </label>

          @if (!canSubmit()) {
            <p class="hint">
              <vanta-icon name="warning" [size]="14" /> Pick a reason and add at least 10
              characters.
            </p>
          }

          <footer class="row end">
            <button class="btn-secondary" (click)="dismiss()">DISMISS</button>
            <button class="btn-primary" [disabled]="!canSubmit()" (click)="submit(o)">
              SUBMIT CLAIM
            </button>
          </footer>
        </div>
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
    .row.end {
      justify-content: flex-end;
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
    }
    .items li {
      display: grid;
      grid-template-columns: 120px 1fr auto;
      gap: 16px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-soft);
    }
    .empty {
      border: 1px dashed var(--border);
      padding: 64px 0;
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
      width: min(560px, 100%);
      background: var(--panel);
      border: 1px solid var(--border);
      padding: 28px;
      display: grid;
      gap: 20px;
    }
    h2 {
      font-family: var(--font-display);
      font-size: 20px;
      margin: 0;
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
    .summary {
      background: var(--bg-raised);
      border: 1px solid var(--border);
      padding: 14px;
      display: grid;
      gap: 8px;
    }
    .line {
      display: grid;
      grid-template-columns: 90px 1fr auto;
      gap: 12px;
      font-size: 14px;
    }
    .line.tot {
      grid-template-columns: 1fr auto;
      border-top: 1px solid var(--border-soft);
      padding-top: 8px;
    }
    fieldset {
      border: 0;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 8px;
    }
    legend,
    .field span {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-dim);
      letter-spacing: 1px;
      margin-bottom: 8px;
      padding: 0;
    }
    .radio {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border: 1px solid var(--border);
      cursor: pointer;
      font-size: 14px;
    }
    .radio.on {
      border-color: var(--copper);
      background: var(--copper-soft);
    }
    .radio input {
      accent-color: var(--copper);
    }
    .field {
      display: grid;
    }
    textarea {
      background: var(--panel);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--body);
      font-size: 14px;
      padding: 12px;
      resize: vertical;
    }
    textarea:focus {
      outline: none;
      border-color: var(--copper);
    }
    .hint {
      margin: 0;
      display: flex;
      gap: 6px;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-dim);
    }
    .btn-primary:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,
})
export class DeliveringTransactionsComponent {
  readonly store = inject(TransactStore);
  readonly reasons = REFUND_REASONS;
  readonly totalOf = total;

  readonly refundOrder = signal<Order | null>(null);
  readonly reason = signal<string>('');
  readonly note = signal('');
  readonly canSubmit = computed(() => !!this.reason() && this.note().trim().length >= 10);

  openRefund(o: Order) {
    this.refundOrder.set(o);
  }
  dismiss() {
    this.refundOrder.set(null);
    this.reason.set('');
    this.note.set('');
  }
  submit(o: Order) {
    if (!this.canSubmit()) return;
    this.store.requestRefund(o.id, this.reason(), this.note().trim());
    this.dismiss();
  }
}
