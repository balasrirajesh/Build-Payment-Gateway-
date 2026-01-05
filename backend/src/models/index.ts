export interface Order {
  id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, any>; // JSON object
  status: 'created' | 'attempted' | 'paid';
  created_at: Date;
}

export interface CreateOrderDTO {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}