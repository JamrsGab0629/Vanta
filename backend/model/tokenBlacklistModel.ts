import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class TokenBlacklist extends Model {}

TokenBlacklist.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        jti: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "TokenBlacklist",
        tableName: "token_blacklist",
    }
);

export default TokenBlacklist;