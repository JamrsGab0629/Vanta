import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TransactStore } from '../../../../transact.store';
import {
  VantaIconComponent,
  VantaIconSpriteComponent,
} from '../../components/icons/vanta-icons.component';

@Component({
  selector: 'app-transact-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    VantaIconComponent,
    VantaIconSpriteComponent,
  ],
  template: `
    <vanta-icon-sprite />
    <section class="wrap">
      <header class="head">
        <h1>Your Orders</h1>
        <p>Track every part from bench to doorstep.</p>
      </header>

      <nav class="tabs" aria-label="Transactions">
        <a routerLink="/app/transact/processing" routerLinkActive="active">
          <vanta-icon name="box" /> PROCESSING
          <span class="badge" aria-label="{{ store.processing().length }} processing">{{
            store.processing().length
          }}</span>
        </a>
        <a routerLink="/app/transact/in-transit" routerLinkActive="active">
          <vanta-icon name="truck" /> IN-TRANSIT
          <span class="badge" aria-label="{{ store.inTransit().length }} in transit">{{
            store.inTransit().length
          }}</span>
        </a>
        <a routerLink="/app/transact/history" routerLinkActive="active">
          <vanta-icon name="history" /> PAST HISTORY
        </a>
      </nav>

      <router-outlet />
    </section>
  `,
  styles: `
    .wrap {
      max-width: 1200px;
      margin: 0 auto;
      padding: 56px 32px 80px;
      color: var(--text);
      font-family: var(--body);
    }
    h1 {
      font-family: var(--font-display);
      font-size: 32px;
      margin: 0 0 6px;
    }
    .head p {
      font-family: var(--font-mono);
      color: var(--text-dim);
      font-size: 13px;
      margin: 0 0 32px;
    }
    .tabs {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 32px;
      overflow-x: auto;
    }
    .tabs a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 20px;
      text-decoration: none;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 1px;
      color: var(--text-dim);
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      white-space: nowrap;
    }
    .tabs a:hover {
      color: var(--text);
      background: var(--panel);
    }
    .tabs a:focus-visible {
      outline: 2px solid var(--copper-bright);
      outline-offset: -2px;
    }
    .tabs a.active {
      color: var(--copper);
      border-bottom-color: var(--copper);
      background: var(--copper-soft);
    }
    .badge {
      background: var(--copper);
      color: #000;
      font-weight: 700;
      min-width: 20px;
      padding: 1px 6px;
      text-align: center;
      font-size: 11px;
    }
  `,
})
export class TransactLayoutComponent {
  readonly store = inject(TransactStore);
}
