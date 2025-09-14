/*
  # Disable Email Confirmation for User Registration

  This migration disables email confirmation requirement for new user signups.
  Users will be able to register and immediately access the application.
*/

-- Disable email confirmation requirement
-- This allows users to sign up without needing to verify their email
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_email_confirmations = false,
  enable_email_change_confirmations = false
WHERE id = 1;

-- Alternative approach: Update the auth.users table to mark users as confirmed by default
-- This ensures that newly created users are immediately active
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark the user as confirmed immediately upon creation
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm users
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auto_confirm_user();

-- Update existing unconfirmed users to be confirmed
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Create a function to handle user confirmation bypass
CREATE OR REPLACE FUNCTION bypass_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure user is immediately confirmed
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to bypass email confirmation
DROP TRIGGER IF EXISTS bypass_email_confirmation_trigger ON auth.users;
CREATE TRIGGER bypass_email_confirmation_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION bypass_email_confirmation();