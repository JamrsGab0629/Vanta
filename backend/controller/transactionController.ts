import { Request, Response } from 'express';
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

        // Fetch user-scoped transactions through receipts and orders
        const transactions = await TransactionModel.findAll({
            include: [
                {
                    model: Receipt,
                    required: true,
                    include: [
                        {
                            model: Order,
                            where: { user_id: userId },
                            required: true,
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

export const getAllTransactions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const transactions = await TransactionModel.findAll({
            include: [
                {
                    model: Receipt,
                    include: [
                        {
                            model: Order,
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
        });

        return res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error: any) {
        console.error('Error fetching all transactions:', error);
        return res.status(500).json({
            message: 'Internal server error while fetching transactions',
            error: error.message
        });
    }
};

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const fetchAll = req.query?.all === 'true';

        const rawTransactions = await TransactionModel.findAll({
            include: [
                {
                    model: Receipt,
                    attributes: ['receipt_date', 'total_price']
                }
            ],
            order: [['transaction_id', 'DESC']], // Fetch most recent first
            limit: fetchAll ? undefined : 50  // Limit to 50 unless ?all=true
        });

        // Flatten the nested Receipt object into a single-level object
        const transactions = rawTransactions.map((tx: any) => {
            const txData = tx.toJSON();
            const receipt = txData.Receipt;
            delete txData.Receipt; // Remove the nested 'Receipt' property

            return {
                ...txData,
                receipt_date: receipt?.receipt_date ?? null,
                total_price: receipt?.total_price ?? null
            };
        });

        return res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error: any) {
        console.error('Error fetching global transactions:', error);
        return res.status(500).json({ 
            message: 'Internal server error while fetching transactions', 
            error: error.message 
        });
    }
};

export const editTransactionsStatus = async (req: Request, res: Response) => {
    const { transaction_id, status } = req.body;

    if (!transaction_id || !status) {
        return res.status(400).json({ message: 'Missing required fields: transaction_id and status' });
    }

    try {
        const transaction = await TransactionModel.findByPk(transaction_id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction ID not found' });
        }

        // Check current status before allowing an update
        const currentStatus = (transaction.get('status') as string)?.toLowerCase();
        if (currentStatus === 'cancelled' || currentStatus === 'completed') {
            return res.status(400).json({ message: 'Transaction is already finished and cannot be updated' });
        }

        await transaction.update({ 
            status, 
            updated_at: new Date() 
        });

        return res.status(200).json({
            success: true,
            message: 'Transaction status updated successfully',
            transaction
        });

    } catch (error: any) {
        console.error('Error updating transaction status:', error);
        return res.status(500).json({ 
            message: 'Internal server error while updating transaction status', 
            error: error.message 
        });
    }
};