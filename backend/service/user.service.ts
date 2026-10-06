import { Op } from "sequelize";
import User from "../model/userModel";
import { AppError } from "../utils/app-error";
import { ListUsersQuery, UserDTO } from "../types/user.types";

const ADMIN_ROLE = "admin";
const USER_ROLE = "customer"; // the model's default role

// Never expose password_hash or other private fields to the admin table.
const PUBLIC_ATTRIBUTES = ["user_id", "username", "email", "role", "created_at"];

const toDTO = (row: any): UserDTO => ({
    id: row.user_id,
    username: row.username,
    email: row.email,
    role: row.role === ADMIN_ROLE ? "ADMIN" : "USER",
    joinedAt: new Date(row.created_at).toISOString().slice(0, 10),
});

// Escape % and _ so a search like "100%" is treated as plain text.
const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

const findOrFail = async (id: number): Promise<any> => {
    const user = await User.findByPk(id);
    if (!user) throw new AppError(404, "User not found.");
    return user;
};

const assertNotLastAdmin = async (target: any, action: string) => {
    if (target.role !== ADMIN_ROLE) return;
    const admins = await User.count({ where: { role: ADMIN_ROLE } });
    if (admins <= 1) {
        throw new AppError(400, `You can't ${action} the last remaining admin.`);
    }
};

export const listUsers = async ({ search, role }: ListUsersQuery): Promise<UserDTO[]> => {
    const where: any = {};

    if (search) {
        const pattern = `%${escapeLike(search)}%`;
        // Op.iLike is PostgreSQL. On MySQL/SQLite use Op.like instead.
        where[Op.or] = [
            { username: { [Op.iLike]: pattern } },
            { email: { [Op.iLike]: pattern } },
        ];
    }

    if (role === "ADMIN") where.role = ADMIN_ROLE;
    if (role === "USER") where.role = { [Op.ne]: ADMIN_ROLE };

    const rows = await User.findAll({
        where,
        attributes: PUBLIC_ATTRIBUTES,
        order: [["created_at", "DESC"]],
    });

    return rows.map((r) => toDTO(r.get({ plain: true })));
};

export const promoteUser = async (targetId: number): Promise<UserDTO> => {
    const user = await findOrFail(targetId);
    if (user.role !== ADMIN_ROLE) {
        user.role = ADMIN_ROLE;
        await user.save();
    }
    return toDTO(user.get({ plain: true }));
};

export const demoteUser = async (targetId: number, actingUserId: number): Promise<UserDTO> => {
    if (targetId === actingUserId) {
        throw new AppError(400, "You can't demote your own account.");
    }
    const user = await findOrFail(targetId);
    await assertNotLastAdmin(user, "demote");

    if (user.role === ADMIN_ROLE) {
        user.role = USER_ROLE;
        await user.save();
    }
    return toDTO(user.get({ plain: true }));
};

export const deleteUser = async (targetId: number, actingUserId: number): Promise<void> => {
    if (targetId === actingUserId) {
        throw new AppError(400, "You can't delete your own account.");
    }
    const user = await findOrFail(targetId);
    await assertNotLastAdmin(user, "delete");
    await user.destroy();
};
