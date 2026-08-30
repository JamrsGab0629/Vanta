import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import axiosRetry from 'axios-retry';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.yourdomain.com', // Adjust or remove your base URL here
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configure retry logic (3 retries on network/5xx errors)
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on network errors or 5xx server status codes
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               (error.response?.status ? error.response.status >= 500 : false);
      },
    });
  }

  /**
   * Generic fetcher function
   * @param path API route path (e.g., "/api/path/of/data")
   * @param method HTTP method ("GET", "POST", "PUT", "DELETE", etc.)
   * @param payload Request body for POST/PUT/PATCH or URL parameters for GET/DELETE
   */
  async fetcher<T = any>(
    path: string,
    method: Method,
    payload?: any,
    options?: AxiosRequestConfig
  ): Promise<T> {
    const normalizedMethod = method.toUpperCase() as Method;
    const isPayloadParam = ['GET', 'DELETE', 'HEAD', 'OPTIONS'].includes(normalizedMethod);

    const config: AxiosRequestConfig = {
      url: path,
      method: normalizedMethod,
      [isPayloadParam ? 'params' : 'data']: payload,
      ...options,
    };

    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      // Custom error handling can be added here
      throw error;
    }
  }
}
