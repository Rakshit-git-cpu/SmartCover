export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  brand: string;
  model: string;
  serial_number: string;
  purchase_date: string;
  warranty_period: number; // in months
  invoice_url?: string;
  created_at: string;
  warranty_expires_at: string;
}

export interface WarrantyClaim {
  id: string;
  user_id: string;
  product_id: string;
  problem_description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  created_at: string;
  resolved_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  created_at: string;
}