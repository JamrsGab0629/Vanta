import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";
import { rateLimiter } from "./middleware/rateLimiter";

const createApp = () => {
    const app = express();

    app.use(express.json({ limit: "10kb" }));
    app.use(cookieParser());
    app.use(cors({
        origin: process.env["CORS_ORIGIN"] || "http://localhost:4200",
        credentials: true
    }));
    app.use(rateLimiter(50));
   
    app.use("/api/auth", authRoutes);
    app.use("/api", protectedRoutes);

    app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (error instanceof SyntaxError && "body" in error) {
            return res.status(400).json({ message: "Invalid JSON body" });
        }
        next(error);
    });

    return app;
}

export default createApp;
