// Inputs
export interface FetchProductsInput {
  category?: string;
  page?: number;
  limit?: number;
  is_active?: boolean | string;
}

export interface FetchProductInput {
  id: number;
}

export interface PublishProductInput {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  description?: string | null;
  specs?: Record<string, string | number> | null;
  image_url?: string | null;
  created_by?: number | null;
}

export interface ModifyProductQuantityInput {
  id: number;
  stock_quantity: number;
}

export interface ModifyProductInformationInput {
  product_id: string;
  sku?: string;
  name?: string;
  category?: string;
  price?: number;
  description?: string | null;
  stock_quantity?: number;
  specs?: Record<string, string | number> | null;
  image_url?: string | null;
}

// Outputs
export interface ProductItem {
  product_id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  description: string | null;
  specs: Record<string, string | number> | null;
  image_url: string | null;
  created_by: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FetchProductsOutput {
  products: ProductItem[];
  total: number;
}

export interface UploadImageOutput {
  message?: string;
  imageUrl?: string;
  url?: string;
  filename?: string;
}