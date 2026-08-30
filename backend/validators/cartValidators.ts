// validators/cartValidators.ts
import { z } from "zod";

export const addToCartSchema = z.object({
    product_id: z.number().int().positive("Invalid product ID"),
    quantity: z.number().int().positive("Quantity must be at least 1").default(1),
}).strict();

export const updateCartItemSchema = z.object({
    quantity: z.number().int().positive("Quantity must be at least 1"),
}).strict();

export const formatCartValidationError = (error: z.ZodError) => ({
    message: "Invalid request data",
    errors: error.issues.map(({ path, message }) => ({ field: path.join("."), message })),
});