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
    where: { product_id: productId },
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

  // Track items that need DB cleanup
  const itemsToDelete: string[] = [];
  const itemsToUpdate: { cart_item_id: string; quantity: number }[] = [];

  const items = rawItems
    .map((item) => {
      const product = item.product || {};
      const stockQuantity = Number(product.stock_quantity || 0);
      const currentQuantity = Number(item.quantity || 1);

      // If item is completely out of stock, queue for deletion
      if (stockQuantity <= 0) {
        if (item.cart_item_id) itemsToDelete.push(item.cart_item_id);
        return null;
      }

      // Cap quantity to available stock: Math.min(requested, available)
      const effectiveQuantity = Math.min(currentQuantity, stockQuantity);

      // Queue database update if quantity was capped down
      if (effectiveQuantity < currentQuantity && item.cart_item_id) {
        itemsToUpdate.push({
          cart_item_id: item.cart_item_id,
          quantity: effectiveQuantity,
        });
      }

      return {
        product_id: String(product.product_id || item.product_id),
        sku: product.sku || '',
        name: product.name || '',
        category: product.category || '',
        price: Number(product.price || 0),
        image_url: product.image_url || '',
        stock_quantity: stockQuantity,
        quantity: effectiveQuantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null); // Filter out 0-stock items

  // Async cleanup in database (doesn't block response)
  if (itemsToDelete.length > 0) {
    CartItem.destroy({ where: { cart_item_id: itemsToDelete } }).catch((err) =>
      console.error('Failed to purge out-of-stock cart items:', err)
    );
  }

  if (itemsToUpdate.length > 0) {
    Promise.all(
      itemsToUpdate.map((update) =>
        CartItem.update(
          { quantity: update.quantity },
          { where: { cart_item_id: update.cart_item_id } }
        )
      )
    ).catch((err) =>
      console.error('Failed to sync updated cart item quantities:', err)
    );
  }

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

export const updateCartItemService = async (
  userId: number,
  productId: number,
  quantity: number,
) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new CartServiceError('INVALID_QUANTITY', 'Quantity must be a whole number of at least 1.');
  }

  const cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) {
    throw new CartServiceError('CART_NOT_FOUND', 'Cart not found');
  }

  const cartItem = await CartItem.findOne({
    where: { cart_id: cart.get('cart_id') as number, product_id: productId },
  });
  if (!cartItem) {
    throw new CartServiceError('ITEM_NOT_FOUND', 'Item not found in cart');
  }

  const product = await Product.findByPk(productId);
  if (!product) {
    throw new CartServiceError('PRODUCT_NOT_FOUND', 'Product not found');
  }

  const stock = product.get('stock_quantity') as number;
  if (quantity > stock) {
    throw new CartServiceError('INSUFFICIENT_STOCK', `Insufficient stock. Only ${stock} left.`);
  }

  await cartItem.update({ quantity });
  return cartItem;
};