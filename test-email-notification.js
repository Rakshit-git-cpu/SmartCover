// Test script to manually trigger email notifications
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailNotification() {
  try {
    console.log('Testing email notification system...');
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Please log in first to test notifications');
      return;
    }

    // Get user's expiring products
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const { data: expiringProducts, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        brand,
        model,
        serial_number,
        warranty_expires_at
      `)
      .eq('user_id', user.id)
      .lte('warranty_expires_at', thirtyDaysFromNow.toISOString())
      .gt('warranty_expires_at', new Date().toISOString());

    if (productsError) {
      console.error('Error fetching expiring products:', productsError.message);
      return;
    }

    if (!expiringProducts || expiringProducts.length === 0) {
      console.log('No expiring products found. Run test-dashboard-alerts.js first to create test products.');
      return;
    }

    // Prepare notification data
    const notificationData = {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.user_metadata?.full_name || 'Test User'
        }
      },
      products: expiringProducts.map(product => {
        const daysUntilExpiry = Math.ceil(
          (new Date(product.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          id: product.id,
          name: product.name,
          brand: product.brand,
          model: product.model,
          serial_number: product.serial_number,
          warranty_expires_at: product.warranty_expires_at,
          days_until_expiry: daysUntilExpiry
        };
      })
    };

    console.log('Sending test notification for:', notificationData.products.length, 'products');
    console.log('User email:', notificationData.user.email);

    // Call the warranty expiry notification function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/warranty-expiry-notification`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      }
    );

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email notification test successful!');
      console.log('Result:', result);
    } else {
      console.error('❌ Email notification test failed:', result);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testEmailNotification();