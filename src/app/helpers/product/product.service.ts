import { Injectable, inject } from '@angular/core';
import { CoreService } from '../core.service';
import {
  FetchProductsInput,
  FetchProductsOutput,
  PublishProductInput,
  ModifyProductInformationInput,
  ProductItem,
} from './product.interface';

export interface UploadImageOutput {
  message?: string;
  imageUrl?: string;
  url?: string;
  filename?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private core = inject(CoreService);
  private baseUrl = 'api/products/';

  /**
   * GET api/products/
   * Fetch all products (supports query params if needed)
   */
  async getProducts(queryParams?: FetchProductsInput): Promise<FetchProductsOutput> {
    return this.core.fetcher<FetchProductsOutput>(
      this.baseUrl,
      'GET',
      queryParams
    );
  }

  /**
   * GET api/products/:id
   * Fetch a single product by ID
   */
  async getProductById(id: string): Promise<ProductItem> {
    return this.core.fetcher<ProductItem>(
      `${this.baseUrl}${id}`,
      'GET'
    );
  }

  /**
   * GET api/products/sku/:sku
   * Fetch a single product by SKU
   */
  async getProductBySku(sku: string): Promise<ProductItem> {
    return this.core.fetcher<ProductItem>(
      `${this.baseUrl}sku/${sku}`,
      'GET'
    );
  }

  /**
   * POST api/products/upload-image
   * Upload image endpoint
   */
  async uploadImage(file: File): Promise<UploadImageOutput> {
    const formData = new FormData();
    formData.append('image', file);

    return this.core.fetcher<UploadImageOutput>(
      `${this.baseUrl}upload-image`,
      'POST',
      formData
    );
  }

  /**
   * POST api/products/
   * Creates a product. Handles both plain JSON objects and FormData (if including image file directly)
   */
  async createProduct(input: PublishProductInput | FormData): Promise<ProductItem> {
    return this.core.fetcher<ProductItem>(
      this.baseUrl,
      'POST',
      input
    );
  }

  /**
   * PUT api/products/:id
   * Updates product details by ID
   */
  async updateProduct(
    id: string,
    input: Partial<ModifyProductInformationInput> | FormData
  ): Promise<{ message: string, is_succesful?: boolean }> {
    return this.core.fetcher<{ message: string, is_succesful?: boolean }>(
      `${this.baseUrl}${id}`,
      'PUT',
      input
    );
  }

  /**
   * DELETE api/products/:id
   * Deletes a product by ID
   */
  async deleteProduct(id: string): Promise<{ message: string, is_succesful: boolean }> {
    return this.core.fetcher<{ message: string, is_succesful: boolean }>(
      `${this.baseUrl}${id}`,
      'DELETE'
    );
  }
}