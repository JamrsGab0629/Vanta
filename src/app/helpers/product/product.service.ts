import { Injectable, inject } from '@angular/core';
import { CoreService } from '../core.service'; // Path to your Core service
import {
  FetchProductsInput,
  FetchProductsOutput,
  FetchProductInput,
  PublishProductInput,
  ModifyProductQuantityInput,
  ModifyProductInformationInput,
  ProductItem,
} from './product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private core = inject(CoreService);
  private baseUrl = 'api/products/';

  /**
   * GET api/products/fetch-products
   */
  async fetchProducts(input?: FetchProductsInput): Promise<FetchProductsOutput> {
    return this.core.fetcher<FetchProductsOutput>(
      `${this.baseUrl}fetch-products`,
      'GET',
      input
    );
  }

  /**
   * GET api/products/fetch-product
   */
  async fetchProduct(input: FetchProductInput): Promise<ProductItem> {
    return this.core.fetcher<ProductItem>(
      `${this.baseUrl}fetch-product`,
      'GET',
      input
    );
  }

  /**
   * POST api/products/publish-product
   */
  async publishProduct(input: PublishProductInput): Promise<ProductItem> {
    return this.core.fetcher<ProductItem>(
      `${this.baseUrl}publish-product`,
      'POST',
      input
    );
  }

  /**
   * PUT api/products/modify-product-quantity
   */
  async modifyProductQuantity(input: ModifyProductQuantityInput): Promise<ProductItem> {
    return this.core.fetcher<ProductItem>(
      `${this.baseUrl}modify-product-quantity`,
      'PUT',
      input
    );
  }

  /**
   * PUT api/products/modify-product-information
   */
  async modifyProductInformation(input: ModifyProductInformationInput): Promise<ProductItem> {
    return this.core.fetcher<ProductItem>(
      `${this.baseUrl}modify-product-information`,
      'PUT',
      input
    );
  }
}
