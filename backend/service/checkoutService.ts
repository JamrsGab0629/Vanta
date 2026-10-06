import Cart from '../model/cartModel';
import CartItem from '../model/cartItemModel';
import Product from '../model/productModel';
import Order from '../model/orderModel';
import { OrderItem } from '../model/orderItemModel';
import User from '../model/userModel';
import Receipt from '../model/receiptModel';
import TransactionModel from '../model/transactionModel';
import sequelize from '../config/database';

export class CheckoutServiceError extends Error {
    code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = 'CheckoutServiceError';
        this.code = code;
    }
}

interface CheckoutData {
    first_name: string;
    last_name: string;
    address: string;
    contact_number: string;
    save_address?: boolean;
}

// Helper to generate tracking codes like VN-40218-7X
const generateTrackingCode = (): string => {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomSuffix = '';
    for (let i = 0; i < 2; i++) {
        randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `VN-${randomDigits}-${randomSuffix}`;
};

export const processCheckoutService = async (userId: number, data: CheckoutData) => {
    const { first_name, last_name, address, contact_number, save_address } = data;

    const t = await sequelize.transaction();
    let committed = false;

    try {
        // 1. Fetch user's cart container AND include its items using the association
        const userCart = await Cart.findOne({ 
            where: { user_id: userId }, 
            include: [
                {
                    model: CartItem,
                    as: 'items'
                }
            ],
            transaction: t 
        });

        const cartItems = userCart ? (userCart as any).items : [];

        if (!cartItems || cartItems.length === 0) {
            throw new CheckoutServiceError('CART_EMPTY', 'Your cart is empty');
        }

        // CHANGED: always lock products in the same order (lowest id first) so two
        // checkouts with the same products can never block each other (deadlock)
        cartItems.sort((a: any, b: any) => 
            Number(a.get('product_id')) - Number(b.get('product_id'))
        );
        // console.log('CART ITEMS AT CHECKOUT:', cartItems.map((i: any) => i.get({ plain: true })));
        let subtotal = 0;
        const orderItemsData = [];

        // 2. Validate stock and calculate subtotal from database
        for (const item of cartItems) {
            const productId = item.product_id || item.get('product_id');
            const requestedQty = item.quantity || item.get('quantity');

            // CHANGED: lock the product row until this transaction finishes, so two
            // buyers can't both pass the stock check for the last units
            const product = await Product.findByPk(productId, { 
                transaction: t, 
                lock: t.LOCK.UPDATE 
            });
            
            if (!product) {
                throw new CheckoutServiceError('PRODUCT_NOT_FOUND', `Product with ID ${productId} not found`);
            }

            const currentStock = product.get('stock_quantity') as number;
            const price = product.get('price') as number;
            const productName = product.get('name') as string;

            if (currentStock < requestedQty) {
                throw new CheckoutServiceError(
                    'OUT_OF_STOCK', 
                    `Not enough stock for "${productName}". Available: ${currentStock}, Requested: ${requestedQty}`
                );
            }

            // Deduct stock based on requested quantity
            await product.update(
                { stock_quantity: currentStock - requestedQty }, 
                { transaction: t }
            );

            subtotal += Number(price) * requestedQty;
            
            orderItemsData.push({
                product_id: productId,
                quantity: requestedQty,
                price: price
            });
        }

        // Determine dynamic shipping fee & delivery time (Store is in Bulacan)
        const lowerAddress = address.toLowerCase();
        let shippingFee = 150.00;
        let estimatedDelivery = "3 to 5 business days (Rest of Luzon)";

        if (lowerAddress.includes('bulacan')) {
            shippingFee = 80.00;
            estimatedDelivery = "1 to 2 business days (Local Delivery)";
        } else if (
            lowerAddress.includes('manila') || 
            lowerAddress.includes('quezon city') || 
            lowerAddress.includes('caloocan') || 
            lowerAddress.includes('makati') || 
            lowerAddress.includes('pasig') || 
            lowerAddress.includes('ncr')
        ) {
            shippingFee = 120.00;
            estimatedDelivery = "2 to 3 business days (Metro Manila)";
        } else if (
            lowerAddress.includes('cebu') || 
            lowerAddress.includes('davao') || 
            lowerAddress.includes('visayas') || 
            lowerAddress.includes('mindanao')
        ) {
            shippingFee = 250.00;
            estimatedDelivery = "5 to 7 business days (Visayas/Mindanao)";
        }

        // Calculate 12% VAT Tax and Total in Pesos (₱)
        const tax = Number((subtotal * 0.12).toFixed(2));
        const totalAmount = Number((subtotal + shippingFee + tax).toFixed(2));
        const trackingCode = generateTrackingCode();

        // 3. Create the permanent Order record (Pending for Cash on Delivery)
        const newOrder = await Order.create({
            user_id: userId,
            first_name,
            last_name,
            address,
            contact_number,
        }, { transaction: t });

        const orderId = newOrder.get('order_id');

        // 4. Create Order Items
        for (const orderItem of orderItemsData) {
            await OrderItem.create({
                order_id: orderId,
                ...orderItem
            }, { transaction: t });
        }

        // 5. Create Receipt matching your exact table columns (in Pesos)
        const newReceipt = await Receipt.create({
            order_id: orderId,
            subtotal: subtotal,
            shipping_fee: shippingFee,
            tax: tax,
            gross_price: totalAmount,
            total_price: totalAmount,
        }, { transaction: t });

        const receiptId = newReceipt.get('receipt_id');

        // 6. Create Transaction record indicating pending cash collection
        await TransactionModel.create({
            receipt_id: receiptId,
            tracking_code: trackingCode,
            status: 'pending',
        }, { transaction: t });

        // 7. Update user profile default info if requested
        if (save_address) {
            await User.update(
                { 
                    // Change only the adress not then user information
                    // first_name, 
                    // last_name, 
                    address, 
                    contact_no: contact_number 
                },
                { where: { user_id: userId }, transaction: t }
            );
        }

        // 8. Clear user cart items after successful checkout safely
        const cartId = userCart?.get('cart_id');
        if (cartId) {
            await CartItem.destroy({ 
                where: { cart_id: cartId }, 
                transaction: t 
            });
        }

        await t.commit();
        committed = true;

        return {
            message: "Order placed successfully! Prepare exact cash upon delivery.",
            tracking_code: trackingCode,
            order_id: orderId,
            subtotal: `₱${subtotal.toFixed(2)}`,
            shipping_fee: `₱${shippingFee.toFixed(2)}`,
            vat_12_percent: `₱${tax.toFixed(2)}`,
            total: `₱${totalAmount.toFixed(2)}`,
            payment_method: 'Cash on Delivery',
            estimated_delivery: estimatedDelivery,
            shipping_address: address
        };

    } catch (error) {
        if (!committed) {
            try {
                await t.rollback();
            } catch (rollbackError) {
                console.error('Rollback error:', rollbackError);
            }
        }
        throw error;
    }
};