import { Request, Response } from "express";
import { comparePassword } from "../service/authService";
import { generateToken } from "../service/jwt/genToken";
import User from "../model/userModel";

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

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

        const token = generateToken(
            user.get("user_id") as number
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            message: "Server error"
        });
    }
};

export { login  };