import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { processCheckoutService, CheckoutServiceError } from '../service/checkoutService';

export const processCheckout = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { first_name, last_name, address, contact_number, save_address } = req.body;

        if (!first_name || !last_name || !address || !contact_number) {
            return res.status(400).json({ message: 'All shipping and contact fields are required.' });
        }

        const result = await processCheckoutService(userId, {
            first_name,
            last_name,
            address,
            contact_number,
            save_address
        });

        return res.status(200).json({
            message: 'Checkout successful',
            ...result
        });

    } catch (error: unknown) {
        if (error instanceof CheckoutServiceError) {
            if (error.code === 'CART_EMPTY' || error.code === 'OUT_OF_STOCK') {
                return res.status(400).json({ message: error.message });
            }
            if (error.code === 'PRODUCT_NOT_FOUND') {
                return res.status(404).json({ message: error.message });
            }
        }

        console.error('CHECKOUT ERROR:', error);

        return res.status(500).json({
            message: 'Server error processing checkout',
        });
    }
};