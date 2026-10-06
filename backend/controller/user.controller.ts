import { Request, Response } from "express";
import * as userService from "../service/user.service";
import { parseListQuery, parseUserId } from "../validators/user.validator";
import { AppError } from "../utils/app-error";
import { AuthenticatedRequest } from "../types/auth";

const actingUserId = (req: Request): number => (req as AuthenticatedRequest).user!.userId;

const fail = (res: Response, err: unknown) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong." });
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await userService.listUsers(parseListQuery(req.query));
        res.json({ success: true, data: users });
    } catch (err) {
        fail(res, err);
    }
};

export const promote = async (req: Request, res: Response) => {
    try {
        const user = await userService.promoteUser(parseUserId(req.params.id));
        res.json({ success: true, data: user });
    } catch (err) {
        fail(res, err);
    }
};

export const demote = async (req: Request, res: Response) => {
    try {
        const user = await userService.demoteUser(parseUserId(req.params.id), actingUserId(req));
        res.json({ success: true, data: user });
    } catch (err) {
        fail(res, err);
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        await userService.deleteUser(parseUserId(req.params.id), actingUserId(req));
        res.json({ success: true });
    } catch (err) {
        fail(res, err);
    }
};