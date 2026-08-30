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
    public id!: number;
    public sku!: string;
    public name!: string;
    public category!: string;
    public swatch!: string | null;
    public price!: number;
    public stock_quantity!: number;
    public description!: string | null;
    public specs!: Record<string, string | number> | null;
    public bench_stats!: Record<string, string | number> | null;
    public image_url!: string | null;
    public is_active!: boolean;
    public created_by!: number | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
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

