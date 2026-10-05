import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Order from './orderModel';

class Receipt extends Model {}

Receipt.init(
    {
        receipt_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        receipt_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        shipping_fee: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
        },
        tax: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        gross_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Receipt',
        tableName: 'receipts',
        timestamps: false,
    }
);

Order.hasOne(Receipt, { foreignKey: 'order_id', as: 'receipt' });
Receipt.belongsTo(Order, { foreignKey: 'order_id' });

export default Receipt;