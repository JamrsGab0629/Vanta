import jwt from "jsonwebtoken";
// the userid would be chnageble when we know lol
const generateToken = (userId: number) => {
     return jwt.sign(
        { userId },
       process.env["JWT_SECRET"]!,
        {expiresIn: "7d"}

    );
};


    export {
        generateToken
        
    }