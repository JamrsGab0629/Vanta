import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Order extends Model {}

Order.init(
    {
        order_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        contact_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        order_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        delivered_at: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    {
        sequelize,
        modelName: 'Order',
        tableName: 'orders',
        timestamps: false,
    }
);

export default Order;