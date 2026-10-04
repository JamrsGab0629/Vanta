import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Render ONCE in the layout. Defines the <symbol> registry. */
@Component({
  selector: 'vanta-icon-sprite',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
      <defs>
        <symbol id="i-box" viewBox="0 0 24 24"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z M3 8l9 5 9-5 M12 13v8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
        <symbol id="i-truck" viewBox="0 0 24 24"><path d="M2 6h11v10H2z M13 10h4l4 3v3h-8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="7" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
        <symbol id="i-history" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5 M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
        <symbol id="i-eye" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
        <symbol id="i-close" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
        <symbol id="i-warning" viewBox="0 0 24 24"><path d="M12 3 2 21h20L12 3Z M12 10v5 M12 18v.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="m4 12 5 5L20 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
      </defs>
    </svg>`,
})
export class VantaIconSpriteComponent {}

export type VantaIconName = 'box' | 'truck' | 'history' | 'eye' | 'close' | 'warning' | 'check';

@Component({
  selector: 'vanta-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display:inline-flex' },
  template: `<svg [attr.width]="size()" [attr.height]="size()" aria-hidden="true"><use [attr.href]="'#i-' + name()"/></svg>`,
})
export class VantaIconComponent {
  name = input.required<VantaIconName>();
  size = input(16);
}
