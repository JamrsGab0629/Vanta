// model/cartModel.ts
import { DataTypes, Model, NonAttribute } from "sequelize";
import sequelize from "../config/database";
import User from "./userModel";
import CartItem from "./cartItemModel";

export interface CartAttributes {
    cart_id?: number;
    user_id: number;
}

class Cart extends Model<CartAttributes> implements CartAttributes {
    declare cart_id: number;
    declare user_id: number;
    declare items?: NonAttribute<CartItem[]>

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Cart.init(
    {
        cart_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // One active cart per user
            references: {
                model: User,
                key: "user_id",
            },
        },
    },
    {
        sequelize,
        modelName: "Cart",
        tableName: "carts",
        timestamps: true,
    }
);

Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasOne(Cart, { foreignKey: "user_id", as: "cart" });

export default Cart;