import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import multer from "multer";
import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/user.routes";
import accountRoutes from "./routes/accountRoutes";
import { rateLimiter } from "./middleware/rateLimiter";
import authMiddleware from "./middleware/authMiddleware";
import adminMiddleware from "./middleware/adminMiddleware";
import cartRoutes from "./routes/cartRoutes";
import checkoutRoutes from "./routes/checkoutRoutes";
import transactionRoutes from './routes/transactionRoutes';

// 👇 Import your models here to safely register associations without circular loops
import Product from "./model/productModel";
import { OrderItem } from "./model/orderItemModel";
import Order from "./model/orderModel";

// 👇 Register associations here so Sequelize knows how to join them
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

const createApp = () => {
    const app = express();

    app.set("trust proxy", 1);
    app.use(express.json({ limit: "10kb" }));
    app.use(express.urlencoded({ extended: true, limit: "10kb" }));
    app.use(cookieParser());
    app.use(cors({
        origin: process.env["CORS_ORIGIN"] || "http://localhost:4200",
        credentials: true
    }));
    app.use(rateLimiter(50));
   
    // Serve locally stored product uploads
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    // Health check endpoint
    app.get("/api/health", (_req, res) => {
        res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/products", productRoutes);

    // Must come BEFORE the generic "/api" mount below
    app.use("/api/admin/users", authMiddleware, adminMiddleware, userRoutes);
    app.use("/api/account", authMiddleware, accountRoutes);

    app.use("/api", protectedRoutes);
    app.use("/api/cart", cartRoutes);
    app.use("/api/checkout", checkoutRoutes); 
    app.use('/api/transactions', transactionRoutes);

    // Global error handler
    app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        if (error instanceof SyntaxError && "body" in error) {
            return res.status(400).json({ message: "Invalid JSON body" });
        }
        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({ message: "File size exceeds 5MB limit" });
            }
            return res.status(400).json({ message: `Upload error: ${error.message}` });
        }
        if (error instanceof Error && error.message.includes("Only image files")) {
            return res.status(400).json({ message: error.message });
        }
        console.error("Unhandled server error:", error);
        return res.status(500).json({ message: "Internal server error" });
    });

    return app;
}

export default createApp;