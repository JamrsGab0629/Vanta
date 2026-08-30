import { Op } from 'sequelize';

import Product from '../model/productModel';
import User from '../model/userModel';

import {
  CreateProductData,
  UpdateProductData,
  ProductQuery,
} from '../validators/productValidators';

import { deleteLocalImageIfExists } from '../utils/fileUtils';

// ===============================
// SERVICE ERROR
// ===============================

export class ProductServiceError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);

    this.name = 'ProductServiceError';

    this.code = code;
  }
}

// ===============================
// CREATE PRODUCT
// ===============================

export const createProductService = async (data: CreateProductData, userId: number) => {
  const existing = await Product.findOne({
    where: {
      sku: data.sku,
    },
  });

  if (existing) {
    throw new ProductServiceError(
      'PRODUCT_SKU_EXISTS',
      `Product with SKU "${data.sku}" already exists`,
    );
  }

  const product = await Product.create({
    ...data,
    created_by: userId,
  });

  return product;
};

// ===============================
// UPDATE PRODUCT
// ===============================

export const updateProductService = async (id: string, data: UpdateProductData) => {
  const product = await Product.findByPk(id);

  if (!product) {
    throw new ProductServiceError('PRODUCT_NOT_FOUND', 'Product not found');
  }

  /*
   * Keep the old image.
   *
   * We DON'T delete it yet.
   */
  const oldImage = product.image_url;

  // ===========================
  // CHECK SKU
  // ===========================

  if (data.sku && data.sku !== product.sku) {
    const existing = await Product.findOne({
      where: {
        sku: data.sku,
      },
    });

    if (existing) {
      throw new ProductServiceError(
        'PRODUCT_SKU_EXISTS',
        `SKU "${data.sku}" is already in use by another product`,
      );
    }
  }

  // ===========================
  // UPDATE DATABASE
  // ===========================

  await product.update(data);

  // ===========================
  // DELETE OLD IMAGE
  // ===========================

  if (data.image_url && data.image_url !== oldImage) {
    deleteLocalImageIfExists(oldImage);
  }

  return product;
};

// ===============================
// DELETE PRODUCT
// ===============================

export const deleteProductService = async (id: string) => {
  const product = await Product.findByPk(id);

  if (!product) {
    throw new ProductServiceError('PRODUCT_NOT_FOUND', 'Product not found');
  }

  const imageUrl = product.image_url;

  // Delete database record
  await product.destroy();

  // Delete local image
  deleteLocalImageIfExists(imageUrl);
};

// ===============================
// GET PRODUCTS
// ===============================

export const getProductsService = async (query: ProductQuery) => {
  const { category, search, minPrice, maxPrice, page, limit } = query;

  const offset = (page - 1) * limit;

  const whereClause: Record<string | symbol, any> = {
    is_active: true,
  };

  // ===========================
  // CATEGORY
  // ===========================

  if (category) {
    whereClause.category = {
      [Op.iLike]: `%${category}%`,
    };
  }

  // ===========================
  // PRICE
  // ===========================

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Record<string | symbol, any> = {};

    if (minPrice !== undefined) {
      priceFilter[Op.gte] = minPrice;
    }

    if (maxPrice !== undefined) {
      priceFilter[Op.lte] = maxPrice;
    }

    whereClause.price = priceFilter;
  }

  // ===========================
  // SEARCH
  // ===========================

  if (search) {
    whereClause[Op.or] = [
      {
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },

      {
        sku: {
          [Op.iLike]: `%${search}%`,
        },
      },

      {
        swatch: {
          [Op.iLike]: `%${search}%`,
        },
      },

      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  // ===========================
  // DATABASE QUERY
  // ===========================

  const { count, rows } = await Product.findAndCountAll({
    where: whereClause,

    order: [['createdAt', 'DESC']],

    limit,
    offset,

    include: [
      {
        model: User,

        as: 'creator',

        attributes: ['user_id', 'username', 'email'],
      },
    ],
  });

  return {
    total: count,
    page,
    limit,

    totalPages: Math.ceil(count / limit),

    products: rows,
  };
};

// ===============================
// GET PRODUCT BY ID
// ===============================

export const getProductByIdService = async (id: string) => {
  const product = await Product.findOne({
    where: {
      id,
      is_active: true,
    },

    include: [
      {
        model: User,

        as: 'creator',

        attributes: ['user_id', 'username', 'email'],
      },
    ],
  });

  if (!product) {
    throw new ProductServiceError('PRODUCT_NOT_FOUND', 'Product not found');
  }

  return product;
};

// ===============================
// GET PRODUCT BY SKU
// ===============================

export const getProductBySkuService = async (sku: string) => {
  const product = await Product.findOne({
    where: {
      sku,
      is_active: true,
    },

    include: [
      {
        model: User,

        as: 'creator',

        attributes: ['user_id', 'username', 'email'],
      },
    ],
  });

  if (!product) {
    throw new ProductServiceError('PRODUCT_NOT_FOUND', 'Product not found');
  }

  return product;
};
