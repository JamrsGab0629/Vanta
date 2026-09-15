import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../helpers/confirm/confirm.service';

@Component({
  selector: 'app-confirm',
  standalone: true,
  template: `
    @if (confirmService.state(); as s) {
      <div class="confirm-backdrop">
        <div class="confirm-box">
          <div class="confirm-msg">{{ s.message }}</div>
          <div class="confirm-actions">
            <button (click)="confirmService.respond(false)">Cancel</button>
            <button class="confirm-btn" (click)="confirmService.respond(true)">Confirm</button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './confirm.css',
})
export class Confirm {
  confirmService = inject(ConfirmService);
}