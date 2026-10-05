import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
        <a routerLink="/app/transact/processing" routerLinkActive="active" title="PENDING">
          <vanta-icon name="box" />
          <span class="tab-label">PENDING</span>
        </a>
        <a routerLink="/app/transact/in-transit" routerLinkActive="active" title="PROCESSING AND DELIVERING">
          <vanta-icon name="truck" />
          <span class="tab-label">PROCESSING AND DELIVERING</span>
        </a>
        <a routerLink="/app/transact/history" routerLinkActive="active" title="PAST HISTORY">
          <vanta-icon name="history" />
          <span class="tab-label">PAST HISTORY</span>
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
      scrollbar-width: none; /* Hide scrollbar for Firefox */
      -ms-overflow-style: none; /* Hide scrollbar for IE/Edge */
    }
    .tabs::-webkit-scrollbar {
      display: none; /* Hide scrollbar for Chrome, Safari, Opera */
    }
    .tabs a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
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

    @media (max-width: 768px) {
      .wrap {
        padding: 32px 16px 48px;
      }

      h1 {
        font-size: 24px;
      }

      .head p {
        margin-bottom: 24px;
      }

      .tabs {
        justify-content: space-around;
      }

      .tabs a {
        padding: 12px 16px;
        flex: 1;
      }

      .tab-label {
        display: none;
      }
    }
  `,
})
export class TransactLayoutComponent {}