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
  transaction_id: string,
  tracking_code: String,
  status: string,
  receipt_date: string,
  updated_at: string,
  total_price: number,
}

export interface TransactionsOutput {
  message: string,
  success: boolean,
  count: boolean,
  transactions: TransactionModel[],
}