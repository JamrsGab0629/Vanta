// controllers/cartController.ts
import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { addToCartService, getCartService, CartServiceError, deleteCartService } from "../service/cartService";
import { addToCartSchema, deleteCartItemSchema, formatCartValidationError } from "../validators/cartValidators";

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const parsed = addToCartSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json(formatCartValidationError(parsed.error));
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { product_id, quantity } = parsed.data;

        const cartItem = await addToCartService(userId, product_id, quantity);

        return res.status(200).json({
            message: "Item added to cart successfully",
            cartItem
        });

    } catch (error) {
        if (error instanceof CartServiceError) {
            if (error.code === "PRODUCT_NOT_FOUND") {
                return res.status(404).json({ message: error.message });
            }
            if (error.code === "INSUFFICIENT_STOCK") {
                return res.status(400).json({ message: error.message });
            }
        }

        console.error("ADD TO CART ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const cartData = await getCartService(String(userId));

        return res.status(200).json(cartData);

    } catch (error) {
        console.error("GET CART ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const deleteToCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const parsed = deleteCartItemSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json(formatCartValidationError(parsed.error));
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { product_id } = parsed.data;

        const cartData = await deleteCartService(String(userId), String(product_id));

        return res.status(200).json(cartData);

    } catch (error) {
        console.error("GET CART ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};