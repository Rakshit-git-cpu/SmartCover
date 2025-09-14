// Test script to create test products with expiring warranties
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

async function createTestProducts() {
  try {
    console.log('Creating test products with expiring warranties...');
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Please log in first to create test products');
      return;
    }

    // Create test products with different expiry dates
    const testProducts = [
      {
        name: 'Test iPhone 15 Pro',
        brand: 'Apple',
        model: 'iPhone 15 Pro 128GB',
        serial_number: 'TEST-IPHONE-001',
        purchase_date: '2024-01-01',
        warranty_period: 12,
        warranty_expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      },
      {
        name: 'Test MacBook Pro',
        brand: 'Apple',
        model: 'MacBook Pro 14" M3',
        serial_number: 'TEST-MBP-002',
        purchase_date: '2024-01-01',
        warranty_period: 12,
        warranty_expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      },
      {
        name: 'Test Samsung Galaxy',
        brand: 'Samsung',
        model: 'Galaxy S24 Ultra',
        serial_number: 'TEST-SAMSUNG-003',
        purchase_date: '2024-01-01',
        warranty_period: 12,
        warranty_expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
      },
      {
        name: 'Test Dell Laptop',
        brand: 'Dell',
        model: 'XPS 13',
        serial_number: 'TEST-DELL-004',
        purchase_date: '2024-01-01',
        warranty_period: 12,
        warranty_expires_at: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days from now (should not show)
      }
    ];

    // Insert test products
    const { data, error } = await supabase
      .from('products')
      .insert(testProducts.map(product => ({
        ...product,
        user_id: user.id
      })));

    if (error) {
      console.error('Error creating test products:', error.message);
      return;
    }

    console.log('✅ Test products created successfully!');
    console.log('Now refresh your dashboard to see the expiry alerts.');
    console.log('\nTest products created:');
    testProducts.forEach((product, index) => {
      const daysUntilExpiry = Math.ceil((new Date(product.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      console.log(`${index + 1}. ${product.brand} ${product.model} - ${daysUntilExpiry} days until expiry`);
    });

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

createTestProducts();