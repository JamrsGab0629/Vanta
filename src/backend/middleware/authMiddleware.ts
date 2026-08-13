import {Request,Response,NextFunction} from "express";
import {verifyToken} from "../service/jwt/verifyToken";

const authMiddleware = (req: Request,res: Response,next: NextFunction) => {
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message: "Not auth"});
    }

    try {(req as any).user = verifyToken(token);
    next();
    }
        catch {
        res.status(401).json({message: "invalid token"});
    }
};

export default authMiddleware;
