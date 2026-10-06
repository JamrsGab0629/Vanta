export type Role = 'ADMIN' | 'USER';

export interface AppUser {
  id: number;
  username: string;
  email: string;
  role: Role;
  joinedAt: string;
}

export interface ListUsersParams {
  search?: string;
  role?: Role;
}

// Same { success, data } shape your AuthService returns. Never throws.
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
