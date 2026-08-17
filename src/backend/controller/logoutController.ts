import { Request, Response } from "express";
import { clearTokenCookie } from "../utils/cookieUtils";
import TokenBlacklist from "../model/tokenBlacklistModel";
import jwt from "jsonwebtoken";

const logout = async (req: Request, res: Response) => {
    try {
        const token = req.cookies?.['token'];

        if (token) {
            try {
                
                const decoded: any = jwt.decode(token);
                
                if (decoded?.jti && decoded?.exp) {
                    await TokenBlacklist.create({
                        jti: decoded.jti,
                        expires_at: new Date(decoded.exp * 1000) 
                    });
                }
            } catch (err) {
               
            }
        }

        // Wipe the browser cookie
        clearTokenCookie(res);

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("LOGOUT ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export { logout };