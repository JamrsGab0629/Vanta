import { Component, HostListener, OnDestroy, OnInit, input, output } from '@angular/core';
import { CurrencyPipe, KeyValuePipe } from '@angular/common';
// Type-only import avoids a circular dependency with home.ts. Adjust the path to your project.
import type { ProductItem } from '../../pages/home/home';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CurrencyPipe, KeyValuePipe],
  template: `
    @let p = product();
    <div class="overlay" (click)="close.emit()">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pd-title"
        (click)="$event.stopPropagation()"
      >
        <button class="x" type="button" aria-label="Close details" (click)="close.emit()">✕</button>

        <div class="media">
          <img
            class="row-thumb"
            [src]="getImageUrl(p.image_url)"
            [alt]="p.name"
          />
        </div>

        <div class="info">
          <div class="sku">SKU · {{ p.sku }}</div>
          <h2 id="pd-title">{{ p.name }}</h2>
          <div class="cat">{{ p.category }}</div>

          <div class="price">{{ p.price | currency: 'PHP' : 'symbol-narrow' }}</div>

          <div class="flags">
            @if (p.is_active === false) {
              <span class="flag err">UNAVAILABLE</span>
            } @else if (p.stock_quantity > 0) {
              <span class="flag ok">IN STOCK · {{ p.stock_quantity }}</span>
            } @else {
              <span class="flag err">OUT OF STOCK</span>
            }
          </div>

          @if (p.description) {
            <p class="desc">{{ p.description }}</p>
          }

          @if (p.specs && (p.specs | keyvalue).length) {
            <h3>SPECIFICATIONS</h3>
            <dl class="specs">
              @for (s of p.specs | keyvalue; track s.key) {
                <div>
                  <dt>{{ s.key }}</dt>
                  <dd>{{ s.value }}</dd>
                </div>
              }
            </dl>
          }

          <div class="actions">
            <button
              class="btn-primary"
              type="button"
              [disabled]="!canBuy()"
              (click)="add_to_cart.emit(p.product_id)"
            >
              {{ canBuy() ? 'Add to Cart' : 'Unavailable' }}
            </button>
            <button class="btn-ghost" type="button" (click)="close.emit()">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(11, 11, 12, 0.88);
      backdrop-filter: blur(8px);
      display: grid;
      place-items: center;
      padding: 24px;
      overflow-y: auto;
    }
    .modal {
      position: relative;
      width: min(880px, 100%);
      background: var(--panel);
      border: 1px solid var(--border);
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      color: var(--text);
    }
    .x {
      position: absolute;
      top: 12px;
      right: 12px;
      background: var(--bg-raised);
      border: 1px solid var(--border);
      color: var(--text-dim);
      width: 32px;
      height: 32px;
      cursor: pointer;
      z-index: 1;
    }
    .x:hover {
      color: var(--copper);
      border-color: var(--copper);
    }
    .x:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--copper-bright);
      outline-offset: 2px;
    }
    .media {
      background: #161616;
      display: grid;
      place-items: center;
      padding: 24px;
      min-height: 280px;
    }
    .media img {
      max-width: 100%;
      max-height: 360px;
      object-fit: contain;
    }
    .noimg {
      color: #666;
      font-family: var(--font-mono);
      font-size: 12px;
    }
    .info {
      padding: 28px;
      display: grid;
      gap: 12px;
      align-content: start;
    }
    .sku,
    .cat,
    h3,
    dt,
    .flag {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 1px;
    }
    .sku {
      color: var(--copper);
    }
    .cat {
      color: var(--text-dim);
    }
    h2 {
      font-family: var(--font-display);
      font-size: 22px;
      margin: 0;
    }
    h3 {
      color: var(--text-dim);
      font-weight: 500;
      margin: 8px 0 0;
    }
    .price {
      font-family: var(--font-display);
      font-size: 26px;
      color: var(--copper);
    }
    .flags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .flag {
      padding: 4px 8px;
      border: 1px solid;
    }
    .flag.ok {
      color: var(--ok);
      border-color: var(--ok);
    }
    .flag.warn {
      color: var(--copper);
      border-color: var(--copper);
      background: var(--copper-soft);
    }
    .flag.err {
      color: var(--error);
      border-color: var(--error);
    }
    .desc {
      color: var(--bone-dim);
      font-size: 14px;
      line-height: 1.6;
      margin: 0;
      max-width: 60ch;
    }
    .specs {
      margin: 0;
      border: 1px solid var(--border);
    }
    .specs div {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 12px;
      padding: 9px 12px;
      border-bottom: 1px solid var(--border-soft);
    }
    .specs div:last-child {
      border-bottom: 0;
    }
    dt {
      color: var(--text-dim);
      text-transform: uppercase;
    }
    dd {
      margin: 0;
      font-family: var(--font-mono);
      font-size: 13px;
    }
    .actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    .btn-primary {
      background: var(--copper);
      color: #000;
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 10px 18px;
      border: none;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--copper-bright);
    }
    .btn-primary:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .btn-ghost {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 10px 18px;
      cursor: pointer;
    }
    .btn-ghost:hover {
      border-color: var(--copper);
      color: var(--copper);
    }
    @media (max-width: 720px) {
      .modal {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class ProductDetail implements OnInit, OnDestroy {
  product = input.required<ProductItem>();
  close = output<void>();
  add_to_cart = output<string | number>();

  canBuy() {
    const p = this.product();
    return p.is_active !== false && p.stock_quantity > 0;
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.close.emit();
  }

  ngOnInit() {
    document.body.style.overflow = 'hidden';
  }
  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  getImageUrl(path: string | null | undefined, label = 'GPU'): string {
    if (path) {
      return `http://localhost:3000${path}`;
    }

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">
        <rect width="300" height="300" fill="#161616"/>
        <line x1="0" y1="100" x2="100" y2="0" stroke="#d97736" stroke-width="7"/>
        <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#607080" font-family="monospace" font-size="12" font-weight="600" letter-spacing="1">${label}</text>
      </svg>
    `;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}
