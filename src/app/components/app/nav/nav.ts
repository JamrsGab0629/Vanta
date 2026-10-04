import { Component, inject, signal, OnInit, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '../../../helpers/auth/auth.services';
import { UserInformation, FetchUserDataOutput } from '../../../helpers/auth/auth.interface';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  // Track active URL as a signal
  currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  // Signal that stays true for /app/cart, /app/checkout, or /app/confirmation
  isCartActive = computed(() => {
    const url = this.currentUrl().split('?')[0];
    return (
      url.startsWith('/app/cart') ||
      url.startsWith('/app/checkout') ||
      url.startsWith('/app/confirmation')
    );
  });

  // State Signals
  currentUser = signal<UserInformation | null>(null);
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
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserData();
    }
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