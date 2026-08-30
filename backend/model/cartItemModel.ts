// model/cartItemModel.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Cart from "./cartModel";
import Product from "./productModel";

export interface CartItemAttributes {
    cart_item_id?: number;
    cart_id: number;
    product_id: number;
    quantity: number;
}

class CartItem extends Model<CartItemAttributes> implements CartItemAttributes {
    declare cart_item_id: number;
    declare cart_id: number;
    declare product_id: number;
    declare quantity: number;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

CartItem.init(
    {
        cart_item_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cart_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Cart,
                key: "cart_id",
            },
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Product,
                key: "product_id",
            },
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    },
    {
        sequelize,
        modelName: "CartItem",
        tableName: "cart_items",
        timestamps: true,
    }
);

// Associations
Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items", onDelete: "CASCADE" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id", as: "cart" });

CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(CartItem, { foreignKey: "product_id", as: "cartItems" });

export default CartItem;