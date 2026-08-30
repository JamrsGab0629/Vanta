import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./userModel";

export interface ProductAttributes {
    id?: number;
    sku: string;
    name: string;
    category: string;
    swatch?: string | null;
    price: number;
    stock_quantity?: number;
    description?: string | null;
    specs?: Record<string, string | number> | null;
    bench_stats?: Record<string, string | number> | null;
    image_url?: string | null;
    is_active?: boolean;
    created_by?: number | null;
}

class Product extends Model<ProductAttributes> implements ProductAttributes {
    declare id: number;
    declare sku: string;
    declare name: string;
    declare category: string;
    declare swatch: string | null;
    declare price: number;
    declare stock_quantity: number;
    declare description: string | null;
    declare specs: Record<string, string | number> | null;
    declare bench_stats: Record<string, string | number> | null;
    declare image_url: string | null;
    declare is_active: boolean;
    declare created_by: number | null;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Product.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        sku: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        swatch: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            get() {
                const val = this.getDataValue("price" as keyof ProductAttributes);
                return val !== null && val !== undefined ? Number(val) : 0;
            },
        },
        stock_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        specs: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        bench_stats: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: User,
                key: "user_id",
            },
        },
    },
    {
        sequelize,
        modelName: "Product",
        tableName: "products",
        timestamps: true,
    }
);

Product.belongsTo(User, { foreignKey: "created_by", as: "creator" });

export default Product;

