import { Request, Response } from "express";
import { Op } from "sequelize";
import path from "path";
import fs from "fs";
import Product from "../model/productModel";
import User from "../model/userModel";
import { AuthenticatedRequest } from "../types/auth";
import {
    createProductSchema,
    updateProductSchema,
    productQuerySchema,
    formatValidationError,
} from "../validators/productValidators";

const deleteLocalImageIfExists = (imageUrl?: string | null) => {
    if (!imageUrl || !imageUrl.startsWith("/uploads/products/")) return;
    const filename = path.basename(imageUrl);
    const fullPath = path.resolve(__dirname, "../uploads/products", filename);
    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
        } catch (err) {
            console.error("Failed to delete local image file:", err);
        }
    }
};

/**
 * Admin: Create a new product / hardware item
 */
export const createProduct = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const bodyData = { ...req.body };

        // Handle uploaded image file if present
        if (req.file) {
            bodyData.image_url = `/uploads/products/${req.file.filename}`;
        }

        const parsed = createProductSchema.safeParse(bodyData);
        if (!parsed.success) {
            // Clean up uploaded file on validation error
            if (req.file) deleteLocalImageIfExists(bodyData.image_url);
            return res.status(400).json(formatValidationError(parsed.error));
        }

        const existing = await Product.findOne({ where: { sku: parsed.data.sku } });
        if (existing) {
            if (req.file) deleteLocalImageIfExists(bodyData.image_url);
            return res.status(409).json({ message: `Product with SKU "${parsed.data.sku}" already exists` });
        }

        const product = await Product.create({
            ...parsed.data,
            created_by: authReq.user?.userId || null,
        });

        return res.status(201).json({
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        if (req.file) deleteLocalImageIfExists(`/uploads/products/${req.file.filename}`);
        console.error("CREATE PRODUCT ERROR:", error);
        return res.status(500).json({ message: "Server error creating product" });
    }
};

/**
 * Admin: Update an existing product
 */
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const bodyData = { ...req.body };

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (req.file) {
            // Delete previously uploaded image
            deleteLocalImageIfExists(product.image_url);
            bodyData.image_url = `/uploads/products/${req.file.filename}`;
        }

        const parsed = updateProductSchema.safeParse(bodyData);
        if (!parsed.success) {
            if (req.file) deleteLocalImageIfExists(bodyData.image_url);
            return res.status(400).json(formatValidationError(parsed.error));
        }

        if (parsed.data.sku && parsed.data.sku !== product.sku) {
            const existing = await Product.findOne({ where: { sku: parsed.data.sku } });
            if (existing) {
                if (req.file) deleteLocalImageIfExists(bodyData.image_url);
                return res.status(409).json({ message: `SKU "${parsed.data.sku}" is already in use by another product` });
            }
        }

        await product.update(parsed.data);

        return res.status(200).json({
            message: "Product updated successfully",
            product,
        });
    } catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error);
        return res.status(500).json({ message: "Server error updating product" });
    }
};

/**
 * Admin: Delete a product
 */
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        deleteLocalImageIfExists(product.image_url);
        await product.destroy();

        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("DELETE PRODUCT ERROR:", error);
        return res.status(500).json({ message: "Server error deleting product" });
    }
};

/**
 * Admin: Upload a product image locally without creating the product yet
 */
export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const imageUrl = `/uploads/products/${req.file.filename}`;
        return res.status(200).json({
            message: "Image uploaded successfully",
            imageUrl,
            filename: req.file.filename,
        });
    } catch (error) {
        console.error("IMAGE UPLOAD ERROR:", error);
        return res.status(500).json({ message: "Server error uploading image" });
    }
};

/**
 * Public: Get paginated list of products with filters
 */
export const getProducts = async (req: Request, res: Response) => {
    try {
        const parsed = productQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json(formatValidationError(parsed.error));
        }

        const { category, search, minPrice, maxPrice, page, limit } = parsed.data;
        const offset = (page - 1) * limit;

        const whereClause: Record<string | symbol, unknown> = {
            is_active: true,
        };

        if (category) {
            whereClause["category"] = { [Op.iLike]: `%${category}%` };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceFilter: Record<string | symbol, unknown> = {};
            if (minPrice !== undefined) priceFilter[Op.gte] = minPrice;
            if (maxPrice !== undefined) priceFilter[Op.lte] = maxPrice;
            whereClause["price"] = priceFilter;
        }

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { sku: { [Op.iLike]: `%${search}%` } },
                { swatch: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["user_id", "username", "email"],
                },
            ],
        });

        return res.status(200).json({
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            products: rows,
        });
    } catch (error) {
        console.error("GET PRODUCTS ERROR:", error);
        return res.status(500).json({ message: "Server error fetching products" });
    }
};

/**
 * Public: Get single product by ID
 */
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["user_id", "username", "email"],
                },
            ],
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ product });
    } catch (error) {
        console.error("GET PRODUCT BY ID ERROR:", error);
        return res.status(500).json({ message: "Server error fetching product" });
    }
};

/**
 * Public: Get single product by SKU
 */
export const getProductBySku = async (req: Request, res: Response) => {
    try {
        const { sku } = req.params;
        const product = await Product.findOne({
            where: { sku },
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["user_id", "username", "email"],
                },
            ],
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ product });
    } catch (error) {
        console.error("GET PRODUCT BY SKU ERROR:", error);
        return res.status(500).json({ message: "Server error fetching product" });
    }
};

