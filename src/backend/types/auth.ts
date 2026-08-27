export type AuthenticatedUser = {
    userId: number;
    role: string;
    jti: string;
    exp: number;
};

export type AuthenticatedRequest = Express.Request & {
    user?: AuthenticatedUser;
};
