import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Receipt from './receiptModel';

class TransactionModel extends Model {}

TransactionModel.init(
    {
        transaction_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        receipt_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tracking_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(30),
            defaultValue: 'PENDING',
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: null,
        }
    },
    {
        sequelize,
        modelName: 'TransactionModel',
        tableName: 'transactions',
        timestamps: false,
    }
);

Receipt.hasOne(TransactionModel, { foreignKey: 'receipt_id', as: 'transaction' });
TransactionModel.belongsTo(Receipt, { foreignKey: 'receipt_id' });

export default TransactionModel;