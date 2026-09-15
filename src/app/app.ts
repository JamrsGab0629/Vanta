import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './components/toast/toast';
import { Confirm } from './components/confirm/confirm';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, Confirm],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('VANTA');
}