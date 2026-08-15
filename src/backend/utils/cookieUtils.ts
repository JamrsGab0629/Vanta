import { Response } from "express";

const COOKIE_NAME = "token";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 
};

export const setTokenCookie = (res: Response, token: string) => {
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
};

export const clearTokenCookie = (res: Response) => {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
};