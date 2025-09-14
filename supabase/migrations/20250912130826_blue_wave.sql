/*
  # Fix products table and related functionality

  1. New Tables
    - Ensure `products` table exists with all required columns
    - Ensure `warranty_claims` table exists
    - Ensure `notifications` table exists
  
  2. Security
    - Enable RLS on all tables
    - Add proper policies for authenticated users
  
  3. Storage
    - Create storage bucket for invoices
*/

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  serial_number text NOT NULL,
  purchase_date date NOT NULL,
  warranty_period integer NOT NULL DEFAULT 12,
  warranty_expires_at timestamptz NOT NULL,
  invoice_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create warranty_claims table if it doesn't exist
CREATE TABLE IF NOT EXISTS warranty_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  problem_description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  contact_phone text,
  preferred_contact_method text DEFAULT 'email',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_user_id_fkey'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'warranty_claims_user_id_fkey'
  ) THEN
    ALTER TABLE warranty_claims ADD CONSTRAINT warranty_claims_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'warranty_claims_product_id_fkey'
  ) THEN
    ALTER TABLE warranty_claims ADD CONSTRAINT warranty_claims_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'notifications_user_id_fkey'
  ) THEN
    ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can read own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

DROP POLICY IF EXISTS "Users can insert own warranty claims" ON warranty_claims;
DROP POLICY IF EXISTS "Users can read own warranty claims" ON warranty_claims;
DROP POLICY IF EXISTS "Users can update own warranty claims" ON warranty_claims;

DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Create policies for products
CREATE POLICY "Users can insert own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for warranty_claims
CREATE POLICY "Users can insert own warranty claims"
  ON warranty_claims
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own warranty claims"
  ON warranty_claims
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own warranty claims"
  ON warranty_claims
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add check constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'warranty_claims_status_check'
  ) THEN
    ALTER TABLE warranty_claims ADD CONSTRAINT warranty_claims_status_check 
    CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'warranty_claims_preferred_contact_method_check'
  ) THEN
    ALTER TABLE warranty_claims ADD CONSTRAINT warranty_claims_preferred_contact_method_check 
    CHECK (preferred_contact_method IN ('email', 'phone', 'sms'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'notifications_type_check'
  ) THEN
    ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN ('info', 'success', 'warning', 'error'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_warranty_expires ON products(warranty_expires_at);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_user_id ON warranty_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_product_id ON warranty_claims(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);

-- Create storage bucket for invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for invoices
CREATE POLICY IF NOT EXISTS "Users can upload invoices"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'invoices' AND starts_with(name, auth.uid()::text || '/'));

CREATE POLICY IF NOT EXISTS "Users can view own invoices"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'invoices' AND starts_with(name, auth.uid()::text || '/'));