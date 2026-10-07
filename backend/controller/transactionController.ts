import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth'; 
import TransactionModel from '../model/transactionModel';
import Receipt from '../model/receiptModel';
import Order from '../model/orderModel';
import { OrderItem } from '../model/orderItemModel';
import Product from '../model/productModel';
import { WhereOptions, Op } from 'sequelize';
import sequelize from '../config/database';


const STATUS_FLOW = ['pending', 'processing', 'delivering', 'delivered'];
const ALLOWED_STATUSES = [...STATUS_FLOW, 'cancelled'];
export const getUserTransactions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found in token' });
        }

        const whereClause: WhereOptions = {};
        const status = req.body?.status as string | undefined;

        if (status === 'processing') {
            whereClause.status = {
                [Op.or] : ['delivering', 'processing'],
            };
        } else if (status && status !== "ALL") {
            whereClause.status = status;
        }

        // Fetch user-scoped transactions through receipts and orders
        const transactions = await TransactionModel.findAll({
            where: whereClause,
            include: [
                {
                    model: Receipt,
                    required: true,
                    order: [['created_at', 'DESC']],
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
};// Adjust path to your Sequelize instance

export const editTransactionsStatus = async (req: Request, res: Response) => {
    const { transaction_id, status } = req.body;

    if (!transaction_id || !status) {
        return res.status(400).json({ 
            message: 'Missing required fields: transaction_id and status' 
        });
    }

    const nextStatus = String(status).toLowerCase();
    if (!ALLOWED_STATUSES.includes(nextStatus)) {
        return res.status(400).json({ 
            message: `Invalid status. Use one of: ${ALLOWED_STATUSES.join(', ')}` 
        });
    }

    try {
        const transaction = await TransactionModel.findOne({
            where: { transaction_id },
            include: [
                {
                    model: Receipt,
                    required: true,
                    include: [
                        {
                            model: Order,
                            required: true,
                            include: [
                                {
                                    model: OrderItem,
                                    as: 'items',
                                    attributes: ['product_id', 'quantity'],
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction ID not found' });
        }

        const currentStatus = (transaction.get('status') as string)?.toLowerCase();

        // Finished transactions can't be changed
        if (currentStatus === 'cancelled' || currentStatus === 'delivered') {
            return res.status(400).json({ 
                message: 'Transaction is already finished and cannot be updated' 
            });
        }

        // Same status again
        if (nextStatus === currentStatus) {
            return res.status(200).json({ 
                success: true, 
                message: 'Status unchanged', 
                transaction 
            });
        }

        // Validate forward-only flow for non-cancelled statuses
        if (
            nextStatus !== 'cancelled' && 
            STATUS_FLOW.indexOf(nextStatus) <= STATUS_FLOW.indexOf(currentStatus)
        ) {
            return res.status(400).json({
                message: `An order can't go back from "${currentStatus}" to "${nextStatus}".`
            });
        }

        // Execute updates inside an atomic database transaction
        await sequelize.transaction(async (t) => {
            // Restore inventory when cancelling an active order
            if (
                nextStatus === 'cancelled' && 
                (currentStatus === 'pending' || currentStatus === 'processing')
            ) {
                // Safely extract items from Sequelize nested associations
                const receipt = transaction?.Receipt || transaction?.get('Receipt');
                const order = receipt?.Order || receipt?.get('Order');
                const items = order?.items || order?.get('items') || [];

                for (const item of items) {
                    const productId = item.product_id;
                    const quantity = item.quantity;

                    const product = await Product.findByPk(productId, { transaction: t });
                    if (!product) {
                        throw new Error(`Product ID ${productId} not found`);
                    }

                    // Increment atomically to prevent race conditions
                    await product.increment('stock_quantity', {
                        by: quantity,
                        transaction: t
                    });
                }
            }

            // Update status on transaction instance
            await transaction.update(
                { status: nextStatus },
                { transaction: t }
            );
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