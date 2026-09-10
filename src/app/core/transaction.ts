import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Transaction {
  // Using an Angular signal for reactive state
  readonly items = signal<any[]>([]);
  readonly information = signal<any>(null);

  setItems(val: any[]): void {
    this.items.set(val);
  }

  setInformation(val: any): void {
    this.information.set(val);
  }

  getItems(): any[] {
    return this.items();
  }

  getInformation(): any {
    return this.information();
  }

  isTransacted(): boolean {
    return this.items().length > 0 && this.information();
  }

  clear(): void {
    this.items.set([]),
    this.information.set(null)
  }
}