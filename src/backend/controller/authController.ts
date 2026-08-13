import {Request,Response} from "express";
import {comparePassword} from "../service/authService";
import {generateToken} from "../service/jwt/genToken";
import usermodel from "../model/userModel";

const Login = async (req: Request,res: Response) => {
const {email,passwprd } = req.body;

const user = await usermodel.findByEmail(email);
}