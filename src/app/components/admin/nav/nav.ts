import { Component, inject, signal, OnInit, computed, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../helpers/auth/auth.services';
import { UserInformation, FetchUserDataOutput } from '../../../helpers/auth/auth.interface';
import { isPlatformBrowser } from '@angular/common';

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

  currentUser = signal<UserInformation | null>(null);

  panels = [
    { url_suffix: 'home', attr_name: 'history', name: 'History', symbol: '▤' },
    { url_suffix: 'database', attr_name: 'database', name: 'Products', symbol: '◧' },
    { url_suffix: 'product', attr_name: 'add-product', name: 'Add Product', symbol: '+' },
  ];

  firstName = computed(() => this.currentUser()?.first_name ?? '');
  lastName = computed(() => this.currentUser()?.last_name ?? '');

  displayName = computed(() => {
    const user = this.currentUser();
    if (!user) return 'ADMIN';
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

  ngOnInit() {
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

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
}