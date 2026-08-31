import { Request } from "express";

export type AuthenticatedUser = {
    userId: number;
    role: string;
    jti: string;
    exp: number;
};

export type AuthenticatedRequest = Request & {
    user?: AuthenticatedUser;
};