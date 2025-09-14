/*
  # Warranty Expiry Notification System

  This migration adds support for automated warranty expiry notifications
  including email reminders and in-app notifications.
*/

-- Add notification preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_frequency text DEFAULT 'daily' CHECK (notification_frequency IN ('daily', 'weekly', 'monthly'));

-- Create table to track notification history
CREATE TABLE IF NOT EXISTS notification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('expiry_reminder', 'claim_update', 'product_added')),
  title text NOT NULL,
  message text NOT NULL,
  email_sent boolean DEFAULT false,
  in_app_sent boolean DEFAULT false,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on notification_history
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Create policies for notification_history
CREATE POLICY "Users can read own notification history"
  ON notification_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notification history"
  ON notification_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to check for expiring warranties
CREATE OR REPLACE FUNCTION check_expiring_warranties()
RETURNS TABLE (
  user_id uuid,
  user_email text,
  user_name text,
  product_id uuid,
  product_name text,
  brand text,
  model text,
  serial_number text,
  warranty_expires_at timestamptz,
  days_until_expiry integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    u.email as user_email,
    u.full_name as user_name,
    p.id as product_id,
    p.name as product_name,
    p.brand,
    p.model,
    p.serial_number,
    p.warranty_expires_at,
    EXTRACT(DAY FROM (p.warranty_expires_at - NOW()))::integer as days_until_expiry
  FROM products p
  JOIN users u ON p.user_id = u.id
  WHERE p.warranty_expires_at BETWEEN NOW() AND NOW() + INTERVAL '30 days'
    AND u.email_notifications = true
  ORDER BY p.user_id, p.warranty_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create expiry notifications
CREATE OR REPLACE FUNCTION create_expiry_notifications()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  product_count INTEGER;
BEGIN
  -- Get users with expiring warranties
  FOR user_record IN 
    SELECT DISTINCT user_id, user_email, user_name
    FROM check_expiring_warranties()
  LOOP
    -- Count products for this user
    SELECT COUNT(*) INTO product_count
    FROM check_expiring_warranties()
    WHERE user_id = user_record.user_id;
    
    -- Create in-app notification
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      read
    ) VALUES (
      user_record.user_id,
      'Warranty Expiry Alert',
      product_count || ' product(s) will expire soon. Check your dashboard for details.',
      'warning',
      false
    );
    
    -- Log notification history
    INSERT INTO notification_history (
      user_id,
      notification_type,
      title,
      message,
      in_app_sent
    ) VALUES (
      user_record.user_id,
      'expiry_reminder',
      'Warranty Expiry Alert',
      product_count || ' product(s) will expire soon.',
      true
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_warranty_expires_user ON products(user_id, warranty_expires_at);
CREATE INDEX IF NOT EXISTS idx_notification_history_user_type ON notification_history(user_id, notification_type);
CREATE INDEX IF NOT EXISTS idx_users_email_notifications ON users(email_notifications) WHERE email_notifications = true;