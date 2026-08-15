import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";
import { rateLimiter } from "./middleware/rateLimiter";

const createApp = () => {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({
        origin: "http://localhost:4200",
        credentials: true
    }));
    app.use(rateLimiter(50));
   
    app.use("/api/auth", authRoutes);
    app.use("/api", protectedRoutes);

    return app;
}

export default createApp;