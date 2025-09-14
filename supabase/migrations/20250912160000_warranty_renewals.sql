/*
  # Warranty Renewals System

  This migration adds support for warranty renewals including:
  - Renewal plans and pricing
  - Payment tracking
  - Renewal history
*/

-- Create warranty_renewals table
CREATE TABLE IF NOT EXISTS warranty_renewals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  renewal_months integer NOT NULL,
  renewal_price decimal(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('card', 'upi', 'netbanking', 'wallet')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  new_expiry_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'warranty_renewals_user_id_fkey'
  ) THEN
    ALTER TABLE warranty_renewals ADD CONSTRAINT warranty_renewals_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'warranty_renewals_product_id_fkey'
  ) THEN
    ALTER TABLE warranty_renewals ADD CONSTRAINT warranty_renewals_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE warranty_renewals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for warranty_renewals
CREATE POLICY "Users can read own warranty renewals"
  ON warranty_renewals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own warranty renewals"
  ON warranty_renewals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own warranty renewals"
  ON warranty_renewals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_warranty_renewals_user_id ON warranty_renewals(user_id);
CREATE INDEX IF NOT EXISTS idx_warranty_renewals_product_id ON warranty_renewals(product_id);
CREATE INDEX IF NOT EXISTS idx_warranty_renewals_status ON warranty_renewals(status);
CREATE INDEX IF NOT EXISTS idx_warranty_renewals_created_at ON warranty_renewals(created_at);

-- Create function to update product warranty after renewal
CREATE OR REPLACE FUNCTION update_product_warranty_after_renewal()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if renewal is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update the product's warranty period and expiry date
    UPDATE products 
    SET 
      warranty_period = warranty_period + NEW.renewal_months,
      warranty_expires_at = NEW.new_expiry_date,
      updated_at = NOW()
    WHERE id = NEW.product_id;
    
    -- Create a notification for the user
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      read
    ) VALUES (
      NEW.user_id,
      'Warranty Renewed Successfully',
      'Your warranty has been extended by ' || NEW.renewal_months || ' months.',
      'success',
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for warranty renewal updates
DROP TRIGGER IF EXISTS warranty_renewal_completed_trigger ON warranty_renewals;
CREATE TRIGGER warranty_renewal_completed_trigger
  AFTER UPDATE ON warranty_renewals
  FOR EACH ROW EXECUTE FUNCTION update_product_warranty_after_renewal();

-- Create function to get renewal statistics
CREATE OR REPLACE FUNCTION get_renewal_stats(user_id_param uuid)
RETURNS TABLE (
  total_renewals bigint,
  total_amount decimal,
  avg_renewal_months numeric,
  last_renewal_date timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_renewals,
    COALESCE(SUM(renewal_price), 0) as total_amount,
    COALESCE(AVG(renewal_months), 0) as avg_renewal_months,
    MAX(created_at) as last_renewal_date
  FROM warranty_renewals
  WHERE user_id = user_id_param AND status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;