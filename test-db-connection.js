// Simple test script to verify database connection
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

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can connect
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth status:', user ? 'Connected' : 'Not authenticated');
    
    // Test 2: Check if products table exists and is accessible
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (productsError) {
      console.error('Products table error:', productsError.message);
    } else {
      console.log('Products table: OK');
    }
    
    // Test 3: Check if storage bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Storage error:', bucketsError.message);
    } else {
      const invoicesBucket = buckets.find(b => b.id === 'invoices');
      console.log('Invoices bucket:', invoicesBucket ? 'OK' : 'Missing');
    }
    
    console.log('Database connection test completed.');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testConnection();