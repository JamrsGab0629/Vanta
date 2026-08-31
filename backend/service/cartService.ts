// services/cartService.ts
import Cart from "../model/cartModel";
import CartItem from "../model/cartItemModel";
import Product from "../model/productModel";

export class CartServiceError extends Error {
    code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = "CartServiceError";
        this.code = code;
    }
}

export const addToCartService = async (userId: number, productId: number, quantity: number) => {
    // 1. Verify the product exists and is active
    const product = await Product.findOne({
        where: { product_id: productId, is_active: true }
    });

    if (!product) {
        throw new CartServiceError("PRODUCT_NOT_FOUND", "Product not found or inactive");
    }

    const stock = product.get("stock_quantity") as number;
    if (stock < quantity) {
        throw new CartServiceError("INSUFFICIENT_STOCK", `Insufficient stock. Only ${stock} left.`);
    }

    // 2. Find or create the user's main cart
    let [cart] = await Cart.findOrCreate({
        where: { user_id: userId },
        defaults: { user_id: userId }
    });

    const cartId = cart.get("cart_id") as number;

    // 3. Check if this product is already inside the cart items
    let cartItem = await CartItem.findOne({
        where: { cart_id: cartId, product_id: productId }
    });

    if (cartItem) {
        const currentQty = cartItem.get("quantity") as number;
        const newQty = currentQty + quantity;

        if (stock < newQty) {
            throw new CartServiceError("INSUFFICIENT_STOCK", `Cannot add more. Stock limit reached (${stock}).`);
        }

        await cartItem.update({ quantity: newQty });
    } else {
        cartItem = await CartItem.create({
            cart_id: cartId,
            product_id: productId,
            quantity
        });
    }

    return cartItem;
};

export const getCartService = async (userId: number) => {
    const cart = await Cart.findOne({
        where: { user_id: userId },
        include: [
            {
                model: CartItem,
                as: "items",
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: [
                            "product_id",
                            "sku",
                            "name",
                            "category",
                            "price",
                            "image_url",
                            "stock_quantity"
                        ]
                    }
                ]
            }
        ]
    });

    if (!cart) {
        return {
            cart_id: null,
            items: [],
            subtotal: 0
        };
    }

    const items = cart.get("items") as any[];
    const subtotal = items.reduce((sum, item) => {
        const price = item.product?.price || 0;
        const quantity = item.quantity || 0;
        return sum + (price * quantity);
    }, 0);

    return {
        cart_id: cart.get("cart_id"),
        items,
        subtotal: Number(subtotal.toFixed(2))
    };
};