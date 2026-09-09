import { Component, inject, signal, OnInit, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../helpers/auth/auth.services';
import { UserInformation, FetchUserDataOutput } from '../../../helpers/auth/auth.interface';

@Component({
  selector: 'app-nav',
  imports: [RouterLink],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID); // <--- Inject PLATFORM_ID

  // State Signals
  currentUser = signal<UserInformation | null>(null);
  in_home = signal<boolean>(true);
  isMenuOpen = signal<boolean>(false);

  // Derived Computed Signals
  firstName = computed(() => this.currentUser()?.first_name ?? '');
  lastName = computed(() => this.currentUser()?.last_name ?? '');
  id = computed(() => this.currentUser()?.userId ?? this.currentUser()?.user_id ?? 'N/A');

  displayName = computed(() => {
    const user = this.currentUser();
    if (!user) return 'Guest';
    if (user.first_name) {
      return `${user.first_name} ${user.last_name ?? ''}`.trim();
    }
    return 'User';
  });

  initials = computed(() => {
    const fn = this.firstName();
    const ln = this.lastName();
    if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
    if (fn) return fn.slice(0, 2).toUpperCase();
    return 'G';
  });

  ngOnInit(): void {
    // Only attempt to fetch user data inside the browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserData();
    }

    this.updateCart(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.updateCart(event.urlAfterRedirects));
  }

  private async loadUserData(): Promise<void> {
    try {
      const response: FetchUserDataOutput = await this.authService.fetchUserData();
      if (response.success && response.data) {
        this.currentUser.set(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user data', error);
      this.currentUser.set(null);
    }
  }

  private updateCart(url: string): void {
    const clean = url.split('?')[0];
    const last = clean.split('/').filter(Boolean).pop();
    this.in_home.set(last === 'home');
  }

  toggleMenu(): void {
    this.isMenuOpen.update((prev) => !prev);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  async logout(): Promise<void> {
    this.closeMenu();
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.currentUser.set(null);
      this.router.navigate(['/auth/login']);
    }
  }
}