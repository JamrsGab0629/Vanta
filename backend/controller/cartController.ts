// controllers/cartController.ts
import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import {
    addToCartService,
    getCartService,
    CartServiceError,
    deleteCartService,
    updateCartItemService,
} from "../service/cartService";
import {
    addToCartSchema,
    deleteCartItemSchema,
    updateCartItemSchema,
    formatCartValidationError,
} from "../validators/cartValidators";

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

export const updateCartItem = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // product_id comes from the URL, so the delete schema (which validates it) works here too
        const params = deleteCartItemSchema.safeParse(req.params);
        if (!params.success) {
            return res.status(400).json(formatCartValidationError(params.error));
        }

        const body = updateCartItemSchema.safeParse(req.body);
        if (!body.success) {
            return res.status(400).json(formatCartValidationError(body.error));
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const cartItem = await updateCartItemService(
            userId,
            params.data.product_id,
            body.data.quantity
        );

        return res.status(200).json({
            message: "Cart updated successfully",
            cartItem
        });

    } catch (error) {
        if (error instanceof CartServiceError) {
            if (["PRODUCT_NOT_FOUND", "CART_NOT_FOUND", "ITEM_NOT_FOUND"].includes(error.code)) {
                return res.status(404).json({ message: error.message });
            }
            if (["INSUFFICIENT_STOCK", "INVALID_QUANTITY"].includes(error.code)) {
                return res.status(400).json({ message: error.message });
            }
        }

        console.error("UPDATE CART ERROR:", error);
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
        console.error("DELETE CART ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};