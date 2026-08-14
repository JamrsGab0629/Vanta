import express from "express";
import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";
import { rateLimiter } from "./middleware/rateLimiter";

const createApp = () => {
    const app = express();

    app.use(express.json());
    app.use(rateLimiter(50));
   
    app.use("/api/auth", authRoutes);
    app.use("/api", protectedRoutes);

    return app;
}

export default createApp;