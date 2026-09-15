import { Component, inject } from '@angular/core';
import { ToastService } from '../../helpers/toast/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-stack">
      @for (t of toastService.toasts(); track t.id) {
        <div class="toast" [class.error]="t.type === 'error'">
          <span class="toast-dot"></span>
          <span>{{ t.text }}</span>
        </div>
      }
    </div>
  `,
  styleUrl: './toast.css',
})
export class Toast {
  toastService = inject(ToastService);
}