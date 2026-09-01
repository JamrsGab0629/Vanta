import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../helpers/auth/auth.services';

@Component({
  selector: 'app-nav',
  imports: [RouterLink],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  // User state signal from AuthService
  currentUser = this.authService.currentUser;

  // Derived properties
  firstName = computed(() => this.currentUser()?.first_name ?? '');
  lastName = computed(() => this.currentUser()?.last_name ?? '');
  username = computed(() => this.currentUser()?.username ?? '');
  id = computed(() => this.currentUser()?.user_id ?? 'N/A');

  // Full name with fallback
  displayName = computed(() => {
    const user = this.currentUser();
    if (!user) return 'Guest';
    if (user.first_name) {
      return `${user.first_name} ${user.last_name ?? ''}`.trim();
    }
    return user.username ?? user.email;
  });

  // Dynamic 2-letter avatar initials
  initials = computed(() => {
    const fn = this.firstName();
    const ln = this.lastName();
    if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
    if (fn) return fn.slice(0, 2).toUpperCase();
    const un = this.username();
    if (un) return un.slice(0, 2).toUpperCase();
    return 'G';
  });

  in_home = signal<boolean>(true);

  ngOnInit() {
    this.update_cart(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.update_cart(event.urlAfterRedirects));
  }

  private update_cart(url: string) {
    const clean = url.split('?')[0];
    const last = clean.split('/').filter(Boolean).pop();

    this.in_home.set(last && last === 'home' ? true : false);
  }
}