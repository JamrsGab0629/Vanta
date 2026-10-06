import { AppError } from "../utils/app-error";
import { ListUsersQuery } from "../types/user.types";

export const parseUserId = (raw: unknown): number => {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError(400, "Invalid user id.");
    }
    return id;
};

export const parseListQuery = (query: Record<string, unknown>): ListUsersQuery => {
    const search = typeof query.search === "string" ? query.search.trim().slice(0, 100) : undefined;

    let role: ListUsersQuery["role"];
    if (query.role !== undefined && query.role !== "") {
        if (query.role !== "ADMIN" && query.role !== "USER") {
            throw new AppError(400, "Role filter must be ADMIN or USER.");
        }
        role = query.role;
    }

    return { search: search || undefined, role };
};
