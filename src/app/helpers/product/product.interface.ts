// Inputs
export interface FetchProductsInput {
  category?: string;
  page?: number;
  limit?: number;
}

export interface FetchProductInput {
  id: string;
}

export interface PublishProductInput {
  title: string;
  price: number;
  description: string;
  stock: number;
}

export interface ModifyProductQuantityInput {
  id: string;
  quantity: number;
}

export interface ModifyProductInformationInput {
  id: string;
  title?: string;
  price?: number;
  description?: string;
}

// Outputs
export interface ProductItem {
  id: string;
  title: string;
  price: number;
  description: string;
  stock: number;
  createdAt: string;
}

export interface FetchProductsOutput {
  products: ProductItem[];
  total: number;
}
