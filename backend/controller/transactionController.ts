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

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.orderId as string;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'transit', 'delivered'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update({ status });

    return res.status(200).json({
      message: 'Order status updated successfully',
      is_successful: true,
    });
  } catch (error: any) {
    console.error('UPDATE ORDER STATUS ERROR:', error);
    return res.status(500).json({ message: 'Server error updating order status' });
  }
};