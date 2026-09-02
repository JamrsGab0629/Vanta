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
      baseURL: 'http://localhost:3000',
      timeout: 10000,
      withCredentials: true, // <-- Automatically sends & receives HttpOnly cookies cross-origin
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configure retry logic (3 retries on network/5xx errors)
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status ? error.response.status >= 500 : false)
        );
      },
    });
  }

  async fetcher<T = any>(
    path: string,
    method: Method,
    payload?: any,
    options?: AxiosRequestConfig,
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
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message;
        if (serverMessage) {
          throw new Error(serverMessage);
        }
      }

      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error('An unexpected error occurred.');
    }
  }
}