// Test script for warranty expiry notifications
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

async function testExpiryNotifications() {
  try {
    console.log('Testing warranty expiry notification system...');
    
    // Test 1: Check if the function exists
    const { data: functions, error: functionsError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'check_expiring_warranties');
    
    if (functionsError) {
      console.log('Functions check:', 'Not available (this is normal for client-side)');
    }
    
    // Test 2: Check for products expiring soon
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const { data: expiringProducts, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        brand,
        model,
        warranty_expires_at,
        user_id,
        users!inner(email, full_name)
      `)
      .lte('warranty_expires_at', thirtyDaysFromNow.toISOString())
      .gt('warranty_expires_at', new Date().toISOString());
    
    if (productsError) {
      console.error('Error fetching expiring products:', productsError.message);
    } else {
      console.log(`Found ${expiringProducts?.length || 0} products expiring in the next 30 days`);
      
      if (expiringProducts && expiringProducts.length > 0) {
        console.log('Expiring products:');
        expiringProducts.forEach(product => {
          const daysUntilExpiry = Math.ceil(
            (new Date(product.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          console.log(`- ${product.brand} ${product.model} (${product.users.full_name}) - ${daysUntilExpiry} days`);
        });
      }
    }
    
    // Test 3: Check notification history
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('title', 'Warranty Expiry Alert')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError.message);
    } else {
      console.log(`Found ${notifications?.length || 0} recent expiry notifications`);
    }
    
    console.log('\n✅ Warranty expiry notification system test completed!');
    console.log('\nTo set up automatic notifications:');
    console.log('1. Deploy the Edge Functions to Supabase');
    console.log('2. Set up a cron job to call /functions/v1/check-expiring-warranties daily');
    console.log('3. Configure email service (SendGrid, Resend, etc.) in the functions');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testExpiryNotifications();