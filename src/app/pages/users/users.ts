import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../helpers/auth/auth.services';
import { UserManagementService } from '../../helpers/user-management/user-management.services';
import { AppUser, Role } from '../../helpers/user-management/user-management.interface';

type Filter = 'ALL' | Role;
type Pending = { user: AppUser; action: 'promote' | 'demote' | 'delete' } | null;
type Toast = { text: string; error: boolean } | null;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserManagementService);
  private platformId = inject(PLATFORM_ID);

  currentUserId = signal<number | null>(null);
  users = signal<AppUser[]>([]);
  loading = signal(true);
  loadError = signal<string | null>(null);
  busyId = signal<number | null>(null); // row currently being updated

  query = signal('');
  filter = signal<Filter>('ALL');
  pending = signal<Pending>(null);
  toast = signal<Toast>(null);
  private toastTimer: any;

  adminCount = computed(() => this.users().filter((u) => u.role === 'ADMIN').length);
  userCount = computed(() => this.users().filter((u) => u.role === 'USER').length);

  // Search + tabs filter the loaded list instantly. getUsers() also supports
  // ?search= and ?role= if you later want server-side search for large lists.
  results = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    return this.users().filter(
      (u) =>
        (f === 'ALL' || u.role === f) &&
        (!q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  });

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    await Promise.all([this.loadCurrentUser(), this.load()]);
  }

  private async loadCurrentUser() {
    try {
      const res = await this.authService.fetchUserData();
      if (res.success && res.data) {
        const d = res.data as any;
        this.currentUserId.set(d.user_id ?? d.id ?? null);
      }
    } catch (error) {
      console.error('Failed to fetch current user', error);
    }
  }

  async load() {
    this.loading.set(true);
    this.loadError.set(null);
    const res = await this.userService.getUsers();
    if (res.success && res.data) {
      this.users.set(res.data);
    } else {
      this.loadError.set(res.message ?? "Couldn't load accounts.");
    }
    this.loading.set(false);
  }

  isSelf(u: AppUser) {
    return u.id === this.currentUserId();
  }

  initials(u: AppUser) {
    return u.username.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
  }

  setFilter(f: Filter) {
    this.filter.set(f);
  }

  clearSearch() {
    this.query.set('');
  }

  // Promote is low-risk, so it runs immediately. Demote and delete ask first.
  request(user: AppUser, action: 'promote' | 'demote' | 'delete') {
    if (action === 'promote') {
      this.changeRole(user, 'ADMIN');
      return;
    }
    this.pending.set({ user, action });
  }

  cancel() {
    this.pending.set(null);
  }

  confirm() {
    const p = this.pending();
    if (!p) return;
    this.pending.set(null);
    if (p.action === 'demote') this.changeRole(p.user, 'USER');
    if (p.action === 'delete') this.remove(p.user);
  }

  private async changeRole(user: AppUser, role: Role) {
    this.busyId.set(user.id);
    const res =
      role === 'ADMIN' ? await this.userService.promote(user.id) : await this.userService.demote(user.id);
    this.busyId.set(null);

    if (!res.success || !res.data) {
      this.notify(res.message ?? "Couldn't update the role.", true);
      return;
    }
    const updated = res.data;
    this.users.update((list) => list.map((u) => (u.id === user.id ? updated : u)));
    this.notify(
      role === 'ADMIN' ? `${user.username} is now an admin.` : `${user.username} is now a regular user.`
    );
  }

  private async remove(user: AppUser) {
    this.busyId.set(user.id);
    const res = await this.userService.remove(user.id);
    this.busyId.set(null);

    if (!res.success) {
      this.notify(res.message ?? "Couldn't delete the account.", true);
      return;
    }
    this.users.update((list) => list.filter((u) => u.id !== user.id));
    this.notify(`Deleted ${user.username}'s account.`);
  }

  private notify(text: string, error = false) {
    this.toast.set({ text, error });
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 4000);
  }
}