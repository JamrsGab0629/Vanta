export type RoleLabel = "ADMIN" | "USER";

export interface UserDTO {
    id: number;
    username: string;
    email: string;
    role: RoleLabel;
    joinedAt: string;
}

export interface ListUsersQuery {
    search?: string;
    role?: RoleLabel;
}
