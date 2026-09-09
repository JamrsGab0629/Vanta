import { Response } from "express";

const COOKIE_NAME = "token";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // false on local HTTP, true on production HTTPS
    sameSite: "lax" as const, // Changed from "strict" to "lax" for cross-port/cross-origin compatibility
    path: "/", // CRITICAL: Allows the cookie to be sent on ALL routes (including /verify-auth)
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const setTokenCookie = (res: Response, token: string) => {
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
};

export const clearTokenCookie = (res: Response) => {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
};