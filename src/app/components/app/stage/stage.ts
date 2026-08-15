import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

const Stage_Map: Record<string, number> = {
  'cart' : 1,
  'checkout' : 2,
  'confirmation' : 3,
}

@Component({
  selector: 'app-stage',
  imports: [],
  templateUrl: './stage.html',
  styleUrl: './stage.css',
})

export class Stage implements OnInit {
  private router = inject(Router);

  stage_num = signal<number>(1);

  stage_detials = [
    { 'id': 1, 'name': 'Cart' },
    { 'id': 2, 'name': 'Checkout' },
    { 'id': 3, 'name': 'Confirmation' },
  ]

  ngOnInit(){
    this.update_steps(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => { this.update_steps(event.urlAfterRedirects); });
  }

  private update_steps(url: string) {
    const clean_url = url.split('?')[0];
    const last_url = clean_url.split('/').filter(Boolean).pop();

    if (last_url && last_url in Stage_Map){
      this.stage_num.set(Stage_Map[last_url]);
    }
  }
}
