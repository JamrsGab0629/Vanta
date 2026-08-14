import { Request, Response } from "express";
import User from "../model/userModel";
import { hashPassword } from "../service/authService"; 

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required"
            });
        }

        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email is already registered"
            });
        }

        const password_hash = await hashPassword(password);

        const newUser = await User.create({
            username,
            email,
            password_hash,
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                username: newUser.get("username"),
                email: newUser.get("email"),
            }
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({
            message: "Server error"
        });
    }
};