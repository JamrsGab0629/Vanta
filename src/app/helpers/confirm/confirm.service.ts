import { Injectable, signal } from '@angular/core';

export interface ConfirmState {
  message: string;
  resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  state = signal<ConfirmState | null>(null);

  ask(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({ message, resolve });
    });
  }

  respond(result: boolean): void {
    this.state()?.resolve(result);
    this.state.set(null);
  }
}