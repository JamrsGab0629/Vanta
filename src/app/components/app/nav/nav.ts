import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-nav',
  imports: [RouterLink],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav implements OnInit{
  private router = inject(Router);

  in_home = signal<boolean>(true);

  ngOnInit() {
    this.update_cart(this.router.url);

    this.router.events
    .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd ) => this.update_cart(event.urlAfterRedirects))
  }

  private update_cart(url: string){
    const clean = url.split('?')[0];
    const last = clean.split('/').filter(Boolean).pop();

    this.in_home.set(last && last === 'home' ? true : false);
  }
}
