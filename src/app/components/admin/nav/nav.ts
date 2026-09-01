import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../helpers/auth/auth.services';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})

export class Nav implements OnInit{
  private router = inject(Router);
  private authService = inject(AuthService);

  current_url_suffix = signal<string>("home");
  loggingOut = signal(false);

  panels = [
    { url_suffix: "home", attr_name: "history", name: "History", symbol: "▤" },
    { url_suffix: "database", attr_name: "database", name: "Products", symbol: "◧"},
    { url_suffix: "product", attr_name: "add-product", name: "Add Product", symbol: "+" }
  ]

  ngOnInit() {
    this.update_cart(this.router.url);

    this.router.events
    .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd ) => this.update_cart(event.urlAfterRedirects))
  }

  async logout(): Promise<void> {
    if (this.loggingOut()) return;
    this.loggingOut.set(true);

    try {
      await this.authService.logout();
    } catch {
      // Even if the API call fails, still clear the user out locally.
    } finally {
      this.loggingOut.set(false);
      this.router.navigate(['/']);
    }
  }

  private update_cart(url: string){
    const clean = url.split('?')[0];
    const last = clean.split('/').filter(Boolean).pop();

    if(last){
      this.current_url_suffix.set(last);
    }
  }
}
