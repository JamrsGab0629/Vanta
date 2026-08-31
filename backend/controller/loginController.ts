import { Request, Response } from "express";
import { comparePassword } from "../service/authService";
import { generateToken } from "../service/jwt/genToken";
import { setTokenCookie } from "../utils/cookieUtils";
import User from "../model/userModel";
import { formatValidationError, loginSchema } from "../validators/authValidators";

const login = async (req: Request, res: Response) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json(formatValidationError(parsed.error));

        const { email, password } = parsed.data;

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const validPassword = await comparePassword(
            password,
            user.get("password_hash") as string
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        if (!user.get("is_verified")) {
            return res.status(403).json({ message: "Verify your email before logging in" });
        }

        const token = generateToken(
            user.get("user_id") as number,
            user.get("role") as string,
        );

        
        setTokenCookie(res, token);

        return res.status(200).json({
            message: "Login successful",
            user: {
                email: user.get("email")
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            message: "Server error"
        });
    }
};

export { login };
