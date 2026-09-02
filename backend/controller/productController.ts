import { Request, Response } from 'express';

import { AuthenticatedRequest } from '../types/auth';

import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  formatValidationError,
} from '../validators/productValidators';

import {
  createProductService,
  updateProductService,
  deleteProductService,
  getProductsService,
  getProductByIdService,
  getProductBySkuService,
} from '../service/productService';

import { deleteLocalImageIfExists } from '../utils/fileUtils';

// ==========================================
// CREATE PRODUCT
// ==========================================

export const createProduct = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const bodyData = {
      ...req.body,
    };

    if (req.file) {
      bodyData.image_url = `/uploads/products/${req.file.filename}`;
    }

    const parsed = createProductSchema.safeParse(bodyData);

    if (!parsed.success) {
      if (req.file) {
        deleteLocalImageIfExists(bodyData.image_url);
      }

      return res.status(400).json(formatValidationError(parsed.error));
    }

    // ==========================================
    // Admin-Only Endpoints (Middleware commented for testing)
    // ==========================================

    // Get the authenticated admin's ID
    const userId = authReq.user?.userId ?? 1;

    if (!userId) {
      if (req.file) {
        deleteLocalImageIfExists(bodyData.image_url);
      }

      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    // Pass admin ID to the service
    const product = await createProductService(parsed.data, userId);

    return res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error: unknown) {
    if (req.file) {
      deleteLocalImageIfExists(`/uploads/products/${req.file.filename}`);
    }

    if (error instanceof Error && 'code' in error && error.code === 'PRODUCT_SKU_EXISTS') {
      return res.status(409).json({
        message: error.message,
      });
    }

    console.error('CREATE PRODUCT ERROR:', error);

    return res.status(500).json({
      message: 'Server error creating product',
    });
  }
};

// ==========================================
// UPDATE PRODUCT
// ==========================================

export const updateProduct = async (req: Request, res: Response) => {
  try {
    // Explicitly make id a string
    const id = req.params.id as string;

    const bodyData = {
      ...req.body,
    };

    // Add new image path
    if (req.file) {
      bodyData.image_url = `/uploads/products/${req.file.filename}`;
    }

    // Validate request data
    const parsed = updateProductSchema.safeParse(bodyData);

    if (!parsed.success) {
      if (req.file) {
        deleteLocalImageIfExists(bodyData.image_url);
      }

      return res.status(400).json(formatValidationError(parsed.error));
    }

    const product = await updateProductService(id, parsed.data);

    return res.status(200).json({
      message: 'Product updated successfully',
      is_succesful: true,
    });
  } catch (error: unknown) {
    // Delete newly uploaded image
    // if update fails
    if (req.file) {
      deleteLocalImageIfExists(`/uploads/products/${req.file.filename}`);
    }

    if (error instanceof Error && 'code' in error && error.code === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error instanceof Error && 'code' in error && error.code === 'PRODUCT_SKU_EXISTS') {
      return res.status(409).json({
        message: error.message,
      });
    }

    console.error('UPDATE PRODUCT ERROR:', error);

    return res.status(500).json({
      message: 'Server error updating product',
    });
  }
};

// ==========================================
// DELETE PRODUCT
// ==========================================

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    // Explicitly make id a string
    const id = req.params.id as string;

    await deleteProductService(id);

    return res.status(200).json({
      message: 'Product deleted successfully',
      is_succesful: true
    });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        message: error.message,
        is_succesful: false
      });
    }

    console.error('DELETE PRODUCT ERROR:', error);

    return res.status(500).json({
      message: 'Server error deleting product',
    });
  }
};

// ==========================================
// UPLOAD PRODUCT IMAGE
// ==========================================

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No image file provided',
      });
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;

    return res.status(200).json({
      message: 'Image uploaded successfully',

      imageUrl,

      filename: req.file.filename,
    });
  } catch (error) {
    console.error('IMAGE UPLOAD ERROR:', error);

    return res.status(500).json({
      message: 'Server error uploading image',
    });
  }
};

// ==========================================
// GET PRODUCTS
// ==========================================

export const getProducts = async (req: Request, res: Response) => {
  try {
    const parsed = productQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json(formatValidationError(parsed.error));
    }

    const result = await getProductsService(parsed.data);

    return res.status(200).json(result);
  } catch (error) {
    console.error('GET PRODUCTS ERROR:', error);

    return res.status(500).json({
      message: 'Server error fetching products',
    });
  }
};

// ==========================================
// GET PRODUCT BY ID
// ==========================================

export const getProductById = async (req: Request, res: Response) => {
  try {
    // Explicitly make id a string
    const id = req.params.id as string;

    const product = await getProductByIdService(id);

    return res.status(200).json({
      product,
    });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error('GET PRODUCT BY ID ERROR:', error);

    return res.status(500).json({
      message: 'Server error fetching product',
    });
  }
};

// ==========================================
// GET PRODUCT BY SKU
// ==========================================

export const getProductBySku = async (req: Request, res: Response) => {
  try {
    // Explicitly make sku a string
    const sku = req.params.sku as string;

    const product = await getProductBySkuService(sku);

    return res.status(200).json({
      product,
    });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error('GET PRODUCT BY SKU ERROR:', error);

    return res.status(500).json({
      message: 'Server error fetching product',
    });
  }
};
