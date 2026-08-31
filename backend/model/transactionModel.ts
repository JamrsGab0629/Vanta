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
        status: {
            type: DataTypes.STRING(30),
            defaultValue: 'SUCCESS',
        },
        debit: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
        },
        credit: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
        },
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