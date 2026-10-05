export interface ProductSpecs {
  key_spec: string;
  [key: string]: any;
}

export interface ProductModel {
  price: number;
  product_id: number;
  sku: string;
  name: string;
  category: string;
  stock_quantity: number;
  description: string;
  specs: ProductSpecs;
  image_url: string;
  created_by: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemModel {
  order_item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  product: ProductModel;
}

export interface OrderModel {
  order_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  address: string;
  contact_number: string;
  order_date: string;
  delivered_at: string | null;
  status: string;
  items: OrderItemModel[];
}

export interface ReceiptModel {
  receipt_id: number;
  order_id: number;
  receipt_date: string;
  subtotal: string;
  shipping_fee: string;
  tax: string;
  gross_price: string;
  total_price: string;
  cash_received: number | null;
  change_amount: number | null;
  Order: OrderModel;
}

export interface TransactionModel {
  transaction_id: number;
  receipt_id: number;
  tracking_code: string;
  status: string;
  updated_at: string;
  Receipt: ReceiptModel;
}

export interface TransactionsOutput {
  success: boolean;
  count: number;
  transactions: TransactionModel[];
}

// INPUT

export interface TransactionInformation {
  first_name: string,
  last_name: string,
  address: string,
  contact_number: string,
  save_address: boolean,
}

export interface EditStatus {
  transaction_id: string,
  status: string,
}

// Output

export interface TransactionModel {
  transaction_id: number,
  tracking_code: string,
  status: string,
  receipt_date: string,
  updated_at: string,
  total_price: number,
}

export interface TransactionsOutput {
  message: string,
  success: boolean,
  count: number,
  transactions: TransactionModel[],
}