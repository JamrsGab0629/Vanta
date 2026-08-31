import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth'; 
import TransactionModel from '../model/transactionModel';
import Receipt from '../model/receiptModel';
import Order from '../model/orderModel';
import { OrderItem } from '../model/orderItemModel';
import Product from '../model/productModel';

export const getUserTransactions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found in token' });
        }

        // Fetch transactions linked through receipts and orders belonging to this user
        const transactions = await TransactionModel.findAll({
            include: [
                {
                    model: Receipt,
                    include: [
                        {
                            model: Order,
                            where: { user_id: userId },
                            include: [
                                {
                                    model: OrderItem,
                                    as: 'items',
                                    include: [
                                        {
                                            model: Product,
                                            as: 'product'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
            // Removed the 'order' property because the table lacks timestamp columns
        });

        return res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error: any) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ 
            message: 'Internal server error while fetching transactions', 
            error: error.message 
        });
    }
};