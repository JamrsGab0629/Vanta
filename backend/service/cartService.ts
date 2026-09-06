// services/cartService.ts
import Cart from '../model/cartModel';
import CartItem from '../model/cartItemModel';
import Product from '../model/productModel';

export class CartServiceError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'CartServiceError';
    this.code = code;
  }
}

export const addToCartService = async (userId: number, productId: number, quantity: number) => {
  // 1. Verify the product exists and is active
  const product = await Product.findOne({
    where: { product_id: productId, is_active: true },
  });

  if (!product) {
    throw new CartServiceError('PRODUCT_NOT_FOUND', 'Product not found or inactive');
  }

  const stock = product.get('stock_quantity') as number;
  if (stock < quantity) {
    throw new CartServiceError('INSUFFICIENT_STOCK', `Insufficient stock. Only ${stock} left.`);
  }

  // 2. Find or create the user's main cart
  let [cart] = await Cart.findOrCreate({
    where: { user_id: userId },
    defaults: { user_id: userId },
  });

  const cartId = cart.get('cart_id') as number;

  // 3. Check if this product is already inside the cart items
  let cartItem = await CartItem.findOne({
    where: { cart_id: cartId, product_id: productId },
  });

  if (cartItem) {
    const newQty = quantity;

    if (stock < newQty) {
      throw new CartServiceError(
        'INSUFFICIENT_STOCK',
        `Cannot add more. Stock limit reached (${stock}).`,
      );
    }

    await cartItem.update({ quantity: newQty });
  } else {
    cartItem = await CartItem.create({
      cart_id: cartId,
      product_id: productId,
      quantity,
    });
  }

  return cartItem;
};

export const getCartService = async (userId: string) => {
  const cart = await Cart.findOne({
    where: { user_id: userId },
    include: [
      {
        model: CartItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: [
              'product_id',
              'sku',
              'name',
              'category',
              'price',
              'image_url',
              'stock_quantity',
            ],
          },
        ],
      },
    ],
  });

  if (!cart) {
    return {
      cart_id: null,
      items: [],
    };
  }

  const plainCart = cart.toJSON();
  const rawItems = (cart.items || []) as any[];

  const items = rawItems.map((item) => {
    const product = item.product || {};

    return {
      product_id: String(product.product_id || item.product_id),
      sku: product.sku || '',
      name: product.name || '',
      category: product.category || '',
      price: Number(product.price || 0),
      image_url: product.image_url || '',
      stock_quantity: Number(product.stock_quantity || 0),
      quantity: Number(item.quantity || 1),
    };
  });

  return {
    cart_id: plainCart.cart_id,
    items,
  };
};

export const deleteCartService = async (userId: string | number, product_id: string | number) => {
  // 1. Find the user's active cart
  const cart = await Cart.findOne({
    where: { user_id: userId },
  });

  if (!cart) {
    throw new Error('Cart not found');
  }

  // 2. Find and remove the cart item corresponding to the product
  const deletedCount = await CartItem.destroy({
    where: {
      cart_id: cart.cart_id,
      product_id: product_id,
    },
  });

  if (deletedCount === 0) {
    throw new Error('Item not found in cart');
  }

  // 3. Return success response
  return {
    message: 'Item successfully removed from cart',
  };
};